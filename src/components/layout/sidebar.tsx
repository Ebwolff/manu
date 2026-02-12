"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    Wallet,
    Calculator,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Kanban,
    FileText,
    ListTodo,
    BarChart3
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

const menuItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/pipeline", label: "Pipeline", icon: Kanban },
    { href: "/quotes", label: "Orçamentos", icon: FileText },
    { href: "/tasks", label: "Tarefas", icon: ListTodo },
    { href: "/products", label: "Produtos", icon: Package },
    { href: "/sales", label: "Vendas", icon: ShoppingCart },
    { href: "/customers", label: "Clientes", icon: Users },
    { href: "/reports", label: "Relatórios", icon: BarChart3 },
    { href: "/cashflow", label: "Fluxo de Caixa", icon: Wallet },
    { href: "/calculator", label: "Precificação", icon: Calculator },
]

export function Sidebar() {
    const pathname = usePathname()
    const [collapsed, setCollapsed] = useState(false)

    return (
        <aside className={cn(
            "fixed left-0 top-0 z-40 h-screen sidebar transition-all duration-300",
            collapsed ? "w-20" : "w-64"
        )}>
            {/* Logo Video */}
            <div className="flex h-28 items-center justify-center px-4 border-b border-white/5">
                {!collapsed ? (
                    <video
                        src="/logo-video.mp4"
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="h-24 w-auto object-contain"
                    />
                ) : (
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-orange-600 flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-xl">M</span>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-6 space-y-1">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                                "hover:bg-white/5 hover:text-accent",
                                isActive
                                    ? "bg-accent/10 text-accent border-l-4 border-accent"
                                    : "text-text-secondary border-l-4 border-transparent"
                            )}
                        >
                            <item.icon className={cn("w-5 h-5", isActive && "text-accent")} />
                            {!collapsed && <span className="font-medium">{item.label}</span>}
                        </Link>
                    )
                })}
            </nav>

            {/* Footer */}
            <div className="px-3 py-4 border-t border-white/5">
                <Link
                    href="/settings"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-text-secondary hover:bg-white/5 hover:text-text-primary transition-all"
                >
                    <Settings className="w-5 h-5" />
                    {!collapsed && <span className="font-medium">Configurações</span>}
                </Link>
            </div>

            {/* Collapse Toggle */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="absolute -right-3 top-24 w-6 h-6 rounded-full bg-surface border border-white/10 flex items-center justify-center text-text-secondary hover:text-accent hover:border-accent transition-all"
            >
                {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
        </aside>
    )
}
