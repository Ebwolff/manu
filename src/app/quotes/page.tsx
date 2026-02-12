import { getQuotes, Quote } from "@/actions/quotes"
import { Plus, FileText, Send, Check, X, Clock } from "lucide-react"
import Link from "next/link"

const statusConfig: Record<Quote['status'], { label: string; color: string; icon: typeof FileText }> = {
    draft: { label: 'Rascunho', color: 'bg-gray-500', icon: FileText },
    sent: { label: 'Enviado', color: 'bg-blue-500', icon: Send },
    approved: { label: 'Aprovado', color: 'bg-green-500', icon: Check },
    rejected: { label: 'Rejeitado', color: 'bg-red-500', icon: X },
    expired: { label: 'Expirado', color: 'bg-yellow-500', icon: Clock }
}

export default async function QuotesPage() {
    const result = await getQuotes()

    if (!result.success) {
        return (
            <div className="p-6">
                <p className="text-red-500">Erro ao carregar orçamentos: {result.error}</p>
            </div>
        )
    }

    const quotes = result.data || []

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Orçamentos</h1>
                    <p className="text-text-muted mt-1">
                        Crie e gerencie orçamentos para seus clientes
                    </p>
                </div>
                <Link
                    href="/quotes/new"
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Novo Orçamento
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(statusConfig).map(([status, config]) => {
                    const count = quotes.filter(q => q.status === status).length
                    const Icon = config.icon
                    return (
                        <div key={status} className="p-4 rounded-xl bg-surface border border-border/50">
                            <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-lg ${config.color} flex items-center justify-center`}>
                                    <Icon className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-text-primary">{count}</p>
                                    <p className="text-xs text-text-muted">{config.label}</p>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Quotes List */}
            <div className="bg-surface rounded-xl border border-border/50 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-surface-secondary">
                        <tr>
                            <th className="text-left p-4 text-sm font-medium text-text-secondary">#</th>
                            <th className="text-left p-4 text-sm font-medium text-text-secondary">Cliente</th>
                            <th className="text-left p-4 text-sm font-medium text-text-secondary">Status</th>
                            <th className="text-left p-4 text-sm font-medium text-text-secondary">Total</th>
                            <th className="text-left p-4 text-sm font-medium text-text-secondary">Validade</th>
                            <th className="text-left p-4 text-sm font-medium text-text-secondary">Data</th>
                            <th className="text-left p-4 text-sm font-medium text-text-secondary">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {quotes.map((quote) => {
                            const config = statusConfig[quote.status]
                            return (
                                <tr key={quote.id} className="border-t border-border/50 hover:bg-surface-secondary/50">
                                    <td className="p-4 text-sm font-mono text-text-primary">
                                        #{quote.quote_number}
                                    </td>
                                    <td className="p-4 text-sm text-text-primary">
                                        {quote.customer?.name || '-'}
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs text-white ${config.color}`}>
                                            {config.label}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm font-medium text-accent">
                                        {formatCurrency(quote.total)}
                                    </td>
                                    <td className="p-4 text-sm text-text-muted">
                                        {quote.valid_until
                                            ? new Date(quote.valid_until).toLocaleDateString('pt-BR')
                                            : '-'
                                        }
                                    </td>
                                    <td className="p-4 text-sm text-text-muted">
                                        {new Date(quote.created_at).toLocaleDateString('pt-BR')}
                                    </td>
                                    <td className="p-4">
                                        <Link
                                            href={`/quotes/${quote.id}`}
                                            className="text-accent hover:underline text-sm"
                                        >
                                            Ver
                                        </Link>
                                    </td>
                                </tr>
                            )
                        })}
                        {quotes.length === 0 && (
                            <tr>
                                <td colSpan={7} className="p-8 text-center text-text-muted">
                                    Nenhum orçamento encontrado
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
