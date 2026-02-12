'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

// Validation schemas
const createDealSchema = z.object({
    customer_id: z.string().uuid().optional(),
    stage_id: z.string().uuid(),
    title: z.string().min(1, 'Título é obrigatório'),
    value: z.number().min(0).optional(),
    notes: z.string().optional(),
    priority: z.enum(['low', 'medium', 'high']).default('medium'),
    expected_close_date: z.string().optional()
})

const updateDealSchema = z.object({
    id: z.string().uuid(),
    customer_id: z.string().uuid().optional().nullable(),
    stage_id: z.string().uuid().optional(),
    title: z.string().min(1).optional(),
    value: z.number().min(0).optional(),
    notes: z.string().optional().nullable(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    expected_close_date: z.string().optional().nullable()
})

const moveDealSchema = z.object({
    deal_id: z.string().uuid(),
    to_stage_id: z.string().uuid(),
    notes: z.string().optional()
})

// Types
export interface Deal {
    id: string
    customer_id: string | null
    stage_id: string
    title: string
    value: number
    notes: string | null
    priority: 'low' | 'medium' | 'high'
    assigned_to: string | null
    expected_close_date: string | null
    store_id: string
    created_at: string
    updated_at: string
    customer?: {
        id: string
        name: string
        whatsapp: string | null
    }
}

export interface DealStage {
    id: string
    name: string
    slug: string
    order_position: number
    color: string
    store_id: string
}

// Get all stages
export async function getDealStages() {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('deal_stages')
        .select('*')
        .order('order_position', { ascending: true })

    if (error) {
        console.error('Error fetching stages:', error)
        return { success: false, error: error.message }
    }

    return { success: true, data: data as DealStage[] }
}

// Get all deals with customer info
export async function getDeals() {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('deals')
        .select(`
            *,
            customer:customers(id, name, whatsapp)
        `)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching deals:', error)
        return { success: false, error: error.message }
    }

    return { success: true, data: data as Deal[] }
}

// Get deals grouped by stage
export async function getDealsByStage() {
    const supabase = await createClient()

    // Get stages
    const { data: stages, error: stagesError } = await supabase
        .from('deal_stages')
        .select('*')
        .order('order_position', { ascending: true })

    if (stagesError) {
        return { success: false, error: stagesError.message }
    }

    // Get all deals
    const { data: deals, error: dealsError } = await supabase
        .from('deals')
        .select(`
            *,
            customer:customers(id, name, whatsapp)
        `)
        .order('updated_at', { ascending: false })

    if (dealsError) {
        return { success: false, error: dealsError.message }
    }

    // Group deals by stage
    const pipeline = stages.map(stage => ({
        ...stage,
        deals: deals.filter(deal => deal.stage_id === stage.id)
    }))

    return { success: true, data: pipeline }
}

// Create new deal
export async function createDeal(formData: z.infer<typeof createDealSchema>) {
    const supabase = await createClient()

    const parsed = createDealSchema.safeParse(formData)
    if (!parsed.success) {
        return { success: false, error: parsed.error.flatten().fieldErrors }
    }

    const { data: userData } = await supabase.auth.getUser()

    const { data, error } = await supabase
        .from('deals')
        .insert({
            ...parsed.data,
            assigned_to: userData.user?.id,
            store_id: process.env.DEFAULT_STORE_ID || '00000000-0000-0000-0000-000000000001'
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating deal:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/pipeline')
    return { success: true, data }
}

// Update deal
export async function updateDeal(formData: z.infer<typeof updateDealSchema>) {
    const supabase = await createClient()

    const parsed = updateDealSchema.safeParse(formData)
    if (!parsed.success) {
        return { success: false, error: parsed.error.flatten().fieldErrors }
    }

    const { id, ...updateData } = parsed.data

    const { data, error } = await supabase
        .from('deals')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

    if (error) {
        console.error('Error updating deal:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/pipeline')
    return { success: true, data }
}

// Move deal to different stage (with history tracking)
export async function moveDeal(formData: z.infer<typeof moveDealSchema>) {
    const supabase = await createClient()

    const parsed = moveDealSchema.safeParse(formData)
    if (!parsed.success) {
        return { success: false, error: parsed.error.flatten().fieldErrors }
    }

    const { deal_id, to_stage_id, notes } = parsed.data

    // Get current stage
    const { data: currentDeal } = await supabase
        .from('deals')
        .select('stage_id')
        .eq('id', deal_id)
        .single()

    if (!currentDeal) {
        return { success: false, error: 'Deal não encontrado' }
    }

    const { data: userData } = await supabase.auth.getUser()

    // Update deal stage
    const { error: updateError } = await supabase
        .from('deals')
        .update({ stage_id: to_stage_id })
        .eq('id', deal_id)

    if (updateError) {
        return { success: false, error: updateError.message }
    }

    // Record history
    await supabase.from('deal_history').insert({
        deal_id,
        from_stage_id: currentDeal.stage_id,
        to_stage_id,
        changed_by: userData.user?.id,
        notes
    })

    revalidatePath('/pipeline')
    return { success: true }
}

// Delete deal
export async function deleteDeal(dealId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('deals')
        .delete()
        .eq('id', dealId)

    if (error) {
        console.error('Error deleting deal:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/pipeline')
    return { success: true }
}

// Get deal history
export async function getDealHistory(dealId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('deal_history')
        .select(`
            *,
            from_stage:deal_stages!deal_history_from_stage_id_fkey(name, color),
            to_stage:deal_stages!deal_history_to_stage_id_fkey(name, color)
        `)
        .eq('deal_id', dealId)
        .order('changed_at', { ascending: false })

    if (error) {
        return { success: false, error: error.message }
    }

    return { success: true, data }
}
