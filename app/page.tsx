"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { HamburgerMenu } from "@/components/hamburger-menu"

export default function HomePage() {
  const [email, setEmail] = useState("")
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) {
      router.push("/upload")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && email.trim()) {
      router.push("/upload")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col items-center justify-center p-4">
      <HamburgerMenu />
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Image
            src="/glintlab-logo.png"
            alt="GlintLab Logo"
            width={300}
            height={100}
            className="mx-auto mb-8"
            priority
          />
        </div>

        <Card className="w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-slate-800">Welcome to GlintLab</CardTitle>
            <CardDescription>Sign in with your email to start creating visualizations</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full text-center text-lg py-6"
                  autoFocus
                />
              </div>
              <Button
                type="submit"
                className="w-full py-6 text-lg bg-teal-600 hover:bg-teal-700"
                disabled={!email.trim()}
              >
                Continue
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
