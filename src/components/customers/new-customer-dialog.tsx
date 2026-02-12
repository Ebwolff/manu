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
import { UserPlus, Save, Loader2 } from "lucide-react"

export function NewCustomerDialog() {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    // Form State
    const [name, setName] = useState("")
    const [whatsapp, setWhatsapp] = useState("")
    const [deviceModel, setDeviceModel] = useState("")
    const [notes, setNotes] = useState("")

    const handleSave = async () => {
        if (!name.trim()) {
            alert("O nome do cliente é obrigatório.")
            return
        }

        setLoading(true)
        const supabase = createClient()

        const { data: { user } } = await supabase.auth.getUser()

        const { error } = await supabase.from("customers").insert({
            name: name.trim(),
            whatsapp: whatsapp.trim() || null,
            current_device_model: deviceModel.trim() || null,
            notes: notes.trim() || null,
            store_id: user?.id || "00000000-0000-0000-0000-000000000000",
        })

        setLoading(false)

        if (error) {
            console.error("Error creating customer:", error)
            alert("Erro ao cadastrar cliente. Verifique o console.")
        } else {
            // Reset form and close
            setName("")
            setWhatsapp("")
            setDeviceModel("")
            setNotes("")
            setOpen(false)
            router.refresh()
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2 bg-accent hover:bg-accent-hover text-white">
                    <UserPlus className="w-4 h-4" /> Novo Cliente
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-surface border-white/10 sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-text-primary">Cadastrar Novo Cliente</DialogTitle>
                    <DialogDescription className="text-text-muted">
                        Preencha os dados do cliente para registrá-lo no sistema.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Nome do Cliente *</Label>
                        <Input
                            placeholder="Ex: João Silva"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="bg-background border-white/10"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>WhatsApp</Label>
                        <Input
                            placeholder="Ex: (11) 99999-9999"
                            value={whatsapp}
                            onChange={(e) => setWhatsapp(e.target.value)}
                            className="bg-background border-white/10"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Modelo do Aparelho</Label>
                        <Input
                            placeholder="Ex: iPhone 14 Pro Max"
                            value={deviceModel}
                            onChange={(e) => setDeviceModel(e.target.value)}
                            className="bg-background border-white/10"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Observações</Label>
                        <Input
                            placeholder="Notas sobre o cliente..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="bg-background border-white/10"
                        />
                    </div>
                </div>

                <Button
                    onClick={handleSave}
                    disabled={loading || !name.trim()}
                    className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white"
                >
                    {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Save className="w-4 h-4" />
                    )}
                    {loading ? "Salvando..." : "Salvar Cliente"}
                </Button>
            </DialogContent>
        </Dialog>
    )
}
