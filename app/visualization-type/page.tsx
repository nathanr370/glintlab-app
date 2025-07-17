"use client"

import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Grid3X3, Box, BarChart3, AlignLeft } from "lucide-react"
import { HamburgerMenu } from "@/components/hamburger-menu"

export default function VisualizationTypePage() {
  const router = useRouter()

  const visualizationTypes = [
    {
      id: "heatmap",
      name: "Heatmap",
      description: "Show data density and patterns with color intensity",
      icon: Grid3X3,
    },
    {
      id: "box_and_scatter",
      name: "Box and Scatter",
      description: "Box plot with overlaid scatter plot for distribution and outliers",
      icon: BarChart3,
    },
    {
      id: "box_whisker",
      name: "Box Whisker",
      description: "Box plot only (no scatter)",
      icon: Box,
    },
    {
      id: "histogram",
      name: "Histogram",
      description: "Visualize the distribution of values in bins",
      icon: AlignLeft,
    },
  ]

  const handleSelection = (type: string) => {
    localStorage.setItem("selectedVisualization", type)
    router.push("/results")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col items-center justify-center p-4">
      <HamburgerMenu />
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center">
          <Image src="/glintlab-logo.png" alt="GlintLab Logo" width={250} height={80} className="mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Choose Your Visualization</h1>
          <p className="text-slate-600">Select the type of chart that best fits your data</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {visualizationTypes.map((type) => {
            const IconComponent = type.icon
            return (
              <Card
                key={type.id}
                className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 border-2 hover:border-teal-300"
                onClick={() => handleSelection(type.id)}
              >
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 p-3 bg-teal-100 rounded-full w-fit">
                    <IconComponent className="w-8 h-8 text-teal-600" />
                  </div>
                  <CardTitle className="text-xl text-slate-800">{type.name}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-sm">{type.description}</CardDescription>
                  <Button
                    className="mt-4 w-full bg-teal-600 hover:bg-teal-700"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSelection(type.id)
                    }}
                  >
                    Select
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
