"use client"
import { useRouter } from "next/navigation"
import { useRef, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HamburgerMenu } from "@/components/hamburger-menu"

export default function UploadPage() {
  const router = useRouter()
  const fileInput = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData()
    if (fileInput.current?.files?.[0]) {
      formData.append("file", fileInput.current.files[0])
      await fetch("/api/upload", { method: "POST", body: formData })
      router.push("/visualization-type")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col items-center justify-center p-4">
      <HamburgerMenu />
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Image src="/glintlab-logo.png" alt="GlintLab Logo" width={250} height={80} className="mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Upload Your Data</h1>
          <p className="text-slate-600">Upload a CSV file to generate your visualization</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Upload CSV File</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
              <input
                type="file"
                accept=".csv"
                ref={fileInput}
                required
                onChange={e => setFileName(e.target.files?.[0]?.name || null)}
                className="mb-2"
              />
              {fileName && <div className="text-teal-600 text-sm mb-2">Selected: {fileName}</div>}
              <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700">Upload CSV</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
