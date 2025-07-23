import fs from "fs/promises"
import path from "path"
import { v4 as uuidv4 } from "uuid"

const UPLOAD_DIR = process.env.UPLOAD_DIR || "/app/uploads"

export class FileStorage {
  static async ensureUploadDir() {
    try {
      await fs.access(UPLOAD_DIR)
      console.log("✅ Upload directory exists:", UPLOAD_DIR)
    } catch {
      console.log("📁 Creating upload directory:", UPLOAD_DIR)
      await fs.mkdir(UPLOAD_DIR, { recursive: true })
    }
  }

  static async saveFile(file: File): Promise<{ filePath: string; fileName: string }> {
    await this.ensureUploadDir()

    const fileExtension = path.extname(file.name)
    const fileName = `${uuidv4()}${fileExtension}`
    const filePath = path.join(UPLOAD_DIR, fileName)

    const buffer = Buffer.from(await file.arrayBuffer())
    await fs.writeFile(filePath, buffer)

    console.log("💾 File saved:", fileName)
    return { filePath, fileName }
  }

  static async deleteFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath)
      console.log("🗑️ File deleted:", filePath)
    } catch (error) {
      console.error("❌ Error deleting file:", error)
    }
  }

  static async getFile(filePath: string): Promise<Buffer> {
    return await fs.readFile(filePath)
  }

  static getPublicUrl(fileName: string): string {
    return `/api/files/${fileName}`
  }
}
