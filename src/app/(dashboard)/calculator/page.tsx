"use client"

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Calculator, DollarSign, Percent, ArrowRight } from "lucide-react"

export default function CalculatorPage() {
    const [cost, setCost] = useState("")
    const [margin, setMargin] = useState("40") // Default 40%
    const [tax, setTax] = useState("0")
    const [labor, setLabor] = useState("10") // Default 10% for commission/labor

    const calculations = useMemo(() => {
        const costVal = parseFloat(cost.replace(",", ".")) || 0
        const marginVal = parseFloat(margin) || 0
        const taxVal = parseFloat(tax) || 0
        const laborVal = parseFloat(labor) || 0

        // Cálculo Baseado em Markup sobre Venda
        // Preço = Custo / (1 - (MargemLiq + Imposto + MaoDeObra))

        let salePrice = 0
        const combinedRate = (marginVal + taxVal + laborVal) / 100

        if (combinedRate < 1) {
            salePrice = costVal / (1 - combinedRate)
        }

        const profit = salePrice - costVal - (salePrice * (taxVal / 100)) - (salePrice * (laborVal / 100))
        const realMargin = salePrice > 0 ? (profit / salePrice) * 100 : 0

        return {
            salePrice,
            profit,
            realMargin
        }
    }, [cost, margin, tax, labor])

    const hasValues = parseFloat(cost) > 0

    return (
        <div className="space-y-6 max-w-4xl mx-auto animation-fade-in">
            <div>
                <h1 className="text-3xl font-bold text-text-primary">Calculadora de Preços</h1>
                <p className="text-text-secondary mt-1">Calcule o preço de venda ideal baseado na sua margem desejada.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Inputs */}
                <Card className="bg-surface border-white/5">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-text-primary">
                            <Calculator className="w-5 h-5 text-accent" />
                            Parâmetros
                        </CardTitle>
                        <CardDescription>Insira os custos e taxas do produto</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label>Custo do Produto (R$)</Label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-text-muted" />
                                <Input
                                    type="number"
                                    className="pl-10 bg-background border-white/10"
                                    placeholder="0,00"
                                    value={cost}
                                    onChange={(e) => setCost(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Margem de Lucro Desejada (%)</Label>
                            <div className="relative">
                                <Percent className="absolute left-3 top-2.5 h-5 w-5 text-text-muted" />
                                <Input
                                    type="number"
                                    className="pl-10 bg-background border-white/10"
                                    placeholder="40"
                                    value={margin}
                                    onChange={(e) => setMargin(e.target.value)}
                                />
                            </div>
                            <p className="text-xs text-text-muted">Margem sobre o preço de venda final.</p>
                        </div>

                        <div className="space-y-2">
                            <Label>Impostos / Taxas (%)</Label>
                            <div className="relative">
                                <Percent className="absolute left-3 top-2.5 h-5 w-5 text-text-muted" />
                                <Input
                                    type="number"
                                    className="pl-10 bg-background border-white/10"
                                    placeholder="0"
                                    value={tax}
                                    onChange={(e) => setTax(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Comissão / Mão de Obra (%)</Label>
                            <div className="relative">
                                <Percent className="absolute left-3 top-2.5 h-5 w-5 text-text-muted" />
                                <Input
                                    type="number"
                                    className="pl-10 bg-background border-white/10"
                                    placeholder="10"
                                    value={labor}
                                    onChange={(e) => setLabor(e.target.value)}
                                />
                            </div>
                            <p className="text-xs text-text-muted">Custo do vendedor ou operacional sobre a venda.</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Results */}
                <div className="space-y-6">
                    <Card className={`border-2 transition-all duration-300 ${hasValues ? 'border-accent bg-accent/5' : 'border-dashed border-white/10 bg-transparent'}`}>
                        <CardContent className="pt-6 text-center space-y-2">
                            <p className="text-text-muted font-medium">Preço de Venda Sugerido</p>
                            <p className="text-5xl font-bold text-text-primary">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(calculations.salePrice)}
                            </p>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-2 gap-4">
                        <Card className="bg-surface/50 border-white/5">
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-2 mb-1">
                                    <DollarSign className="w-4 h-4 text-green-500" />
                                    <span className="text-sm font-medium text-text-muted">Lucro Líquido</span>
                                </div>
                                <p className="text-2xl font-bold text-green-500">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(calculations.profit)}
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="bg-surface/50 border-white/5">
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-2 mb-1">
                                    <Percent className="w-4 h-4 text-accent" />
                                    <span className="text-sm font-medium text-text-muted">Margem Real</span>
                                </div>
                                <p className="text-2xl font-bold text-accent">
                                    {calculations.realMargin.toFixed(1)}%
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <Button className="w-full h-12 text-lg font-semibold gap-2 bg-accent hover:bg-accent-hover text-white" disabled={!hasValues}>
                        Adicionar ao Catálogo <ArrowRight className="w-5 h-5" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
