import Database from "better-sqlite3";
import { join } from "path";

const DB_PATH = join(__dirname, "../../data/linkedin-agent.db");

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    const { mkdirSync } = require("fs");
    mkdirSync(join(__dirname, "../../data"), { recursive: true });

    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    initTables(db);
  }
  return db;
}

function initTables(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS published_posts (
      id TEXT PRIMARY KEY,
      draft_id TEXT NOT NULL,
      option_id TEXT NOT NULL,
      news_id TEXT NOT NULL,
      sector TEXT,
      hook_type TEXT,
      tone TEXT,
      format TEXT,
      full_text TEXT NOT NULL,
      linkedin_post_id TEXT,
      published_at TEXT NOT NULL,
      impressions INTEGER DEFAULT 0,
      likes INTEGER DEFAULT 0,
      comments INTEGER DEFAULT 0,
      reposts INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS post_metrics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id TEXT NOT NULL,
      measured_at TEXT NOT NULL,
      impressions INTEGER DEFAULT 0,
      likes INTEGER DEFAULT 0,
      comments INTEGER DEFAULT 0,
      reposts INTEGER DEFAULT 0,
      FOREIGN KEY (post_id) REFERENCES published_posts(id)
    );
  `);
}
