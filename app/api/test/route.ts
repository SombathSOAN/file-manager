import { NextResponse } from "next/server"

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      message: "API is working",
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        hasDatabase: !!process.env.DATABASE_URL || !!process.env.DATABASE_PUBLIC_URL,
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Test endpoint failed",
        details: error.message,
      },
      { status: 200 },
    )
  }
}
