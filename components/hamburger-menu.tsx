"use client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Menu, BarChart3, FolderOpen } from "lucide-react"

export function HamburgerMenu() {
  const router = useRouter()

  return (
    <div className="fixed top-4 right-4 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="bg-white shadow-md hover:shadow-lg">
            <Menu className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={() => router.push("/")} className="cursor-pointer">
            <BarChart3 className="mr-2 h-4 w-4" />
            <span>Generate</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/saved-visualizations")} className="cursor-pointer">
            <FolderOpen className="mr-2 h-4 w-4" />
            <span>Saved Visualizations</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
