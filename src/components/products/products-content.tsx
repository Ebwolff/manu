"use client"

import { useState } from "react"
import { Package } from "lucide-react"
import { ProductTable } from "./product-table"
import { Product } from "@/types/schema"

type FilterType = 'all' | 'low_stock' | 'healthy' | 'categories'

interface ProductsContentProps {
    products: Product[]
}

export function ProductsContent({ products }: ProductsContentProps) {
    const [activeFilter, setActiveFilter] = useState<FilterType>('all')

    const totalProducts = products.length
    const lowStockProducts = products.filter(p => p.current_stock <= p.min_stock)
    const healthyProducts = products.filter(p => p.current_stock > p.min_stock)
    const categories = [...new Set(products.map(p => p.category).filter(Boolean))]

    const filteredProducts = (() => {
        switch (activeFilter) {
            case 'low_stock': return lowStockProducts
            case 'healthy': return healthyProducts
            default: return products
        }
    })()

    const handleFilter = (filter: FilterType) => {
        setActiveFilter(prev => prev === filter ? 'all' : filter)
    }

    const cards = [
        { id: 'all' as FilterType, label: 'Total de Produtos', value: totalProducts, color: 'blue', textColor: 'text-blue-500', bgColor: 'bg-blue-500/10', activeRing: 'ring-blue-500/50' },
        { id: 'low_stock' as FilterType, label: 'Estoque Baixo', value: lowStockProducts.length, color: 'red', textColor: 'text-red-500', bgColor: 'bg-red-500/10', activeRing: 'ring-red-500/50' },
        { id: 'healthy' as FilterType, label: 'Estoque Saudável', value: healthyProducts.length, color: 'green', textColor: 'text-green-500', bgColor: 'bg-green-500/10', activeRing: 'ring-green-500/50' },
        { id: 'categories' as FilterType, label: 'Categorias', value: categories.length, color: 'accent', textColor: 'text-accent', bgColor: 'bg-accent/10', activeRing: 'ring-accent/50' },
    ]

    return (
        <>
            {/* Stats Cards como Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {cards.map(card => (
                    <button
                        key={card.id}
                        onClick={() => handleFilter(card.id)}
                        className={`stat-card rounded-xl p-4 flex items-center gap-4 transition-all duration-200 text-left
                            ${activeFilter === card.id
                                ? `ring-2 ${card.activeRing} scale-[1.02] shadow-lg`
                                : 'hover:scale-[1.01] hover:bg-white/[0.03]'
                            }`}
                    >
                        <div className={`w-12 h-12 rounded-xl ${card.bgColor} flex items-center justify-center transition-transform ${activeFilter === card.id ? 'scale-110' : ''}`}>
                            <Package className={`w-6 h-6 ${card.textColor}`} />
                        </div>
                        <div>
                            <p className="text-text-muted text-sm">{card.label}</p>
                            <p className={`text-2xl font-bold ${card.id === 'all' ? 'text-text-primary' : card.textColor}`}>
                                {card.value}
                            </p>
                        </div>
                        {activeFilter === card.id && card.id !== 'all' && (
                            <div className={`ml-auto text-xs font-bold ${card.textColor} bg-white/5 px-2 py-1 rounded-md`}>
                                Filtrado
                            </div>
                        )}
                    </button>
                ))}
            </div>

            {/* Indicador de filtro ativo */}
            {activeFilter !== 'all' && (
                <div className="flex items-center gap-2 text-sm text-text-muted">
                    <span>Exibindo:</span>
                    <span className="font-bold text-text-primary">
                        {activeFilter === 'low_stock' && `${lowStockProducts.length} produtos com estoque baixo`}
                        {activeFilter === 'healthy' && `${healthyProducts.length} produtos com estoque saudável`}
                        {activeFilter === 'categories' && `${categories.length} categorias`}
                    </span>
                    <button
                        onClick={() => setActiveFilter('all')}
                        className="ml-2 text-accent hover:underline font-medium"
                    >
                        Limpar filtro
                    </button>
                </div>
            )}

            {/* Tabela */}
            <ProductTable initialProducts={filteredProducts} />
        </>
    )
}
