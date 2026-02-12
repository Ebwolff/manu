"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Wallet, PlusCircle, MinusCircle } from "lucide-react"

export function NewTransactionDialog() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    // Form State
    const [description, setDescription] = useState("")
    const [amount, setAmount] = useState("")
    const [type, setType] = useState<"inflow" | "outflow">("inflow")
    const [category, setCategory] = useState("venda")

    const handleSave = async () => {
        if (!description || !amount) return

        setLoading(true)
        const numericAmount = parseFloat(amount.replace(",", "."))
        const finalAmount = type === "outflow" ? -Math.abs(numericAmount) : Math.abs(numericAmount)

        const { data: { user } } = await supabase.auth.getUser()

        // Default Store ID for MVP
        const STORE_ID = "00000000-0000-0000-0000-000000000000"

        const { error } = await supabase
            .from("cash_flow")
            .insert({
                store_id: STORE_ID,
                amount: finalAmount,
                category,
                description,
                created_by: user?.id
            })

        if (error) {
            console.error(error)
            alert("Erro ao salvar transação.")
        } else {
            setOpen(false)
            setDescription("")
            setAmount("")
            router.refresh()
        }
        setLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2 bg-accent hover:bg-accent-hover text-white">
                    <Wallet className="w-4 h-4" /> Nova Transação
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-surface border-white/10 text-text-primary">
                <DialogHeader>
                    <DialogTitle>Nova Transação</DialogTitle>
                    <DialogDescription>
                        Lance uma entrada ou saída no fluxo de caixa.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="flex gap-4">
                        <Button
                            variant={type === "inflow" ? "default" : "outline"}
                            className={`flex-1 gap-2 ${type === "inflow" ? "bg-green-600 hover:bg-green-700" : "border-white/10"}`}
                            onClick={() => setType("inflow")}
                        >
                            <PlusCircle className="w-4 h-4" /> Entrada
                        </Button>
                        <Button
                            variant={type === "outflow" ? "destructive" : "outline"}
                            className={`flex-1 gap-2 ${type === "outflow" ? "" : "border-white/10"}`} // Destructive already handles red
                            onClick={() => setType("outflow")}
                        >
                            <MinusCircle className="w-4 h-4" /> Saída
                        </Button>
                    </div>

                    <div className="space-y-2">
                        <Label>Descrição</Label>
                        <Input
                            placeholder="Ex: Venda Balcão / Pagto Luz"
                            className="bg-background border-white/10"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Valor (R$)</Label>
                            <Input
                                type="number"
                                placeholder="0,00"
                                className="bg-background border-white/10"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Categoria</Label>
                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger className="bg-background border-white/10">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="venda">Venda</SelectItem>
                                    <SelectItem value="servico">Serviço</SelectItem>
                                    <SelectItem value="investimento">Investimento</SelectItem>
                                    <SelectItem value="reposicao">Reposição (Estoque)</SelectItem>
                                    <SelectItem value="despesa_fixa">Despesa Fixa</SelectItem>
                                    <SelectItem value="marketing">Marketing</SelectItem>
                                    <SelectItem value="outros">Outros</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
                <Button onClick={handleSave} disabled={loading} className="w-full bg-accent hover:bg-accent-hover text-white">
                    {loading ? "Salvando..." : "Salvar Transação"}
                </Button>
            </DialogContent>
        </Dialog>
    )
}
