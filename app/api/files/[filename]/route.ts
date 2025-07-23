import { type NextRequest, NextResponse } from "next/server"
import { pool } from "@/lib/db"
import { FileStorage } from "@/lib/file-storage"

export async function GET(request: NextRequest, { params }: { params: { filename: string } }) {
  try {
    const { filename } = params

    // Get image record from database
    const query = "SELECT * FROM images WHERE name = $1"
    const result = await pool.query(query, [filename])

    if (result.rows.length === 0) {
      return new NextResponse("File not found", { status: 404 })
    }

    const imageRecord = result.rows[0]

    // Get file from storage
    const fileBuffer = await FileStorage.getFile(imageRecord.file_path)

    // Return file with appropriate headers
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": imageRecord.mime_type,
        "Content-Length": imageRecord.file_size.toString(),
        "Cache-Control": "public, max-age=31536000",
      },
    })
  } catch (error) {
    console.error("File serve error:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
