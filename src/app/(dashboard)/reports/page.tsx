import { getSalesReport, getPipelineReport } from "@/actions/reports"
import { ReportsClient } from "@/components/reports/reports-client"
import { BarChart3, Calendar } from "lucide-react"

export default async function ReportsPage() {
    const [salesResult, pipelineResult] = await Promise.all([
        getSalesReport({}),
        getPipelineReport()
    ])

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
                        <BarChart3 className="w-6 h-6 text-accent" />
                        Relatórios
                    </h1>
                    <p className="text-text-muted mt-1">
                        Análise de vendas e performance do pipeline
                    </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-text-muted">
                    <Calendar className="w-4 h-4" />
                    Período: Todo o histórico
                </div>
            </div>

            {/* Reports */}
            <ReportsClient
                salesReport={salesResult.success ? salesResult.data ?? null : null}
                pipelineReport={pipelineResult.success ? pipelineResult.data ?? null : null}
            />
        </div>
    )
}
