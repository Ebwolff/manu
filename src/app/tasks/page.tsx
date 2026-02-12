import { getTasks, getTaskStats, Task } from "@/actions/tasks"
import { TaskList } from "@/components/tasks/task-list"
import { Plus, CheckCircle, Clock, AlertTriangle, Calendar } from "lucide-react"
import Link from "next/link"

export default async function TasksPage() {
    const [tasksResult, statsResult] = await Promise.all([
        getTasks({ status: 'pending' }),
        getTaskStats()
    ])

    if (!tasksResult.success) {
        return (
            <div className="p-6">
                <p className="text-red-500">Erro ao carregar tarefas: {tasksResult.error}</p>
            </div>
        )
    }

    const tasks = tasksResult.data || []
    const stats = statsResult.success ? statsResult.data : { pending: 0, dueToday: 0, overdue: 0, completedToday: 0 }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Tarefas & Follow-up</h1>
                    <p className="text-text-muted mt-1">
                        Acompanhe suas atividades e lembretes
                    </p>
                </div>
                <Link
                    href="/tasks/new"
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Nova Tarefa
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-surface border border-border/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-text-primary">{stats.pending}</p>
                            <p className="text-xs text-text-muted">Pendentes</p>
                        </div>
                    </div>
                </div>
                <div className="p-4 rounded-xl bg-surface border border-border/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-text-primary">{stats.dueToday}</p>
                            <p className="text-xs text-text-muted">Para Hoje</p>
                        </div>
                    </div>
                </div>
                <div className="p-4 rounded-xl bg-surface border border-border/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-red-500">{stats.overdue}</p>
                            <p className="text-xs text-text-muted">Atrasadas</p>
                        </div>
                    </div>
                </div>
                <div className="p-4 rounded-xl bg-surface border border-border/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-green-500">{stats.completedToday}</p>
                            <p className="text-xs text-text-muted">Concluídas Hoje</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Task List */}
            <TaskList tasks={tasks} />
        </div>
    )
}
