import { createClient } from "npm:@supabase/supabase-js@2";

const GROQ_BASE = "https://api.groq.com/openai/v1";

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
  const groqKey = Deno.env.get("GROQ_API_KEY")!;

  try {
    // 1. Obtener noticias pendientes
    const { data: newsItems, error: fetchErr } = await supabase
      .from("news_items")
      .select("*")
      .eq("status", "new")
      .order("created_at", { ascending: false })
      .limit(10);

    if (fetchErr) throw fetchErr;
    if (!newsItems?.length) {
      return json({ message: "No new items to process", processed: 0 });
    }

    // 2. Obtener perfil del usuario
    const { data: profiles } = await supabase
      .from("user_profiles")
      .select("*")
      .limit(1);

    const profile = profiles?.[0] || {
      sectors: ["technology", "AI"],
      keywords: ["artificial intelligence", "enterprise"],
      tone: "analytical",
      target_audience: "Profesionales de tecnologia",
    };

    // 3. Scoring editorial via Groq
    const scored = [];
    for (const item of newsItems.slice(0, 5)) {
      const decision = await groqJSON(groqKey, {
        system: `Eres un editor senior de LinkedIn. Evalua si esta noticia merece un post para audiencia: ${profile.target_audience}. Sectores: ${(profile.sectors || []).join(", ")}.`,
        user: `Titulo: ${item.title}\nFuente: ${item.source}\nResumen: ${item.summary || ""}\n\nResponde JSON: { "publishWorthy": true/false, "rationale": "...", "contentAngles": ["..."], "riskFlags": ["..."] }`,
      });

      if (decision?.publishWorthy) {
        scored.push({ item, decision });
      }

      // Marcar como procesada
      await supabase
        .from("news_items")
        .update({ status: "scored" })
        .eq("id", item.id);
    }

    if (scored.length === 0) {
      // Marcar restantes como revisadas
      for (const item of newsItems) {
        await supabase
          .from("news_items")
          .update({ status: "discarded" })
          .eq("id", item.id);
      }
      return json({ message: "No publishable news found", processed: newsItems.length });
    }

    // 4. Generar borradores para las top 3
    const results = [];
    for (const { item, decision } of scored.slice(0, 3)) {
      // Guardar content option
      const { data: option } = await supabase
        .from("content_options")
        .insert({
          news_item_id: item.id,
          angle_title: decision.contentAngles?.[0] || "General",
          thesis: decision.rationale,
          format: "text",
          score: 0,
        })
        .select()
        .single();

      if (!option) continue;

      // Generar 3 borradores
      const draftsRaw = await groqJSON(groqKey, {
        system: `Actua como redactor top 1% de LinkedIn. Genera 3 versiones muy distintas de un post. Cada version: hook fuerte, desarrollo con interpretacion propia, cierre que invite comentarios. Tono: ${profile.tone}. No resumir la noticia. No sonar como IA.`,
        user: `Noticia: ${item.title}\nAngulo: ${decision.contentAngles?.[0] || decision.rationale}\nAudiencia: ${profile.target_audience}\n\nResponde JSON array: [{ "hook": "...", "body": "...", "closing": "...", "hashtags": ["..."] }]`,
      });

      const draftsArray = Array.isArray(draftsRaw) ? draftsRaw : [];
      for (let i = 0; i < draftsArray.length; i++) {
        const d = draftsArray[i];
        const fullText = `${d.hook}\n\n${d.body}\n\n${d.closing}${d.hashtags?.length ? "\n\n" + d.hashtags.map((t: string) => `#${t}`).join(" ") : ""}`;

        await supabase.from("drafts").insert({
          content_option_id: option.id,
          variant: i + 1,
          full_text: fullText,
          score: null,
        });
      }

      await supabase
        .from("news_items")
        .update({ status: "drafted" })
        .eq("id", item.id);

      results.push({
        newsId: item.id,
        title: item.title,
        optionId: option.id,
        draftsGenerated: draftsArray.length,
      });
    }

    return json({
      message: `Processed ${newsItems.length} items, generated drafts for ${results.length}`,
      results,
    });
  } catch (error) {
    return json({ error: (error as Error).message }, 500);
  }
});

// --- Helpers ---

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function groqJSON(apiKey: string, prompt: { system: string; user: string }) {
  const res = await fetch(`${GROQ_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      max_tokens: 4096,
      temperature: 0.7,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: prompt.system + "\n\nResponde EXCLUSIVAMENTE con JSON valido." },
        { role: "user", content: prompt.user },
      ],
    }),
  });

  if (!res.ok) {
    throw new Error(`Groq API error: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content || "{}";
  return JSON.parse(raw);
}
