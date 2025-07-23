import { NextResponse } from "next/server"
import { pool } from "@/lib/db"

export async function POST() {
  try {
    console.log("🚀 Starting database setup...")

    // Test connection first
    console.log("🧪 Testing database connection...")
    await pool.query("SELECT NOW() as current_time")
    console.log("✅ Database connection successful")

    // Check if table exists
    console.log("🔍 Checking if images table exists...")
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'images'
      );
    `)

    if (tableCheck.rows[0].exists) {
      console.log("ℹ️ Images table already exists")
      return NextResponse.json({
        success: true,
        message: "Database table already exists and is ready to use!",
        tableExists: true,
      })
    }

    // Create images table
    console.log("📝 Creating images table...")
    const createTableQuery = `
      CREATE TABLE images (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        original_name VARCHAR(255) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        file_size BIGINT NOT NULL,
        mime_type VARCHAR(100) NOT NULL,
        uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `

    await pool.query(createTableQuery)
    console.log("✅ Images table created successfully")

    // Create indexes
    console.log("📊 Creating indexes...")
    await pool.query("CREATE INDEX idx_images_uploaded_at ON images(uploaded_at DESC);")
    await pool.query("CREATE INDEX idx_images_name ON images(name);")
    console.log("✅ Indexes created successfully")

    // Verify table creation
    const verifyQuery = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'images' 
      ORDER BY ordinal_position;
    `)

    console.log("✅ Table verification complete:", verifyQuery.rows.length, "columns")

    return NextResponse.json({
      success: true,
      message: "Database setup completed successfully! You can now upload images.",
      tableCreated: true,
      columns: verifyQuery.rows,
    })
  } catch (error) {
    console.error("💥 Database setup error:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Database setup failed",
        details: error.message,
        code: error.code,
      },
      { status: 500 },
    )
  }
}
