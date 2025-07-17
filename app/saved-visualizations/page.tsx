"use client"

import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { HamburgerMenu } from "@/components/hamburger-menu"
import { Calendar, Download, Eye, FolderOpen } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function SavedVisualizationsPage() {
  const savedVisualizations = [
    {
      id: 1,
      title: "PTK7 Membrane Analysis",
      type: "Heatmap",
      description: "Cell percentage analysis across membrane positions",
      image: "/heatmap-example.png",
      createdAt: "2024-06-26",
      parameters: ["Custom Ordering", "Color Palette"],
    },
    {
      id: 2,
      title: "Heart Chamber Fiber Analysis",
      type: "Stacked Bar",
      description: "Muscle fiber proportion distribution by heart chamber",
      image: "/stacked-chart-example.png",
      createdAt: "2024-06-25",
      parameters: ["Custom Titles", "Color Palette"],
    },
  ]

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Heatmap":
        return "bg-blue-100 text-blue-800"
      case "Stacked Bar":
        return "bg-green-100 text-green-800"
      case "Box & Whisker":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <HamburgerMenu />

      <div className="max-w-6xl mx-auto pt-16">
        <div className="text-center mb-8">
          <Image src="/glintlab-logo.png" alt="GlintLab Logo" width={250} height={80} className="mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Saved Visualizations</h1>
          <p className="text-slate-600">Your collection of generated charts and graphs</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
          {savedVisualizations.map((viz) => (
            <Card key={viz.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
              <div className="relative h-64 bg-white">
                <Image src={viz.image || "/placeholder.svg"} alt={viz.title} fill className="object-contain p-4" />
              </div>

              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg text-slate-800 mb-1">{viz.title}</CardTitle>
                    <CardDescription className="text-sm">{viz.description}</CardDescription>
                  </div>
                  <Badge className={`ml-2 ${getTypeColor(viz.type)}`}>{viz.type}</Badge>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-slate-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    Created on {new Date(viz.createdAt).toLocaleDateString()}
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {viz.parameters.map((param) => (
                      <Badge key={param} variant="outline" className="text-xs">
                        {param}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {savedVisualizations.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <FolderOpen className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">No Saved Visualizations</h3>
            <p className="text-slate-600 mb-4">You haven't created any visualizations yet.</p>
            <Button onClick={() => (window.location.href = "/")} className="bg-teal-600 hover:bg-teal-700">
              Create Your First Visualization
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
