"use client"

import { useState, useEffect } from "react"
import { Search, Plus, Package } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

interface Product {
    id: string
    name: string
    sku: string
    sale_price: number
    current_stock: number
}

interface ProductsSelectorProps {
    onSelect: (product: Product) => void
}

export function ProductsSelector({ onSelect }: ProductsSelectorProps) {
    const [search, setSearch] = useState("")
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        const fetchProducts = async () => {
            if (search.length < 2) {
                setProducts([])
                return
            }

            setLoading(true)
            const { data, error } = await supabase
                .from("products")
                .select("id, name, sku, sale_price, current_stock")
                .or(`name.ilike.%${search}%,sku.ilike.%${search}%`)
                .limit(5)

            if (!error && data) {
                setProducts(data)
            }
            setLoading(false)
        }

        const timer = setTimeout(fetchProducts, 300)
        return () => clearTimeout(timer)
    }, [search])

    return (
        <div className="relative">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <Input
                    placeholder="Buscar produto por nome ou SKU..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 h-12 bg-surface border-white/5 focus:border-accent"
                />
            </div>

            {products.length > 0 && (
                <div className="absolute z-50 w-full mt-2 bg-surface border border-white/10 rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl">
                    {products.map((product) => (
                        <button
                            key={product.id}
                            onClick={() => {
                                onSelect(product)
                                setSearch("")
                                setProducts([])
                            }}
                            className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-accent/10 transition-colors">
                                    <Package className="w-5 h-5 text-text-muted group-hover:text-accent" />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-semibold text-text-primary">{product.name}</p>
                                    <p className="text-xs text-text-muted font-mono">{product.sku}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold text-accent">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.sale_price)}
                                </p>
                                <p className="text-xs text-text-muted">{product.current_stock} em estoque</p>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
