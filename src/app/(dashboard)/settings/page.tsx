"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Settings, LogOut, Moon, Sun, Monitor, DollarSign, Percent, Save, CheckCircle, Loader2 } from "lucide-react"
import { PRICING_CONFIG } from "@/lib/pricing-config"

// LocalStorage Key
const PRICING_STORAGE_KEY = "cellshop_pricing_config"

// Load saved pricing config or use defaults
function loadPricingConfig() {
    if (typeof window === "undefined") return PRICING_CONFIG
    const saved = localStorage.getItem(PRICING_STORAGE_KEY)
    if (saved) {
        try {
            return JSON.parse(saved)
        } catch {
            return PRICING_CONFIG
        }
    }
    return PRICING_CONFIG
}

export default function SettingsPage() {
    const router = useRouter()
    const [saved, setSaved] = useState(false)
    const [loggingOut, setLoggingOut] = useState(false)
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    // Pricing Config State
    const [targetMargin, setTargetMargin] = useState(50) // Default 50%
    const [salesTax, setSalesTax] = useState(5) // Default 5%
    const [laborCommission, setLaborCommission] = useState(10) // Default 10%

    // Load saved values on mount
    useEffect(() => {
        setMounted(true)
        const config = loadPricingConfig()
        setTargetMargin(config.TARGET_MARGIN * 100)
        setSalesTax(config.SALES_TAX_RATE * 100)
        setLaborCommission(config.LABOR_COMMISSION_RATE * 100)
    }, [])

    // Calculate preview
    const totalDeduction = targetMargin + salesTax + laborCommission
    const exampleCost = 10
    const examplePrice = totalDeduction < 100 ? exampleCost / (1 - totalDeduction / 100) : exampleCost * 2
    const exampleProfit = examplePrice - exampleCost - (examplePrice * salesTax / 100) - (examplePrice * laborCommission / 100)

    const handleSavePricing = () => {
        const config = {
            TARGET_MARGIN: targetMargin / 100,
            SALES_TAX_RATE: salesTax / 100,
            LABOR_COMMISSION_RATE: laborCommission / 100
        }
        localStorage.setItem(PRICING_STORAGE_KEY, JSON.stringify(config))
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
    }

    return (
        <div className="space-y-8 max-w-4xl">
            <div>
                <h1 className="text-3xl font-bold text-text-primary">Configurações</h1>
                <p className="text-text-secondary mt-1">Gerencie as preferências da loja e do sistema.</p>
            </div>

            <div className="grid gap-6">
                {/* Pricing Configuration */}
                <div className="card-gradient rounded-xl p-6 space-y-6 border-2 border-accent/30">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-text-primary flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-accent" /> Regras de Precificação
                        </h2>
                        {saved && (
                            <span className="text-green-500 flex items-center gap-1 text-sm">
                                <CheckCircle className="w-4 h-4" /> Salvo!
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-text-muted">
                        Defina os percentuais usados para calcular automaticamente o preço de venda dos produtos.
                        Fórmula: <code className="bg-white/5 px-1 rounded">Preço = Custo / (1 - Margem - Impostos - Comissão)</code>
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label className="flex items-center gap-1">
                                <Percent className="w-3 h-3 text-accent" /> Margem de Lucro Desejada
                            </Label>
                            <div className="relative">
                                <Input
                                    type="number"
                                    value={targetMargin}
                                    onChange={(e) => setTargetMargin(Number(e.target.value))}
                                    className="bg-background border-white/10 pr-8"
                                />
                                <span className="absolute right-3 top-2 text-text-muted">%</span>
                            </div>
                            <p className="text-xs text-text-muted">Lucro líquido sobre o preço de venda.</p>
                        </div>
                        <div className="space-y-2">
                            <Label className="flex items-center gap-1">
                                <Percent className="w-3 h-3 text-red-400" /> Impostos / Taxas de Cartão
                            </Label>
                            <div className="relative">
                                <Input
                                    type="number"
                                    value={salesTax}
                                    onChange={(e) => setSalesTax(Number(e.target.value))}
                                    className="bg-background border-white/10 pr-8"
                                />
                                <span className="absolute right-3 top-2 text-text-muted">%</span>
                            </div>
                            <p className="text-xs text-text-muted">ICMS, taxas de maquininha, etc.</p>
                        </div>
                        <div className="space-y-2">
                            <Label className="flex items-center gap-1">
                                <Percent className="w-3 h-3 text-blue-400" /> Comissão / Mão de Obra
                            </Label>
                            <div className="relative">
                                <Input
                                    type="number"
                                    value={laborCommission}
                                    onChange={(e) => setLaborCommission(Number(e.target.value))}
                                    className="bg-background border-white/10 pr-8"
                                />
                                <span className="absolute right-3 top-2 text-text-muted">%</span>
                            </div>
                            <p className="text-xs text-text-muted">Custo do vendedor na venda.</p>
                        </div>
                    </div>

                    {/* Preview */}
                    <div className="bg-surface rounded-lg p-4 border border-white/5">
                        <p className="text-sm text-text-muted mb-2">Simulação com Custo de R$ {exampleCost.toFixed(2)}:</p>
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <p className="text-2xl font-bold text-text-primary">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(examplePrice)}
                                </p>
                                <p className="text-xs text-text-muted">Preço de Venda</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-green-500">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(exampleProfit)}
                                </p>
                                <p className="text-xs text-text-muted">Lucro Líquido</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-accent">
                                    {totalDeduction}%
                                </p>
                                <p className="text-xs text-text-muted">Total Deduzido</p>
                            </div>
                        </div>
                    </div>

                    <Button onClick={handleSavePricing} className="w-full gap-2 bg-accent hover:bg-accent-hover text-white">
                        <Save className="w-4 h-4" /> Salvar Configurações de Precificação
                    </Button>
                </div>

                {/* Profile Section */}
                <div className="card-gradient rounded-xl p-6 space-y-4">
                    <h2 className="text-xl font-semibold text-text-primary flex items-center gap-2">
                        <Settings className="w-5 h-5 text-accent" /> Perfil da Loja
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Nome da Loja</Label>
                            <Input defaultValue="Manu Acessórios" className="bg-background border-white/10" />
                        </div>
                        <div className="space-y-2">
                            <Label>CNPJ</Label>
                            <Input defaultValue="00.000.000/0001-99" className="bg-background border-white/10" />
                        </div>
                        <div className="space-y-2">
                            <Label>Endereço</Label>
                            <Input defaultValue="Rua Principal, 123 - Centro" className="bg-background border-white/10" />
                        </div>
                        <div className="space-y-2">
                            <Label>Telefone</Label>
                            <Input defaultValue="(11) 99999-9999" className="bg-background border-white/10" />
                        </div>
                    </div>
                </div>

                {/* Appearance / Theme */}
                <div className="card-gradient rounded-xl p-6 space-y-4">
                    <h2 className="text-xl font-semibold text-text-primary flex items-center gap-2">
                        <Monitor className="w-5 h-5 text-accent" /> Aparência
                    </h2>
                    {mounted && (
                        <div className="flex gap-4">
                            <Button
                                variant="outline"
                                onClick={() => setTheme("dark")}
                                className={`flex-1 gap-2 ${theme === "dark" ? "border-accent bg-accent/10 hover:bg-accent/20 text-accent" : "border-white/10 hover:bg-white/5 text-text-muted"}`}
                            >
                                <Moon className="w-4 h-4" /> Escuro
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setTheme("light")}
                                className={`flex-1 gap-2 ${theme === "light" ? "border-accent bg-accent/10 hover:bg-accent/20 text-accent" : "border-white/10 hover:bg-white/5 text-text-muted"}`}
                            >
                                <Sun className="w-4 h-4" /> Claro
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setTheme("system")}
                                className={`flex-1 gap-2 ${theme === "system" ? "border-accent bg-accent/10 hover:bg-accent/20 text-accent" : "border-white/10 hover:bg-white/5 text-text-muted"}`}
                            >
                                <Monitor className="w-4 h-4" /> Sistema
                            </Button>
                        </div>
                    )}
                </div>

                {/* Logout */}
                <div className="pt-4">
                    <Button
                        variant="destructive"
                        className="gap-2 w-full md:w-auto"
                        disabled={loggingOut}
                        onClick={async () => {
                            setLoggingOut(true)
                            const supabase = createClient()
                            await supabase.auth.signOut()
                            router.push("/auth/login")
                            router.refresh()
                        }}
                    >
                        {loggingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                        {loggingOut ? "Saindo..." : "Sair do Sistema"}
                    </Button>
                </div>
            </div>
        </div>
    )
}

