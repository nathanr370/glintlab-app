import { NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

export async function POST() {
  const dataDir = path.join(process.cwd(), "data")
  const outputDir = path.join(process.cwd(), "output")
  // Remove all files in data and output
  await Promise.all([dataDir, outputDir].map(async dir => {
    try {
      const files = await fs.readdir(dir)
      await Promise.all(files.map(f => fs.unlink(path.join(dir, f))))
    } catch {}
  }))
  return NextResponse.json({ success: true })
} 