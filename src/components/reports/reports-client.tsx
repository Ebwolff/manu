"use client"

import { useState, useTransition } from "react"
import {
    Download,
    TrendingUp,
    DollarSign,
    ShoppingCart,
    Package,
    Calendar,
    Filter,
    Loader2,
    BarChart3,
    PieChart
} from "lucide-react"
import { motion } from "framer-motion"
import { SalesReport, PipelineReport, exportSalesCSV } from "@/actions/reports"

interface ReportsClientProps {
    salesReport: SalesReport | null
    pipelineReport: PipelineReport | null
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`
}

export function ReportsClient({ salesReport, pipelineReport }: ReportsClientProps) {
    const [isPending, startTransition] = useTransition()
    const [activeTab, setActiveTab] = useState<'sales' | 'pipeline'>('sales')

    const handleExportCSV = () => {
        startTransition(async () => {
            const result = await exportSalesCSV({})
            if (result.success && result.data) {
                const blob = new Blob([result.data], { type: 'text/csv;charset=utf-8;' })
                const url = URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                link.download = `vendas_${new Date().toISOString().split('T')[0]}.csv`
                link.click()
                URL.revokeObjectURL(url)
            }
        })
    }

    return (
        <div className="space-y-6">
            {/* Tabs */}
            <div className="flex items-center gap-4 border-b border-border">
                <button
                    onClick={() => setActiveTab('sales')}
                    className={`pb-3 px-1 text-sm font-medium transition-colors border-b-2 ${activeTab === 'sales'
                        ? 'border-accent text-accent'
                        : 'border-transparent text-text-muted hover:text-text-primary'
                        }`}
                >
                    <BarChart3 className="w-4 h-4 inline mr-2" />
                    Vendas
                </button>
                <button
                    onClick={() => setActiveTab('pipeline')}
                    className={`pb-3 px-1 text-sm font-medium transition-colors border-b-2 ${activeTab === 'pipeline'
                        ? 'border-accent text-accent'
                        : 'border-transparent text-text-muted hover:text-text-primary'
                        }`}
                >
                    <PieChart className="w-4 h-4 inline mr-2" />
                    Pipeline
                </button>
                <div className="ml-auto pb-3">
                    <button
                        onClick={handleExportCSV}
                        disabled={isPending}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-surface border border-border rounded-lg hover:bg-surface-secondary transition-colors disabled:opacity-50"
                    >
                        {isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Download className="w-4 h-4" />
                        )}
                        Exportar CSV
                    </button>
                </div>
            </div>

            {/* Sales Report */}
            {activeTab === 'sales' && salesReport && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    {/* KPIs */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 rounded-xl bg-surface border border-border/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                                    <DollarSign className="w-5 h-5 text-accent" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-text-primary">
                                        {formatCurrency(salesReport.totalRevenue)}
                                    </p>
                                    <p className="text-xs text-text-muted">Faturamento</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 rounded-xl bg-surface border border-border/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                                    <ShoppingCart className="w-5 h-5 text-green-500" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-text-primary">{salesReport.totalSales}</p>
                                    <p className="text-xs text-text-muted">Vendas</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 rounded-xl bg-surface border border-border/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                    <TrendingUp className="w-5 h-5 text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-text-primary">
                                        {formatCurrency(salesReport.avgTicket)}
                                    </p>
                                    <p className="text-xs text-text-muted">Ticket Médio</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 rounded-xl bg-surface border border-border/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                                    <Package className="w-5 h-5 text-cyan-500" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-text-primary">{salesReport.productsSold}</p>
                                    <p className="text-xs text-text-muted">Produtos Vendidos</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Charts Grid */}
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Top Products */}
                        <div className="p-6 rounded-xl bg-surface border border-border/50">
                            <h3 className="font-semibold text-text-primary mb-4">Top Produtos</h3>
                            <div className="space-y-3">
                                {salesReport.topProducts.slice(0, 5).map((product, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <span className="text-sm text-text-muted w-5">{i + 1}.</span>
                                        <div className="flex-1">
                                            <p className="text-sm text-text-primary truncate">{product.name}</p>
                                            <div className="w-full bg-surface-secondary rounded-full h-2 mt-1">
                                                <div
                                                    className="bg-accent h-2 rounded-full"
                                                    style={{
                                                        width: `${(product.revenue / salesReport.topProducts[0].revenue) * 100}%`
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <span className="text-sm font-medium text-accent">
                                            {formatCurrency(product.revenue)}
                                        </span>
                                    </div>
                                ))}
                                {salesReport.topProducts.length === 0 && (
                                    <p className="text-sm text-text-muted text-center py-4">Sem dados</p>
                                )}
                            </div>
                        </div>

                        {/* Payment Methods */}
                        <div className="p-6 rounded-xl bg-surface border border-border/50">
                            <h3 className="font-semibold text-text-primary mb-4">Formas de Pagamento</h3>
                            <div className="space-y-3">
                                {salesReport.paymentMethods.map((method, i) => {
                                    const totalPayments = salesReport.paymentMethods.reduce((s, m) => s + m.count, 0)
                                    const percent = totalPayments > 0 ? (method.count / totalPayments) * 100 : 0
                                    return (
                                        <div key={i} className="flex items-center justify-between">
                                            <span className="text-sm text-text-primary capitalize">{method.method}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-text-muted">{method.count}x</span>
                                                <span className="text-sm font-medium text-text-primary">
                                                    {formatPercent(percent)}
                                                </span>
                                            </div>
                                        </div>
                                    )
                                })}
                                {salesReport.paymentMethods.length === 0 && (
                                    <p className="text-sm text-text-muted text-center py-4">Sem dados</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sales Timeline */}
                    <div className="p-6 rounded-xl bg-surface border border-border/50">
                        <h3 className="font-semibold text-text-primary mb-4">Vendas por Dia</h3>
                        <div className="flex items-end gap-1 h-32">
                            {salesReport.salesByPeriod.slice(-14).map((day, i) => {
                                const max = Math.max(...salesReport.salesByPeriod.map(d => d.revenue))
                                const height = max > 0 ? (day.revenue / max) * 100 : 0
                                return (
                                    <div key={i} className="flex-1 flex flex-col items-center">
                                        <div
                                            className="w-full bg-accent/80 rounded-t hover:bg-accent transition-colors"
                                            style={{ height: `${Math.max(height, 5)}%` }}
                                            title={`${day.date}: ${formatCurrency(day.revenue)}`}
                                        />
                                        <span className="text-[10px] text-text-muted mt-1 rotate-45">
                                            {day.date.slice(5)}
                                        </span>
                                    </div>
                                )
                            })}
                            {salesReport.salesByPeriod.length === 0 && (
                                <p className="text-sm text-text-muted text-center py-4 w-full">Sem dados de período</p>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Pipeline Report */}
            {activeTab === 'pipeline' && pipelineReport && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    {/* KPIs */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 rounded-xl bg-surface border border-border/50">
                            <p className="text-2xl font-bold text-text-primary">{pipelineReport.totalDeals}</p>
                            <p className="text-xs text-text-muted">Total Negociações</p>
                        </div>
                        <div className="p-4 rounded-xl bg-surface border border-border/50">
                            <p className="text-2xl font-bold text-text-primary">
                                {formatCurrency(pipelineReport.totalValue)}
                            </p>
                            <p className="text-xs text-text-muted">Valor Total</p>
                        </div>
                        <div className="p-4 rounded-xl bg-surface border border-border/50">
                            <p className="text-2xl font-bold text-green-500">
                                {formatPercent(pipelineReport.conversionRate)}
                            </p>
                            <p className="text-xs text-text-muted">Taxa Conversão</p>
                        </div>
                        <div className="p-4 rounded-xl bg-surface border border-border/50">
                            <p className="text-2xl font-bold text-text-primary">
                                {pipelineReport.avgTimeToClose.toFixed(0)} dias
                            </p>
                            <p className="text-xs text-text-muted">Tempo Médio Fechamento</p>
                        </div>
                    </div>

                    {/* Funnel Chart */}
                    <div className="p-6 rounded-xl bg-surface border border-border/50">
                        <h3 className="font-semibold text-text-primary mb-4">Funil de Vendas</h3>
                        <div className="space-y-2">
                            {pipelineReport.dealsByStage.map((stageData, i) => {
                                const maxCount = Math.max(...pipelineReport.dealsByStage.map(s => s.count))
                                const width = maxCount > 0 ? (stageData.count / maxCount) * 100 : 0
                                return (
                                    <div key={i} className="flex items-center gap-3">
                                        <span className="w-32 text-sm text-text-primary truncate">{stageData.name}</span>
                                        <div className="flex-1 bg-surface-secondary rounded-full h-6 overflow-hidden">
                                            <div
                                                className="h-full flex items-center px-2"
                                                style={{
                                                    width: `${Math.max(width, 10)}%`,
                                                    backgroundColor: stageData.color
                                                }}
                                            >
                                                <span className="text-xs text-white font-medium">
                                                    {stageData.count}
                                                </span>
                                            </div>
                                        </div>
                                        <span className="w-24 text-sm text-accent text-right">
                                            {formatCurrency(stageData.value)}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Won vs Lost */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-6 rounded-xl bg-green-500/10 border border-green-500/20">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                                    <TrendingUp className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-green-500">{pipelineReport.wonDeals}</p>
                                    <p className="text-sm text-text-muted">Vendas Ganhas</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/20">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center">
                                    <TrendingUp className="w-6 h-6 text-white rotate-180" />
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-red-500">{pipelineReport.lostDeals}</p>
                                    <p className="text-sm text-text-muted">Vendas Perdidas</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    )
}
