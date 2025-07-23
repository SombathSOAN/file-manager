import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    message: "API is working!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    hasEnvVars: {
      DATABASE_URL: !!process.env.DATABASE_URL,
      DATABASE_PUBLIC_URL: !!process.env.DATABASE_PUBLIC_URL,
    },
  })
}
