import { type NextRequest, NextResponse } from "next/server"
import { pool } from "@/lib/db"
import { FileStorage } from "@/lib/file-storage"

export async function POST(request: NextRequest) {
  console.log("📤 Upload request started")

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    console.log(`📁 Processing file: ${file.name} (${file.size} bytes, ${file.type})`)

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 })
    }

    // Save file to storage
    const { filePath, fileName } = await FileStorage.saveFile(file)

    // Save metadata to database
    const query = `
      INSERT INTO images (name, original_name, file_path, file_size, mime_type)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `

    const values = [fileName, file.name, filePath, file.size, file.type]
    const result = await pool.query(query, values)
    const imageRecord = result.rows[0]

    console.log("✅ Upload successful:", imageRecord.id)

    // Format response
    const image = {
      id: imageRecord.id,
      name: imageRecord.original_name,
      url: FileStorage.getPublicUrl(imageRecord.name),
      downloadUrl: FileStorage.getPublicUrl(imageRecord.name),
      size: imageRecord.file_size,
      uploadedAt: imageRecord.uploaded_at,
      type: imageRecord.mime_type,
    }

    return NextResponse.json({ image })
  } catch (error) {
    console.error("💥 Upload error:", error)
    return NextResponse.json(
      {
        error: "Upload failed",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
