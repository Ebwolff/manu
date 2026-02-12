"use client"

import { motion } from "framer-motion"
import {
    Package,
    TrendingUp,
    Users,
    DollarSign,
    ArrowUpRight,
    ArrowDownRight,
    ShoppingCart,
    AlertTriangle,
    LucideIcon
} from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

// Icon mapping - resolve icon names to components
const iconMap: Record<string, LucideIcon> = {
    DollarSign,
    ShoppingCart,
    Package,
    Users,
    TrendingUp,
    AlertTriangle
}

interface StatItem {
    title: string
    value: string
    rawValue?: number
    change: string
    trend: "up" | "down" | "warning" | "neutral"
    iconName: string
    color: string
}

interface QuickAction {
    href: string
    label: string
    iconName: string
    description: string
}

interface AlertProduct {
    name: string
    current_stock: number
    min_stock: number
}

interface DashboardClientProps {
    stats: StatItem[]
    quickActions: QuickAction[]
    alertProducts: AlertProduct[] | null
}

// Hook for animated counting
function useCountUp(end: number, duration: number = 1500) {
    const [count, setCount] = useState(0)

    useEffect(() => {
        if (end === 0) return

        let startTime: number
        let animationFrame: number

        const animate = (currentTime: number) => {
            if (!startTime) startTime = currentTime
            const progress = Math.min((currentTime - startTime) / duration, 1)

            // Easing function for smooth deceleration
            const easeOutQuart = 1 - Math.pow(1 - progress, 4)
            setCount(Math.floor(easeOutQuart * end))

            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate)
            }
        }

        animationFrame = requestAnimationFrame(animate)
        return () => cancelAnimationFrame(animationFrame)
    }, [end, duration])

    return count
}

// Animated stat card
function StatCard({ stat, index, isHero }: { stat: StatItem; index: number; isHero?: boolean }) {
    const Icon = iconMap[stat.iconName] || Package
    const rawValue = stat.rawValue || 0
    const animatedValue = useCountUp(rawValue)

    // Format display value
    const displayValue = stat.rawValue !== undefined
        ? stat.title.includes("Faturamento")
            ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(animatedValue)
            : animatedValue.toString()
        : stat.value

    return (
        <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
                delay: index * 0.1,
                type: "spring",
                stiffness: 100,
                damping: 15
            }}
            whileHover={{
                y: -4,
                scale: 1.02,
                transition: { type: "spring", stiffness: 400, damping: 25 }
            }}
            className={`stat-card rounded-2xl p-6 hover:border-accent/30 cursor-default group ${isHero ? 'stat-card-hero' : ''
                }`}
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-text-secondary text-sm font-medium">{stat.title}</p>
                    <motion.p
                        className={`font-bold text-text-primary mt-2 ${isHero ? 'text-4xl' : 'text-3xl'}`}
                        key={displayValue}
                    >
                        {displayValue}
                    </motion.p>
                    <div className="flex items-center gap-1 mt-2">
                        {stat.trend === "up" && <ArrowUpRight className="w-4 h-4 text-green-500" />}
                        {stat.trend === "down" && <ArrowDownRight className="w-4 h-4 text-red-500" />}
                        {stat.trend === "warning" && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
                        <span className={`text-sm ${stat.trend === "up" ? "text-green-500" :
                            stat.trend === "down" ? "text-red-500" :
                                stat.trend === "warning" ? "text-yellow-500" : "text-text-muted"
                            }`}>
                            {stat.change}
                        </span>
                    </div>
                </div>
                <motion.div
                    className={`${isHero ? 'w-14 h-14' : 'w-12 h-12'} rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                >
                    <Icon className={`${isHero ? 'w-7 h-7' : 'w-6 h-6'} text-white`} />
                </motion.div>
            </div>
        </motion.div>
    )
}

// Animated quick action card
function QuickActionCard({ action, index }: { action: QuickAction; index: number }) {
    const Icon = iconMap[action.iconName] || Package

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
                delay: 0.4 + index * 0.08,
                type: "spring",
                stiffness: 100,
                damping: 15
            }}
        >
            <Link
                href={action.href}
                className="card-gradient rounded-xl p-5 group cursor-pointer transition-all duration-300 block"
            >
                <div className="flex items-start gap-4">
                    <motion.div
                        className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors"
                        whileHover={{ scale: 1.1, rotate: -5 }}
                        transition={{ type: "spring", stiffness: 400 }}
                    >
                        <Icon className="w-6 h-6 text-accent" />
                    </motion.div>
                    <div>
                        <h3 className="font-semibold text-text-primary group-hover:text-accent transition-colors">
                            {action.label}
                        </h3>
                        <p className="text-sm text-text-muted mt-1">{action.description}</p>
                    </div>
                </div>
            </Link>
        </motion.div>
    )
}

// Main Dashboard Client Component
export function DashboardClient({ stats, quickActions, alertProducts }: DashboardClientProps) {
    // Split stats for asymmetric layout: first one is hero, rest are normal
    const heroStat = stats[0]
    const secondaryStat = stats[1]
    const otherStats = stats.slice(2)

    return (
        <div className="space-y-8">
            {/* Welcome */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
            >
                <h1 className="text-3xl font-bold text-text-primary">
                    Bom dia, <span className="text-accent">Admin</span> 👋
                </h1>
                <p className="text-text-secondary mt-1">
                    Aqui está o resumo do seu negócio hoje.
                </p>
            </motion.div>

            {/* Asymmetric Stats Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Hero Stat (Faturamento) - 5 columns */}
                <div className="lg:col-span-5">
                    <StatCard stat={heroStat} index={0} isHero />
                </div>

                {/* Secondary Stat (Vendas) - 3 columns */}
                <div className="lg:col-span-3">
                    <StatCard stat={secondaryStat} index={1} />
                </div>

                {/* Alerts Panel - 4 columns, spans 2 rows */}
                <motion.div
                    className="lg:col-span-4 lg:row-span-2"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
                >
                    <h2 className="text-xl font-semibold text-text-primary mb-4">Alertas de Estoque</h2>
                    <div className="card-gradient rounded-xl p-4 space-y-3 h-[calc(100%-2rem)]">
                        {!alertProducts || alertProducts.length === 0 ? (
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="flex flex-col items-center justify-center py-8"
                            >
                                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-3">
                                    <span className="text-3xl">✅</span>
                                </div>
                                <p className="text-text-muted text-sm">Estoque saudável</p>
                            </motion.div>
                        ) : (
                            alertProducts.map((prod, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 + index * 0.1 }}
                                    className="flex items-center gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20"
                                >
                                    <AlertTriangle className="w-5 h-5 text-red-500" />
                                    <p className="text-sm font-medium text-red-400">
                                        {prod.name} - Apenas {prod.current_stock} un.
                                    </p>
                                </motion.div>
                            ))
                        )}

                        <Link
                            href="/products"
                            className="block text-center text-sm text-accent hover:underline mt-4"
                        >
                            Ver todos os produtos →
                        </Link>
                    </div>
                </motion.div>

                {/* Other Stats (Estoque + Clientes) - 4 columns each */}
                {otherStats.map((stat, index) => (
                    <div key={stat.title} className="lg:col-span-4">
                        <StatCard stat={stat} index={index + 2} />
                    </div>
                ))}
            </div>

            {/* Quick Actions - Full Width */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
            >
                <h2 className="text-xl font-semibold text-text-primary mb-4">Ações Rápidas</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {quickActions.map((action, index) => (
                        <QuickActionCard key={action.href} action={action} index={index} />
                    ))}
                </div>
            </motion.div>
        </div>
    )
}
