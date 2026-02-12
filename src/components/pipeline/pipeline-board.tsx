"use client"

import { useState, useTransition } from "react"
import { motion } from "framer-motion"
import {
    Plus,
    MoreHorizontal,
    Phone,
    Calendar,
    DollarSign,
    User,
    ChevronRight,
    GripVertical
} from "lucide-react"
import { Deal, DealStage, moveDeal, createDeal } from "@/actions/deals"

interface PipelineStageWithDeals extends DealStage {
    deals: Deal[]
}

interface PipelineBoardProps {
    stages: PipelineStageWithDeals[]
    onDealClick?: (deal: Deal) => void
}

export function PipelineBoard({ stages, onDealClick }: PipelineBoardProps) {
    const [draggedDeal, setDraggedDeal] = useState<Deal | null>(null)
    const [dragOverStage, setDragOverStage] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()

    const handleDragStart = (e: React.DragEvent, deal: Deal) => {
        setDraggedDeal(deal)
        e.dataTransfer.effectAllowed = "move"
    }

    const handleDragOver = (e: React.DragEvent, stageId: string) => {
        e.preventDefault()
        setDragOverStage(stageId)
    }

    const handleDragLeave = () => {
        setDragOverStage(null)
    }

    const handleDrop = async (e: React.DragEvent, toStageId: string) => {
        e.preventDefault()
        setDragOverStage(null)

        if (draggedDeal && draggedDeal.stage_id !== toStageId) {
            startTransition(async () => {
                await moveDeal({
                    deal_id: draggedDeal.id,
                    to_stage_id: toStageId
                })
            })
        }
        setDraggedDeal(null)
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value)
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'bg-red-500'
            case 'medium': return 'bg-yellow-500'
            case 'low': return 'bg-green-500'
            default: return 'bg-gray-500'
        }
    }

    return (
        <div className="flex gap-4 overflow-x-auto pb-4 min-h-[calc(100vh-200px)]">
            {stages.map((stage, index) => (
                <motion.div
                    key={stage.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex-shrink-0 w-80 rounded-xl bg-surface/50 border border-border/50 transition-all ${dragOverStage === stage.id ? 'ring-2 ring-accent' : ''
                        }`}
                    onDragOver={(e) => handleDragOver(e, stage.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, stage.id)}
                >
                    {/* Stage Header */}
                    <div className="p-4 border-b border-border/50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: stage.color }}
                                />
                                <h3 className="font-semibold text-text-primary">
                                    {stage.name}
                                </h3>
                                <span className="text-xs text-text-muted bg-surface-secondary px-2 py-0.5 rounded-full">
                                    {stage.deals.length}
                                </span>
                            </div>
                            <button className="p-1 hover:bg-surface-secondary rounded">
                                <MoreHorizontal className="w-4 h-4 text-text-muted" />
                            </button>
                        </div>
                        {/* Stage Total */}
                        <p className="text-sm text-text-muted mt-1">
                            {formatCurrency(stage.deals.reduce((sum, d) => sum + (d.value || 0), 0))}
                        </p>
                    </div>

                    {/* Deals List */}
                    <div className="p-2 space-y-2 max-h-[calc(100vh-350px)] overflow-y-auto">
                        {stage.deals.map((deal) => (
                            <motion.div
                                key={deal.id}
                                layout
                                draggable
                                onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, deal)}
                                onClick={() => onDealClick?.(deal)}
                                className={`p-3 rounded-lg bg-surface border border-border/50 cursor-grab active:cursor-grabbing hover:border-accent/50 transition-all group ${isPending && draggedDeal?.id === deal.id ? 'opacity-50' : ''
                                    }`}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {/* Priority Indicator */}
                                <div className="flex items-center justify-between mb-2">
                                    <div className={`w-2 h-2 rounded-full ${getPriorityColor(deal.priority)}`} />
                                    <GripVertical className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>

                                {/* Deal Title */}
                                <h4 className="font-medium text-text-primary text-sm mb-2 line-clamp-2">
                                    {deal.title}
                                </h4>

                                {/* Customer */}
                                {deal.customer && (
                                    <div className="flex items-center gap-2 text-xs text-text-muted mb-2">
                                        <User className="w-3 h-3" />
                                        <span className="truncate">{deal.customer.name}</span>
                                    </div>
                                )}

                                {/* Value & Date */}
                                <div className="flex items-center justify-between text-xs">
                                    {deal.value > 0 && (
                                        <div className="flex items-center gap-1 text-accent font-medium">
                                            <DollarSign className="w-3 h-3" />
                                            {formatCurrency(deal.value)}
                                        </div>
                                    )}
                                    {deal.expected_close_date && (
                                        <div className="flex items-center gap-1 text-text-muted">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(deal.expected_close_date).toLocaleDateString('pt-BR')}
                                        </div>
                                    )}
                                </div>

                                {/* WhatsApp Quick Action */}
                                {deal.customer?.whatsapp && (
                                    <a
                                        href={`https://wa.me/55${deal.customer.whatsapp.replace(/\D/g, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-2 flex items-center gap-1 text-xs text-green-500 hover:text-green-400"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <Phone className="w-3 h-3" />
                                        WhatsApp
                                    </a>
                                )}
                            </motion.div>
                        ))}

                        {stage.deals.length === 0 && (
                            <div className="text-center py-8 text-text-muted text-sm">
                                Arraste cards aqui
                            </div>
                        )}
                    </div>

                    {/* Add Deal Button */}
                    <div className="p-2 border-t border-border/50">
                        <button className="w-full flex items-center justify-center gap-2 p-2 text-sm text-text-muted hover:text-accent hover:bg-accent/10 rounded-lg transition-colors">
                            <Plus className="w-4 h-4" />
                            Adicionar
                        </button>
                    </div>
                </motion.div>
            ))}
        </div>
    )
}
