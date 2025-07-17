import { NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get("file") as File
  if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 })

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const dataDir = path.join(process.cwd(), "data")
  await fs.mkdir(dataDir, { recursive: true })
  const filePath = path.join(dataDir, file.name)
  await fs.writeFile(filePath, buffer)
  return NextResponse.json({ success: true, file: file.name })
} 