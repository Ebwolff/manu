import { SalesForm } from "@/components/sales/sales-form"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"

export default function NewSalePage() {
    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col gap-4">
                <Link
                    href="/sales"
                    className="flex items-center gap-2 text-text-muted hover:text-accent transition-colors w-fit group"
                >
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span>Voltar ao histórico</span>
                </Link>
                <div>
                    <h1 className="text-4xl font-black text-text-primary tracking-tight">Nova Venda</h1>
                    <p className="text-text-secondary mt-2 text-lg">Registre uma nova transação no sistema de forma rápida.</p>
                </div>
            </div>

            <SalesForm />
        </div>
    )
}
