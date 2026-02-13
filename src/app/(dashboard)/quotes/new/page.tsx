import { createClient } from "@/lib/supabase/server"
import { QuoteForm } from "@/components/quotes/quote-form"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"

export default async function NewQuotePage() {
    const supabase = await createClient()

    // Fetch customers and active products for the form selectors
    const [customersRes, productsRes] = await Promise.all([
        supabase.from('customers').select('id, name').order('name'),
        supabase.from('products').select('id, name, sku, sale_price, current_stock').order('name')
    ])

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    href="/quotes"
                    className="p-2 hover:bg-white/5 rounded-lg text-text-muted hover:text-text-primary transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Novo Orçamento</h1>
                    <p className="text-text-muted text-sm">Crie um orçamento detalhado para seu cliente</p>
                </div>
            </div>

            <div className="card-gradient rounded-2xl border border-white/5 p-6">
                <QuoteForm
                    customers={customersRes.data || []}
                    products={productsRes.data || []}
                />
            </div>
        </div>
    )
}
