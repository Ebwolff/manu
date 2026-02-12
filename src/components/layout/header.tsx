"use client"

import { Bell, Search, User } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function Header() {
    return (
        <header className="h-20 glass sticky top-0 z-30 flex items-center justify-between px-8">
            {/* Search */}
            <div className="relative w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <Input
                    placeholder="Buscar produtos, clientes..."
                    className="pl-10 bg-surface/50 border-white/10 focus:border-accent text-text-primary placeholder:text-text-muted"
                />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
                {/* Notifications */}
                <button className="relative p-2 rounded-lg hover:bg-white/5 transition-colors">
                    <Bell className="w-5 h-5 text-text-secondary" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full animate-pulse" />
                </button>

                {/* User */}
                <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                    <div className="text-right">
                        <p className="text-sm font-medium text-text-primary">Admin</p>
                        <p className="text-xs text-text-muted">Loja Centro</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-orange-600 flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                    </div>
                </div>
            </div>
        </header>
    )
}
