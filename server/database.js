import Database from 'better-sqlite3';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, 'calendar_vibes.db');

// Initialize SQLite Database
const db = new Database(dbPath);

// Enable foreign keys and WAL mode for better concurrency
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');

// ===== SCHEMA =====

const initSchema = () => {
    // Users table (for multi-user scalability)
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            google_id TEXT UNIQUE NOT NULL,
            email TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // OAuth Tokens (encrypted in production)
    db.exec(`
        CREATE TABLE IF NOT EXISTS oauth_tokens (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            access_token TEXT NOT NULL,
            refresh_token TEXT,
            expiry_date INTEGER,
            token_type TEXT DEFAULT 'Bearer',
            scope TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

    // Category Cache (AI classification results)
    db.exec(`
        CREATE TABLE IF NOT EXISTS category_cache (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            canonical_key TEXT UNIQUE NOT NULL,
            meta_category TEXT NOT NULL CHECK(meta_category IN ('INVESTMENT', 'RECOVERY', 'MAINTENANCE', 'PASSIVE')),
            display_name TEXT NOT NULL,
            user_id INTEGER DEFAULT 1, -- For multi-user: link to specific user's preferences
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

    // Index for fast lookups
    db.exec(`
        CREATE INDEX IF NOT EXISTS idx_category_canonical ON category_cache(canonical_key);
        CREATE INDEX IF NOT EXISTS idx_category_user ON category_cache(user_id);
        CREATE INDEX IF NOT EXISTS idx_oauth_user ON oauth_tokens(user_id);
    `);

    console.log('[DB] Schema initialized');
};

// ===== USERS =====

export const getOrCreateUser = (googleId, email = null) => {
    const stmt = db.prepare('SELECT * FROM users WHERE google_id = ?');
    let user = stmt.get(googleId);

    if (!user) {
        const insert = db.prepare('INSERT INTO users (google_id, email) VALUES (?, ?)');
        const result = insert.run(googleId, email);
        user = { id: result.lastInsertRowid, google_id: googleId, email };
        console.log(`[DB] Created new user: ${googleId}`);
    }

    return user;
};

// ===== OAUTH TOKENS =====

export const saveTokens = (userId, tokens) => {
    // SQLite-compatible upsert: Delete existing, then insert
    const deleteStmt = db.prepare('DELETE FROM oauth_tokens WHERE user_id = ?');
    const insertStmt = db.prepare(`
        INSERT INTO oauth_tokens (user_id, access_token, refresh_token, expiry_date, scope)
        VALUES (?, ?, ?, ?, ?)
    `);

    const transaction = db.transaction(() => {
        deleteStmt.run(userId);
        insertStmt.run(
            userId,
            tokens.access_token,
            tokens.refresh_token || null,
            tokens.expiry_date || null,
            tokens.scope || null
        );
    });

    transaction();
    console.log(`[DB] Saved tokens for user ${userId}`);
};

export const getTokens = (userId) => {
    const stmt = db.prepare('SELECT * FROM oauth_tokens WHERE user_id = ? ORDER BY created_at DESC LIMIT 1');
    const row = stmt.get(userId);

    if (!row) return null;

    return {
        access_token: row.access_token,
        refresh_token: row.refresh_token,
        expiry_date: row.expiry_date,
        token_type: row.token_type,
        scope: row.scope
    };
};

// ===== CATEGORY CACHE =====

export const getCategoryCache = (userId = 1) => {
    const stmt = db.prepare('SELECT canonical_key, meta_category, display_name FROM category_cache WHERE user_id = ?');
    const rows = stmt.all(userId);

    const cache = {};
    rows.forEach(row => {
        cache[row.canonical_key] = row.meta_category;
        // Also store display_name separately if needed (for future enhancement)
    });

    return cache;
};

export const setCategoryCache = (canonicalKey, metaCategory, displayName, userId = 1) => {
    const stmt = db.prepare(`
        INSERT INTO category_cache (canonical_key, meta_category, display_name, user_id)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(canonical_key) DO UPDATE SET
            meta_category = excluded.meta_category,
            display_name = excluded.display_name,
            updated_at = CURRENT_TIMESTAMP
    `);

    stmt.run(canonicalKey, metaCategory, displayName, userId);
};

export const bulkSetCategoryCache = (entries, userId = 1) => {
    const stmt = db.prepare(`
        INSERT INTO category_cache (canonical_key, meta_category, display_name, user_id)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(canonical_key) DO UPDATE SET
            meta_category = excluded.meta_category,
            display_name = excluded.display_name,
            updated_at = CURRENT_TIMESTAMP
    `);

    const transaction = db.transaction(() => {
        entries.forEach(({ canonicalKey, metaCategory, displayName }) => {
            stmt.run(canonicalKey, metaCategory, displayName, userId);
        });
    });

    transaction();
    console.log(`[DB] Bulk inserted ${entries.length} category cache entries`);
};

// ===== MIGRATION HELPER =====

export const migrateFromLowDB = (lowdbData) => {
    console.log('[DB] Starting migration from LowDB...');

    // Migrate tokens
    if (lowdbData.tokens) {
        const user = getOrCreateUser('default_user', null);
        saveTokens(user.id, lowdbData.tokens);
    }

    // Migrate category cache
    if (lowdbData.category_cache) {
        const entries = Object.entries(lowdbData.category_cache).map(([key, meta]) => ({
            canonicalKey: key,
            metaCategory: meta,
            displayName: key // Use canonical key as display name for migration
        }));

        if (entries.length > 0) {
            bulkSetCategoryCache(entries, 1);
        }
    }

    console.log('[DB] Migration complete!');
};

// Initialize schema on import
initSchema();

export default db;
