import { TaskForm } from "@/components/tasks/task-form"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"

export default function NewTaskPage() {
    return (
        <div className="space-y-8 max-w-4xl mx-auto animation-fade-in">
            <div className="flex flex-col gap-4">
                <Link
                    href="/tasks"
                    className="flex items-center gap-2 text-text-muted hover:text-accent transition-colors w-fit group"
                >
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span>Voltar para tarefas</span>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-text-primary">Nova Tarefa</h1>
                    <p className="text-text-secondary mt-1">Defina um novo lembrete ou atividade para sua equipe.</p>
                </div>
            </div>

            <TaskForm />
        </div>
    )
}
