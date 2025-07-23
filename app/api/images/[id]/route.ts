import { type NextRequest, NextResponse } from "next/server"
import { pool } from "@/lib/db"
import { FileStorage } from "@/lib/file-storage"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Get image record first
    const selectQuery = "SELECT * FROM images WHERE id = $1"
    const selectResult = await pool.query(selectQuery, [id])

    if (selectResult.rows.length === 0) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 })
    }

    const imageRecord = selectResult.rows[0]

    // Delete file from storage
    await FileStorage.deleteFile(imageRecord.file_path)

    // Delete record from database
    const deleteQuery = "DELETE FROM images WHERE id = $1"
    await pool.query(deleteQuery, [id])

    console.log("🗑️ Image deleted:", id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete error:", error)
    return NextResponse.json({ error: "Failed to delete image" }, { status: 500 })
  }
}
