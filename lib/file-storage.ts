
import fs from "fs/promises"
import path from "path"
import { v4 as uuidv4 } from "uuid"

export async function saveFile(file: File | null, subfolder: string = "uploads"): Promise<string | null> {
    if (!file || file.size === 0) return null

    try {
        const buffer = Buffer.from(await file.arrayBuffer())
        const filename = `${uuidv4()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
        const uploadDir = path.join(process.cwd(), "public", subfolder)

        try {
            await fs.access(uploadDir)
        } catch {
            await fs.mkdir(uploadDir, { recursive: true })
        }

        const filePath = path.join(uploadDir, filename)
        await fs.writeFile(filePath, buffer)

        return `/${subfolder}/${filename}`
    } catch (error) {
        console.error("Error saving file:", error)
        throw new Error("Erreur lors de la sauvegarde du fichier")
    }
}
