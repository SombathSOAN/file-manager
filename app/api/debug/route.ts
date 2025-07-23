import { NextResponse } from "next/server"

export async function GET() {
  // Always return a successful response with debug info
  const debugInfo = {
    timestamp: new Date().toISOString(),
    status: "Debug endpoint working",
    environment: {
      NODE_ENV: process.env.NODE_ENV || "not set",
      hasDatabase: !!process.env.DATABASE_URL,
      hasPublicDatabase: !!process.env.DATABASE_PUBLIC_URL,
      uploadDir: process.env.UPLOAD_DIR || "not set",
    },
    connectionStrings: {
      DATABASE_URL: process.env.DATABASE_URL ? "Present (hidden)" : "Missing",
      DATABASE_PUBLIC_URL: process.env.DATABASE_PUBLIC_URL ? "Present (hidden)" : "Missing",
    },
    tests: [],
    recommendation: "Basic debug info collected successfully",
  }

  // Try to test database connections safely
  try {
    const { Pool } = await import("pg")

    // Test DATABASE_URL if available
    if (process.env.DATABASE_URL) {
      try {
        const pool = new Pool({
          connectionString: process.env.DATABASE_URL,
          ssl: { rejectUnauthorized: false },
          connectionTimeoutMillis: 3000,
        })

        const result = await pool.query("SELECT 1 as test")
        await pool.end()

        debugInfo.tests.push({
          name: "DATABASE_URL",
          status: "✅ Connected",
          result: "Connection successful",
        })
      } catch (error) {
        debugInfo.tests.push({
          name: "DATABASE_URL",
          status: "❌ Failed",
          error: error.message,
        })
      }
    }

    // Test DATABASE_PUBLIC_URL if available
    if (process.env.DATABASE_PUBLIC_URL) {
      try {
        const pool = new Pool({
          connectionString: process.env.DATABASE_PUBLIC_URL,
          ssl: { rejectUnauthorized: false },
          connectionTimeoutMillis: 3000,
        })

        const result = await pool.query("SELECT 1 as test")
        await pool.end()

        debugInfo.tests.push({
          name: "DATABASE_PUBLIC_URL",
          status: "✅ Connected",
          result: "Connection successful",
        })
      } catch (error) {
        debugInfo.tests.push({
          name: "DATABASE_PUBLIC_URL",
          status: "❌ Failed",
          error: error.message,
        })
      }
    }

    // Update recommendation based on results
    const hasWorkingConnection = debugInfo.tests.some((test) => test.status.includes("✅"))
    if (hasWorkingConnection) {
      debugInfo.recommendation = "✅ Database connection working! Ready to setup tables."
    } else if (debugInfo.tests.length > 0) {
      debugInfo.recommendation = "❌ Database connections failing. Check Railway database service."
    } else {
      debugInfo.recommendation = "⚠️ No database environment variables found."
    }
  } catch (importError) {
    debugInfo.tests.push({
      name: "Database Import",
      status: "❌ Failed",
      error: `Cannot import pg module: ${importError.message}`,
    })
    debugInfo.recommendation = "❌ Database module not available."
  }

  return NextResponse.json(debugInfo, { status: 200 })
}
