'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

// Validation schemas
const createTaskSchema = z.object({
    deal_id: z.string().uuid().optional(),
    customer_id: z.string().uuid().optional(),
    quote_id: z.string().uuid().optional(),
    title: z.string().min(1, 'Título é obrigatório'),
    description: z.string().optional(),
    type: z.enum(['follow_up', 'call', 'meeting', 'email', 'whatsapp', 'other']).default('follow_up'),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
    due_date: z.string().optional(),
    reminder_at: z.string().optional(),
    assigned_to: z.string().uuid().optional()
})

const updateTaskSchema = z.object({
    id: z.string().uuid(),
    title: z.string().min(1).optional(),
    description: z.string().optional().nullable(),
    type: z.enum(['follow_up', 'call', 'meeting', 'email', 'whatsapp', 'other']).optional(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),
    due_date: z.string().optional().nullable(),
    reminder_at: z.string().optional().nullable()
})

// Types
export interface Task {
    id: string
    deal_id: string | null
    customer_id: string | null
    quote_id: string | null
    title: string
    description: string | null
    type: 'follow_up' | 'call' | 'meeting' | 'email' | 'whatsapp' | 'other'
    priority: 'low' | 'medium' | 'high' | 'urgent'
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
    due_date: string | null
    completed_at: string | null
    reminder_at: string | null
    assigned_to: string | null
    created_by: string
    store_id: string
    created_at: string
    updated_at: string
    deal?: {
        id: string
        title: string
    }
    customer?: {
        id: string
        name: string
        whatsapp: string | null
    }
}

// Get all tasks
export async function getTasks(filters?: {
    status?: string
    priority?: string
    type?: string
    assigned_to?: string
    due_today?: boolean
    overdue?: boolean
}) {
    const supabase = await createClient()

    let query = supabase
        .from('tasks')
        .select(`
            *,
            deal:deals(id, title),
            customer:customers(id, name, whatsapp)
        `)
        .order('due_date', { ascending: true, nullsFirst: false })

    if (filters?.status) {
        query = query.eq('status', filters.status)
    }
    if (filters?.priority) {
        query = query.eq('priority', filters.priority)
    }
    if (filters?.type) {
        query = query.eq('type', filters.type)
    }
    if (filters?.assigned_to) {
        query = query.eq('assigned_to', filters.assigned_to)
    }
    if (filters?.due_today) {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)
        query = query.gte('due_date', today.toISOString()).lt('due_date', tomorrow.toISOString())
    }
    if (filters?.overdue) {
        query = query.lt('due_date', new Date().toISOString()).neq('status', 'completed')
    }

    const { data, error } = await query

    if (error) {
        return { success: false, error: error.message }
    }

    return { success: true, data: data as Task[] }
}

// Get tasks for today
export async function getTasksForToday() {
    return getTasks({ due_today: true, status: 'pending' })
}

// Get overdue tasks
export async function getOverdueTasks() {
    return getTasks({ overdue: true })
}

// Create task
export async function createTask(formData: z.infer<typeof createTaskSchema>) {
    const supabase = await createClient()

    const parsed = createTaskSchema.safeParse(formData)
    if (!parsed.success) {
        return { success: false, error: parsed.error.flatten().fieldErrors }
    }

    const { data: userData } = await supabase.auth.getUser()

    const { data, error } = await supabase
        .from('tasks')
        .insert({
            ...parsed.data,
            created_by: userData.user?.id,
            assigned_to: parsed.data.assigned_to || userData.user?.id,
            store_id: process.env.DEFAULT_STORE_ID || '00000000-0000-0000-0000-000000000001'
        })
        .select()
        .single()

    if (error) {
        return { success: false, error: error.message }
    }

    revalidatePath('/tasks')
    revalidatePath('/pipeline')
    return { success: true, data }
}

// Update task
export async function updateTask(formData: z.infer<typeof updateTaskSchema>) {
    const supabase = await createClient()

    const parsed = updateTaskSchema.safeParse(formData)
    if (!parsed.success) {
        return { success: false, error: parsed.error.flatten().fieldErrors }
    }

    const { id, ...updateData } = parsed.data

    // If completing task, set completed_at
    if (updateData.status === 'completed') {
        (updateData as Record<string, unknown>).completed_at = new Date().toISOString()
    }

    const { data, error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

    if (error) {
        return { success: false, error: error.message }
    }

    revalidatePath('/tasks')
    return { success: true, data }
}

// Complete task
export async function completeTask(taskId: string) {
    return updateTask({ id: taskId, status: 'completed' })
}

// Delete task
export async function deleteTask(taskId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)

    if (error) {
        return { success: false, error: error.message }
    }

    revalidatePath('/tasks')
    return { success: true }
}

// Get task stats
export async function getTaskStats() {
    const supabase = await createClient()

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const [pending, dueToday, overdue, completedToday] = await Promise.all([
        supabase.from('tasks').select('id', { count: 'exact' }).eq('status', 'pending'),
        supabase.from('tasks').select('id', { count: 'exact' })
            .gte('due_date', today.toISOString())
            .lt('due_date', tomorrow.toISOString())
            .neq('status', 'completed'),
        supabase.from('tasks').select('id', { count: 'exact' })
            .lt('due_date', today.toISOString())
            .neq('status', 'completed'),
        supabase.from('tasks').select('id', { count: 'exact' })
            .gte('completed_at', today.toISOString())
            .eq('status', 'completed')
    ])

    return {
        success: true,
        data: {
            pending: pending.count || 0,
            dueToday: dueToday.count || 0,
            overdue: overdue.count || 0,
            completedToday: completedToday.count || 0
        }
    }
}
