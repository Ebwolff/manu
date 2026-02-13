"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2, ShoppingCart, CreditCard, Banknote, QrCode, AlertCircle, Percent, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ProductsSelector } from "./products-selector"
import { createSale } from "@/actions/sales"

interface CartItem {
    id: string
    name: string
    sku: string
    sale_price: number
    quantity: number
}

const paymentMethods = [
    { id: 'pix', label: 'PIX', icon: QrCode },
    { id: 'credit', label: 'Cartão Crédito', icon: CreditCard },
    { id: 'debit', label: 'Cartão Débito', icon: CreditCard },
    { id: 'cash', label: 'Dinheiro', icon: Banknote },
]

export function SalesForm() {
    const router = useRouter()
    const [cart, setCart] = useState<CartItem[]>([])
    const [paymentMethod, setPaymentMethod] = useState('pix')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('percent')
    const [discountValue, setDiscountValue] = useState(0)

    const addToCart = (product: any) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id)
            if (existing) {
                return prev.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                )
            }
            return [...prev, { ...product, quantity: 1 }]
        })
    }

    const removeFromCart = (id: string) => {
        setCart(prev => prev.filter(item => item.id !== id))
    }

    const subtotal = cart.reduce((sum, item) => sum + (item.sale_price * item.quantity), 0)
    const discountAmount = discountType === 'percent'
        ? (subtotal * Math.min(discountValue, 100)) / 100
        : Math.min(discountValue, subtotal)
    const total = subtotal - discountAmount

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (cart.length === 0) return

        setLoading(true)
        setError(null)

        const result = await createSale({
            total_gross: subtotal,
            total_net: total,
            payment_method: paymentMethod,
            items: cart.map(item => ({
                product_id: item.id,
                quantity: item.quantity,
                unit_price: item.sale_price
            }))
        })

        if (!result.success) {
            setError(typeof result.error === 'string' ? result.error : 'Erro ao registrar venda')
            setLoading(false)
        } else {
            router.push('/sales')
            router.refresh()
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Col: Selector & Cart */}
            <div className="lg:col-span-2 space-y-6">
                <div className="card-gradient p-6 rounded-2xl border border-white/5 space-y-6">
                    <div>
                        <Label className="text-lg font-bold text-text-primary mb-4 block">1. Selecionar Produtos</Label>
                        <ProductsSelector onSelect={addToCart} />
                    </div>

                    <div className="space-y-4">
                        <Label className="text-lg font-bold text-text-primary block">
                            Itens no Carrinho ({cart.length})
                        </Label>

                        {cart.length === 0 ? (
                            <div className="h-40 flex flex-col items-center justify-center text-text-muted border-2 border-dashed border-white/5 rounded-xl bg-white/[0.02]">
                                <ShoppingCart className="w-8 h-8 mb-2 opacity-20" />
                                <p>O carrinho está vazio</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {cart.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/5 rounded-xl hover:bg-white/[0.05] transition-colors">
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-text-primary">{item.name}</p>
                                            <p className="text-xs text-text-muted">{item.sku}</p>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => setCart(c => c.map(i => i.id === item.id ? { ...i, quantity: Math.max(1, i.quantity - 1) } : i))}
                                                    className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-text-primary hover:bg-accent/20 hover:text-accent transition-colors"
                                                >
                                                    -
                                                </button>
                                                <span className="w-8 text-center font-bold text-text-primary">{item.quantity}</span>
                                                <button
                                                    onClick={() => setCart(c => c.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i))}
                                                    className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-text-primary hover:bg-accent/20 hover:text-accent transition-colors"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <div className="text-right min-w-[100px]">
                                                <p className="text-sm font-bold text-text-primary">
                                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.sale_price * item.quantity)}
                                                </p>
                                                <p className="text-xs text-text-muted">{item.quantity}x {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.sale_price)}</p>
                                            </div>
                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                className="text-text-muted hover:text-red-500 transition-colors p-2"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Col: Summary & Checkout */}
            <div className="space-y-6">
                <div className="card-gradient p-8 rounded-2xl border border-white/5 space-y-8 sticky top-28">
                    <div>
                        <Label className="text-lg font-bold text-text-primary mb-6 block">2. Pagamento</Label>
                        <div className="grid grid-cols-2 gap-3">
                            {paymentMethods.map((method) => {
                                const Icon = method.icon
                                return (
                                    <button
                                        key={method.id}
                                        onClick={() => setPaymentMethod(method.id)}
                                        className={`flex flex-col items-center justify-center gap-3 p-4 rounded-xl border transition-all ${paymentMethod === method.id
                                            ? 'bg-accent/10 border-accent text-accent shadow-lg shadow-accent/10'
                                            : 'bg-surface border-white/5 text-text-muted hover:bg-white/5'
                                            }`}
                                    >
                                        <Icon className="w-6 h-6" />
                                        <span className="text-xs font-bold">{method.label}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    <div className="pt-6 border-t border-white/5 space-y-4">
                        <div className="flex justify-between items-center text-text-muted">
                            <span>Subtotal</span>
                            <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(subtotal)}</span>
                        </div>

                        {/* Desconto interativo */}
                        <div className="space-y-3 p-4 bg-white/[0.03] border border-white/5 rounded-xl">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-text-primary">Desconto</span>
                                <div className="flex items-center gap-1 bg-surface rounded-lg p-0.5">
                                    <button
                                        type="button"
                                        onClick={() => setDiscountType('percent')}
                                        className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${discountType === 'percent'
                                                ? 'bg-accent text-white shadow-sm'
                                                : 'text-text-muted hover:text-text-primary'
                                            }`}
                                    >
                                        <Percent className="w-3 h-3" />
                                        %
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setDiscountType('fixed')}
                                        className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${discountType === 'fixed'
                                                ? 'bg-accent text-white shadow-sm'
                                                : 'text-text-muted hover:text-text-primary'
                                            }`}
                                    >
                                        R$
                                    </button>
                                </div>
                            </div>
                            <Input
                                type="number"
                                min={0}
                                max={discountType === 'percent' ? 100 : subtotal}
                                step={discountType === 'percent' ? 1 : 0.01}
                                value={discountValue || ''}
                                onChange={(e) => setDiscountValue(Number(e.target.value) || 0)}
                                placeholder={discountType === 'percent' ? 'Ex: 10' : 'Ex: 15.00'}
                                className="bg-background border-white/10 text-center text-lg font-bold"
                            />
                            {discountAmount > 0 && (
                                <div className="flex justify-between items-center text-green-500 text-sm">
                                    <span>Desconto aplicado</span>
                                    <span>- {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(discountAmount)}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-between items-center pt-4">
                            <span className="text-xl font-bold text-text-primary">Total</span>
                            <span className="text-2xl font-black text-accent">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
                            </span>
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">
                            <AlertCircle className="w-5 h-5" />
                            <p className="font-medium">{error}</p>
                        </div>
                    )}

                    <Button
                        onClick={handleSubmit}
                        disabled={cart.length === 0 || loading}
                        className="w-full h-16 bg-accent hover:bg-accent-hover text-white font-black text-lg rounded-xl shadow-xl shadow-accent/20 transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                        {loading ? 'Processando...' : 'Finalizar Venda'}
                    </Button>
                </div>
            </div>
        </div>
    )
}
