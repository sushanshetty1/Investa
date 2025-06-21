"use client"

import * as React from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-lg blur opacity-0" />
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative h-9 w-9 rounded-lg border border-border/30 dark:border-border/20 bg-background/60 dark:bg-background/40 backdrop-blur-sm"
          disabled
        >
          <Sun className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  const getCurrentIcon = () => {
    switch (theme) {
      case "light":
        return <Sun className="h-4 w-4 text-amber-500 group-hover:scale-110 transition-all duration-300" />
      case "dark":
        return <Moon className="h-4 w-4 text-blue-400 group-hover:scale-110 transition-all duration-300" />
      default:
        return <Monitor className="h-4 w-4 text-purple-500 group-hover:scale-110 transition-all duration-300" />
    }
  }

  const getThemeGlow = () => {
    switch (theme) {
      case "light":
        return "from-amber-500/20 to-orange-500/20"
      case "dark":
        return "from-blue-500/20 to-indigo-500/20"
      default:
        return "from-purple-500/20 to-pink-500/20"
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="relative group">
          {/* Glow effect background */}
          <div className={`absolute inset-0 bg-gradient-to-r ${getThemeGlow()} rounded-lg blur opacity-0 group-hover:opacity-100 transition-all duration-300`} />
          
          <Button
            variant="ghost"
            size="icon"
            className="relative h-9 w-9 rounded-lg border border-border/30 dark:border-border/20 bg-background/60 dark:bg-background/40 backdrop-blur-sm hover:bg-accent/60 dark:hover:bg-accent/40 hover:border-primary/50 transition-all duration-300"
          >
            {getCurrentIcon()}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[8rem] bg-background/95 dark:bg-background/90 backdrop-blur-xl border border-border/50 dark:border-border/30 shadow-xl">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className="flex items-center gap-2 cursor-pointer hover:bg-accent/60 dark:hover:bg-accent/40 group rounded-lg"
        >
          <Sun className="h-4 w-4 text-amber-500 group-hover:scale-110 transition-transform duration-300" />
          <span className="group-hover:translate-x-1 transition-transform duration-300">Light</span>
          {theme === "light" && (
            <div className="ml-auto w-2 h-2 bg-amber-500 rounded-full" />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className="flex items-center gap-2 cursor-pointer hover:bg-accent/60 dark:hover:bg-accent/40 group rounded-lg"
        >
          <Moon className="h-4 w-4 text-blue-400 group-hover:scale-110 transition-transform duration-300" />
          <span className="group-hover:translate-x-1 transition-transform duration-300">Dark</span>
          {theme === "dark" && (
            <div className="ml-auto w-2 h-2 bg-blue-400 rounded-full" />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className="flex items-center gap-2 cursor-pointer hover:bg-accent/60 dark:hover:bg-accent/40 group rounded-lg"
        >
          <Monitor className="h-4 w-4 text-purple-500 group-hover:scale-110 transition-transform duration-300" />
          <span className="group-hover:translate-x-1 transition-transform duration-300">System</span>
          {theme === "system" && (
            <div className="ml-auto w-2 h-2 bg-purple-500 rounded-full" />
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
