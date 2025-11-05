"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Calendar, Replace as Marketplace, Bell, LogOut, Menu, X } from "lucide-react"
import { useState } from "react"

const navItems = [
  { href: "/dashboard", label: "Calendar", icon: Calendar },
  { href: "/marketplace", label: "Marketplace", icon: Marketplace },
  { href: "/requests", label: "Requests", icon: Bell },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const handleLogout = async () => {
    setIsLoading(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  return (
    <>
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 bg-card rounded-lg"
      >
        {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      <div
        className={`fixed md:static top-0 left-0 h-screen w-64 bg-card border-r border-border flex flex-col transition-transform duration-300 z-40 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-6 border-b border-border">
          <h1 className="text-2xl font-bold text-blue-500">
            SlotSwapper
          </h1>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href} onClick={() => setIsMobileOpen(false)}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start gap-2 ${
                    isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted/50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Button>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <Button
            onClick={handleLogout}
            disabled={isLoading}
            variant="outline"
            className="w-full justify-start gap-2 bg-transparent"
          >
            <LogOut className="w-4 h-4" />
            {isLoading ? "Signing out..." : "Sign Out"}
          </Button>
        </div>
      </div>

      {isMobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsMobileOpen(false)} />
      )}
    </>
  )
}
