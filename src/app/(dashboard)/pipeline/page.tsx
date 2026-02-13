import { getDealsByStage, Deal, DealStage } from "@/actions/deals"
import { PipelineBoard } from "@/components/pipeline/pipeline-board"
import { Plus, Filter } from "lucide-react"
import Link from "next/link"

interface PipelineStageWithDeals extends DealStage {
    deals: Deal[]
}

export default async function PipelinePage() {
    const result = await getDealsByStage()

    if (!result.success) {
        return (
            <div className="p-6">
                <div className="text-center py-12">
                    <p className="text-red-500">Erro ao carregar pipeline: {result.error}</p>
                    <p className="text-text-muted mt-2">
                        Certifique-se de que as migrations foram aplicadas no Supabase.
                    </p>
                </div>
            </div>
        )
    }

    const pipeline: PipelineStageWithDeals[] = result.data || []

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">
                        Pipeline de Vendas
                    </h1>
                    <p className="text-text-muted mt-1">
                        Gerencie suas negociações em andamento
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:text-text-primary border border-border rounded-lg hover:bg-surface transition-colors">
                        <Filter className="w-4 h-4" />
                        Filtrar
                    </button>
                    <Link
                        href="/pipeline/new"
                        className="flex items-center gap-2 px-4 py-2 text-sm bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Nova Negociação
                    </Link>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-surface border border-border/50">
                    <p className="text-sm text-text-muted">Total em Pipeline</p>
                    <p className="text-2xl font-bold text-text-primary mt-1">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                            pipeline.reduce((sum, stage) =>
                                sum + stage.deals.reduce((s, d) => s + (d.value || 0), 0), 0
                            )
                        )}
                    </p>
                </div>
                <div className="p-4 rounded-xl bg-surface border border-border/50">
                    <p className="text-sm text-text-muted">Negociações Ativas</p>
                    <p className="text-2xl font-bold text-text-primary mt-1">
                        {pipeline.reduce((sum, stage) => sum + stage.deals.length, 0)}
                    </p>
                </div>
                <div className="p-4 rounded-xl bg-surface border border-border/50">
                    <p className="text-sm text-text-muted">Ganhas (Mês)</p>
                    <p className="text-2xl font-bold text-green-500 mt-1">
                        {pipeline.find(s => s.slug === 'won')?.deals.length || 0}
                    </p>
                </div>
                <div className="p-4 rounded-xl bg-surface border border-border/50">
                    <p className="text-sm text-text-muted">Perdidas (Mês)</p>
                    <p className="text-2xl font-bold text-red-500 mt-1">
                        {pipeline.find(s => s.slug === 'lost')?.deals.length || 0}
                    </p>
                </div>
            </div>

            {/* Pipeline Board */}
            <PipelineBoard stages={pipeline} />
        </div>
    )
}
