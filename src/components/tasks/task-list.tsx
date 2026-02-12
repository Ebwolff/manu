"use client"

import { useState, useTransition } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Phone,
    Mail,
    Calendar,
    MessageSquare,
    Users,
    MoreHorizontal,
    CheckCircle,
    Clock,
    AlertTriangle,
    ChevronRight
} from "lucide-react"
import { Task, completeTask } from "@/actions/tasks"

const typeConfig: Record<Task['type'], { label: string; icon: typeof Phone; color: string }> = {
    follow_up: { label: 'Follow-up', icon: Clock, color: 'text-blue-500' },
    call: { label: 'Ligação', icon: Phone, color: 'text-green-500' },
    meeting: { label: 'Reunião', icon: Users, color: 'text-cyan-500' },
    email: { label: 'E-mail', icon: Mail, color: 'text-yellow-500' },
    whatsapp: { label: 'WhatsApp', icon: MessageSquare, color: 'text-emerald-500' },
    other: { label: 'Outro', icon: MoreHorizontal, color: 'text-gray-500' }
}

const priorityConfig: Record<Task['priority'], { label: string; color: string; bgColor: string }> = {
    low: { label: 'Baixa', color: 'text-green-500', bgColor: 'bg-green-500' },
    medium: { label: 'Média', color: 'text-yellow-500', bgColor: 'bg-yellow-500' },
    high: { label: 'Alta', color: 'text-orange-500', bgColor: 'bg-orange-500' },
    urgent: { label: 'Urgente', color: 'text-red-500', bgColor: 'bg-red-500' }
}

interface TaskListProps {
    tasks: Task[]
}

export function TaskList({ tasks }: TaskListProps) {
    const [isPending, startTransition] = useTransition()
    const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())

    const handleComplete = (taskId: string) => {
        setCompletedIds(prev => new Set(prev).add(taskId))
        startTransition(async () => {
            await completeTask(taskId)
        })
    }

    const isOverdue = (dueDate: string | null) => {
        if (!dueDate) return false
        return new Date(dueDate) < new Date()
    }

    const formatDueDate = (dueDate: string | null) => {
        if (!dueDate) return null

        const date = new Date(dueDate)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)

        if (date < today) {
            return { text: 'Atrasada', isOverdue: true }
        } else if (date >= today && date < tomorrow) {
            return { text: 'Hoje', isOverdue: false }
        } else if (date >= tomorrow && date < new Date(tomorrow.getTime() + 86400000)) {
            return { text: 'Amanhã', isOverdue: false }
        } else {
            return { text: date.toLocaleDateString('pt-BR'), isOverdue: false }
        }
    }

    return (
        <div className="space-y-2">
            <AnimatePresence>
                {tasks.map((task, index) => {
                    const typeInfo = typeConfig[task.type]
                    const priorityInfo = priorityConfig[task.priority]
                    const TypeIcon = typeInfo.icon
                    const dueInfo = formatDueDate(task.due_date)
                    const isCompleted = completedIds.has(task.id)

                    return (
                        <motion.div
                            key={task.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{
                                opacity: isCompleted ? 0.5 : 1,
                                y: 0,
                                scale: isCompleted ? 0.98 : 1
                            }}
                            exit={{ opacity: 0, x: -100 }}
                            transition={{ delay: index * 0.05 }}
                            className={`p-4 rounded-xl bg-surface border border-border/50 hover:border-accent/30 transition-all ${isCompleted ? 'line-through' : ''
                                }`}
                        >
                            <div className="flex items-start gap-4">
                                {/* Complete Button */}
                                <button
                                    onClick={() => handleComplete(task.id)}
                                    disabled={isPending || isCompleted}
                                    className="mt-1 w-5 h-5 rounded-full border-2 border-border hover:border-accent flex items-center justify-center transition-colors group"
                                >
                                    {isCompleted && (
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                    )}
                                </button>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        {/* Priority indicator */}
                                        <div className={`w-2 h-2 rounded-full ${priorityInfo.bgColor}`} />

                                        {/* Title */}
                                        <h3 className="font-medium text-text-primary truncate">
                                            {task.title}
                                        </h3>
                                    </div>

                                    {/* Meta info */}
                                    <div className="flex items-center gap-4 text-sm">
                                        {/* Type */}
                                        <span className={`flex items-center gap-1 ${typeInfo.color}`}>
                                            <TypeIcon className="w-3 h-3" />
                                            {typeInfo.label}
                                        </span>

                                        {/* Customer */}
                                        {task.customer && (
                                            <span className="text-text-muted truncate">
                                                {task.customer.name}
                                            </span>
                                        )}

                                        {/* Due Date */}
                                        {dueInfo && (
                                            <span className={`flex items-center gap-1 ${dueInfo.isOverdue ? 'text-red-500' : 'text-text-muted'
                                                }`}>
                                                {dueInfo.isOverdue && <AlertTriangle className="w-3 h-3" />}
                                                <Calendar className="w-3 h-3" />
                                                {dueInfo.text}
                                            </span>
                                        )}
                                    </div>

                                    {/* Description */}
                                    {task.description && (
                                        <p className="text-sm text-text-muted mt-2 line-clamp-2">
                                            {task.description}
                                        </p>
                                    )}
                                </div>

                                {/* Actions */}
                                <button className="p-2 hover:bg-surface-secondary rounded-lg transition-colors">
                                    <ChevronRight className="w-4 h-4 text-text-muted" />
                                </button>
                            </div>
                        </motion.div>
                    )
                })}
            </AnimatePresence>

            {tasks.length === 0 && (
                <div className="text-center py-12 text-text-muted">
                    <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Nenhuma tarefa pendente!</p>
                </div>
            )}
        </div>
    )
}
