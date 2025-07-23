import { NextResponse } from "next/server"
import { pool } from "@/lib/db"
import { FileStorage } from "@/lib/file-storage"

export async function GET() {
  try {
    const query = `
      SELECT * FROM images 
      ORDER BY uploaded_at DESC
    `

    const result = await pool.query(query)

    const images = result.rows.map((row) => ({
      id: row.id,
      name: row.original_name,
      url: FileStorage.getPublicUrl(row.name),
      downloadUrl: FileStorage.getPublicUrl(row.name),
      size: row.file_size,
      uploadedAt: row.uploaded_at,
      type: row.mime_type,
    }))

    return NextResponse.json({ images })
  } catch (error) {
    console.error("Error fetching images:", error)
    return NextResponse.json({ error: "Failed to fetch images" }, { status: 500 })
  }
}
