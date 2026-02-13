"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Calendar, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createTask } from "@/actions/tasks"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export function TaskForm() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const formData = new FormData(e.currentTarget)
        const due_date = formData.get("due_date") as string

        const result = await createTask({
            title: formData.get("title") as string,
            description: formData.get("description") as string,
            priority: formData.get("priority") as any,
            due_date: due_date ? new Date(due_date).toISOString() : undefined,
            type: 'follow_up' // Default
        })

        if (!result.success) {
            setError(typeof result.error === 'string' ? result.error : 'Erro ao criar tarefa')
            setLoading(false)
        } else {
            router.push('/tasks')
            router.refresh()
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
            <div className="card-gradient p-8 rounded-2xl border border-white/5 space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="title">Título da Tarefa</Label>
                    <Input
                        id="title"
                        name="title"
                        required
                        placeholder="Ex: Ligar para cliente sobre orçamento"
                        className="bg-background border-white/10"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">Descrição (Opcional)</Label>
                    <Textarea
                        id="description"
                        name="description"
                        placeholder="Detalhes sobre o que precisa ser feito..."
                        className="bg-background border-white/10 min-h-[120px]"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="due_date">Data de Vencimento</Label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-text-muted" />
                            <Input
                                id="due_date"
                                name="due_date"
                                type="date"
                                className="pl-10 bg-background border-white/10"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Prioridade</Label>
                        <Select name="priority" defaultValue="medium">
                            <SelectTrigger className="bg-background border-white/10">
                                <SelectValue placeholder="Selecione a prioridade" />
                            </SelectTrigger>
                            <SelectContent className="bg-surface border-white/10">
                                <SelectItem value="low">Baixa</SelectItem>
                                <SelectItem value="medium">Média</SelectItem>
                                <SelectItem value="high">Alta</SelectItem>
                                <SelectItem value="urgent">Urgente</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {error && (
                    <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">
                        <AlertCircle className="w-5 h-5" />
                        <p className="font-medium">{error}</p>
                    </div>
                )}

                <div className="flex justify-end gap-4 pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        className="border-white/10 text-text-secondary hover:text-text-primary"
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        disabled={loading}
                        className="bg-accent hover:bg-accent-hover text-white px-8"
                    >
                        {loading ? 'Salvando...' : 'Criar Tarefa'}
                    </Button>
                </div>
            </div>
        </form>
    )
}
