"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { processPurchase } from "@/actions/purchases"
import { calculateSuggestedPrice } from "@/lib/pricing-config"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import { Plus, Trash2, Save, Calculator, DollarSign, Package, AlertTriangle } from "lucide-react"

// Types
interface PurchaseItem {
    tempId: string
    product_sku: string
    product_name: string
    quantity: number
    unit_price: number // Preço na Nota
    product_id?: string
}

export default function NewPurchasePage() {
    const supabase = createClient()
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    // Header Data
    const [supplier, setSupplier] = useState("")
    const [invoiceNumber, setInvoiceNumber] = useState("")

    // Costs
    const [freightCost, setFreightCost] = useState(0)
    const [taxCost, setTaxCost] = useState(0)
    const [otherCosts, setOtherCosts] = useState(0)

    // Items
    const [items, setItems] = useState<PurchaseItem[]>([])

    // New Item Form
    const [newItemSku, setNewItemSku] = useState("")
    const [newItemQty, setNewItemQty] = useState(1)
    const [newItemPrice, setNewItemPrice] = useState(0)

    // Calculated Totals
    const totalProducts = items.reduce((acc, item) => acc + (item.quantity * item.unit_price), 0)
    const totalExtras = freightCost + taxCost + otherCosts
    const totalPurchase = totalProducts + totalExtras

    // Add Item Handler
    const handleAddItem = async () => {
        if (!newItemSku || newItemPrice <= 0) return

        // Fetch product name from SKU
        const { data: products } = await supabase
            .from('products')
            .select('id, name')
            .eq('sku', newItemSku)
            .single()

        const productName = products?.name || "Produto Desconhecido (Novo)"
        const productId = products?.id

        const newItem: PurchaseItem = {
            tempId: crypto.randomUUID(),
            product_sku: newItemSku,
            product_name: productName,
            quantity: newItemQty,
            unit_price: newItemPrice,
            product_id: productId
        }

        setItems([...items, newItem])
        setNewItemSku("")
        setNewItemQty(1)
        setNewItemPrice(0)
    }

    const removeItem = (id: string) => {
        setItems(items.filter(i => i.tempId !== id))
    }

    // Save Handler
    const handleSave = async () => {
        setLoading(true)

        // Calculate distribution logic for payload
        // Now also calculate the suggested sale price on the CLIENT side using localStorage config
        const processedItems = items.map(item => {
            const subtotal = item.quantity * item.unit_price
            const weight = totalProducts > 0 ? (subtotal / totalProducts) : 0
            const shareOfExtras = totalExtras * weight
            const extraPerUnit = shareOfExtras / item.quantity
            const effective_unit_cost = item.unit_price + extraPerUnit

            // Calculate sale price using user's pricing config from localStorage
            const suggested_sale_price = calculateSuggestedPrice(effective_unit_cost)

            return {
                product_id: item.product_id!,
                quantity: item.quantity,
                unit_price: item.unit_price,
                effective_unit_cost: effective_unit_cost,
                suggested_sale_price: suggested_sale_price
            }
        })

        const payload = {
            supplier,
            invoice_number: invoiceNumber,
            freight_cost: freightCost,
            tax_cost: taxCost,
            other_costs: otherCosts,
            items: processedItems
        }

        try {
            await processPurchase(payload)
            // If successful, action redirects. If we are here preventing default, we might want to handle error.
            // But redirect happens on simple call usually.
        } catch (error) {
            console.error(error)
            alert("Erro ao salvar compra. Verifique o console.")
            setLoading(false)
        }
    }

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-20">
            <div>
                <h1 className="text-3xl font-bold text-text-primary">Nova Entrada de Nota</h1>
                <p className="text-text-secondary mt-1">Lance a nota fiscal para atualizar estoque e recalcular custos.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Invoice Data & Costs */}
                <div className="space-y-6">
                    <Card className="bg-surface border-white/5">
                        <CardHeader>
                            <CardTitle>Dados da Nota</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Fornecedor</Label>
                                <Input
                                    placeholder="Ex: Samsung Distribuidora"
                                    value={supplier}
                                    onChange={e => setSupplier(e.target.value)}
                                    className="bg-background border-white/10"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Número da Nota / Pedido</Label>
                                <Input
                                    placeholder="Ex: NFE-12345"
                                    value={invoiceNumber}
                                    onChange={e => setInvoiceNumber(e.target.value)}
                                    className="bg-background border-white/10"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-surface border-white/5">
                        <CardHeader>
                            <CardTitle className="text-accent flex items-center gap-2">
                                <DollarSign className="w-5 h-5" /> Custos Adicionais
                            </CardTitle>
                            <CardDescription>Estes valores serão rateados nos produtos.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Frete / Viagem / Gasolina (R$)</Label>
                                <Input
                                    type="number"
                                    value={freightCost}
                                    onChange={e => setFreightCost(Number(e.target.value))}
                                    className="bg-background border-white/10"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Impostos / IPI (R$)</Label>
                                <Input
                                    type="number"
                                    value={taxCost}
                                    onChange={e => setTaxCost(Number(e.target.value))}
                                    className="bg-background border-white/10"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Outros (R$)</Label>
                                <Input
                                    type="number"
                                    value={otherCosts}
                                    onChange={e => setOtherCosts(Number(e.target.value))}
                                    className="bg-background border-white/10"
                                />
                            </div>

                            <div className="pt-4 border-t border-white/10">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-text-muted">Total de Extras:</span>
                                    <span className="text-red-400 font-bold">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalExtras)}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Items & Calculation */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Add Item Form */}
                    <Card className="bg-surface border-white/5">
                        <CardHeader>
                            <CardTitle>Adicionar Produtos</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-4 items-end">
                                <div className="flex-1 space-y-2">
                                    <Label>SKU do Produto</Label>
                                    <Input
                                        placeholder="Busque pelo SKU..."
                                        value={newItemSku}
                                        onChange={e => setNewItemSku(e.target.value)}
                                        className="bg-background border-white/10"
                                    />
                                </div>
                                <div className="w-24 space-y-2">
                                    <Label>Qtd</Label>
                                    <Input
                                        type="number"
                                        value={newItemQty}
                                        onChange={e => setNewItemQty(Number(e.target.value))}
                                        className="bg-background border-white/10"
                                    />
                                </div>
                                <div className="w-32 space-y-2">
                                    <Label>Preço Unit.</Label>
                                    <Input
                                        type="number"
                                        value={newItemPrice}
                                        onChange={e => setNewItemPrice(Number(e.target.value))}
                                        className="bg-background border-white/10"
                                    />
                                </div>
                                <Button onClick={handleAddItem} className="bg-accent hover:bg-accent-hover text-white">
                                    <Plus className="w-5 h-5" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Items Table */}
                    <div className="card-gradient rounded-xl overflow-hidden min-h-[300px]">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-white/5 hover:bg-transparent">
                                    <TableHead>Produto</TableHead>
                                    <TableHead className="text-right">Qtd</TableHead>
                                    <TableHead className="text-right">Preço NF</TableHead>
                                    <TableHead className="text-right text-accent">Custo Real (Est.)</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-40 text-center text-text-muted">
                                            Adicione produtos para calcular o custo real.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    items.map(item => {
                                        // Simple proportional calculation per unit
                                        // Weight factor = (Item Subtotal / Total Products)
                                        const subtotal = item.quantity * item.unit_price
                                        const weight = totalProducts > 0 ? (subtotal / totalProducts) : 0
                                        const shareOfExtras = totalExtras * weight
                                        const extraPerUnit = shareOfExtras / item.quantity
                                        const realUnitCost = item.unit_price + extraPerUnit

                                        return (
                                            <TableRow key={item.tempId} className="border-white/5 hover:bg-white/5">
                                                <TableCell>
                                                    <div className="font-medium text-text-primary">{item.product_name}</div>
                                                    <div className="text-xs text-text-secondary">{item.product_sku}</div>
                                                </TableCell>
                                                <TableCell className="text-right">{item.quantity}</TableCell>
                                                <TableCell className="text-right text-text-muted">
                                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.unit_price)}
                                                </TableCell>
                                                <TableCell className="text-right font-bold text-accent">
                                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(realUnitCost)}
                                                </TableCell>
                                                <TableCell>
                                                    <Button variant="ghost" size="icon" onClick={() => removeItem(item.tempId)} className="text-red-400 hover:text-red-500 hover:bg-red-500/10">
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Footer / Total */}
                    <div className="flex justify-between items-center p-6 bg-surface rounded-xl border border-white/5">
                        <div className="text-text-secondary">
                            <p>Total Produtos: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalProducts)}</p>
                            <p>Total Extras: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalExtras)}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-text-muted">Valor Total da Nota</p>
                            <p className="text-3xl font-bold text-text-primary">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPurchase)}
                            </p>
                        </div>
                    </div>

                    <Button onClick={handleSave} className="w-full h-12 text-lg font-bold bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-900/20" disabled={items.length === 0 || loading}>
                        {loading ? "Processando..." : "Confirmar Entrada e Atualizar Custos"}
                    </Button>
                </div>
            </div>
        </div>
    )
}
