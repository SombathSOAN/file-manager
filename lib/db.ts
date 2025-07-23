import { Pool } from "pg"

// Use the public URL for external connections, internal URL for Railway-to-Railway connections
const connectionString = process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL

if (!connectionString) {
  throw new Error(
    "Database connection string not found. Please set DATABASE_PUBLIC_URL or DATABASE_URL environment variable.",
  )
}

console.log("🔗 Connecting to database:", connectionString.replace(/:[^:@]*@/, ":***@"))

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
})

// Test connection on startup
pool.on("connect", () => {
  console.log("✅ Connected to Railway PostgreSQL database")
})

pool.on("error", (err) => {
  console.error("❌ Unexpected error on idle client", err)
})

export { pool }

export interface ImageRecord {
  id: string
  name: string
  original_name: string
  file_path: string
  file_size: number
  mime_type: string
  uploaded_at: string
  created_at: string
  updated_at: string
}
