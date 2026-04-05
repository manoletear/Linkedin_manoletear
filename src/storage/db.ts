import Database from "better-sqlite3";
import { join } from "path";
import { mkdirSync } from "fs";

const DB_DIR = join(__dirname, "../../data");
const DB_PATH = join(DB_DIR, "linkedin-agent.db");

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    mkdirSync(DB_DIR, { recursive: true });
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    initTables(db);
  }
  return db;
}

function initTables(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS news_items (
      id TEXT PRIMARY KEY,
      source TEXT NOT NULL,
      title TEXT NOT NULL,
      url TEXT NOT NULL UNIQUE,
      summary TEXT,
      published_at TEXT,
      canonical_text TEXT,
      status TEXT NOT NULL DEFAULT 'new',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS content_options (
      id TEXT PRIMARY KEY,
      news_item_id TEXT NOT NULL,
      angle_title TEXT NOT NULL,
      thesis TEXT NOT NULL,
      format TEXT NOT NULL,
      score REAL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (news_item_id) REFERENCES news_items(id)
    );

    CREATE TABLE IF NOT EXISTS drafts (
      id TEXT PRIMARY KEY,
      content_option_id TEXT NOT NULL,
      variant INTEGER NOT NULL,
      full_text TEXT NOT NULL,
      score REAL,
      selected INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (content_option_id) REFERENCES content_options(id)
    );

    CREATE TABLE IF NOT EXISTS published_posts (
      id TEXT PRIMARY KEY,
      draft_id TEXT,
      linkedin_post_id TEXT,
      media_type TEXT,
      media_url TEXT,
      published_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS post_metrics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      published_post_id TEXT NOT NULL,
      impressions INTEGER DEFAULT 0,
      likes INTEGER DEFAULT 0,
      comments INTEGER DEFAULT 0,
      reposts INTEGER DEFAULT 0,
      captured_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (published_post_id) REFERENCES published_posts(id)
    );

    CREATE TABLE IF NOT EXISTS memory_chunks (
      id TEXT PRIMARY KEY,
      kind TEXT NOT NULL,
      ref_id TEXT,
      content TEXT NOT NULL,
      metadata TEXT DEFAULT '{}',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}
