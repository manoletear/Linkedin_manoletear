import { v4 as uuid } from "uuid";
import {
  RankedNewsItem,
  EditorialDecision,
  ContentAngle,
  GridOption,
  UserContentProfile,
} from "../types";
import { generateAngles } from "./contentStrategist";

export async function buildGrid(
  publishableItems: { item: RankedNewsItem; decision: EditorialDecision }[],
  profile: UserContentProfile
): Promise<GridOption[]> {
  const grid: GridOption[] = [];

  for (const { item, decision } of publishableItems.slice(0, 5)) {
    const angles = await generateAngles(item, profile);
    const bestAngle = angles[0];

    grid.push({
      optionId: uuid(),
      newsId: item.id,
      headline: item.title,
      angle: bestAngle?.thesis || decision.contentAngles[0] || "",
      format: profile.preferredFormats[0] || "text",
      estimatedEngagement: Math.round(item.finalScore * 10),
      estimatedAuthorityLift: Math.round(
        (item.relevanceScore + item.noveltyScore) / 2
      ),
      reason: decision.rationale,
    });
  }

  return grid.sort((a, b) => b.estimatedEngagement - a.estimatedEngagement);
}
