'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

// Validation schemas
const createQuoteSchema = z.object({
    deal_id: z.string().uuid().optional(),
    customer_id: z.string().uuid(),
    valid_until: z.string().optional(),
    notes: z.string().optional(),
    discount_percent: z.number().min(0).max(100).optional(),
    discount_amount: z.number().min(0).optional()
})

const quoteItemSchema = z.object({
    quote_id: z.string().uuid(),
    product_id: z.string().uuid().optional(),
    description: z.string().min(1),
    quantity: z.number().int().min(1),
    unit_price: z.number().min(0)
})

// Types
export interface Quote {
    id: string
    deal_id: string | null
    customer_id: string
    quote_number: number
    status: 'draft' | 'sent' | 'approved' | 'rejected' | 'expired'
    subtotal: number
    discount_percent: number
    discount_amount: number
    total: number
    notes: string | null
    valid_until: string | null
    sent_at: string | null
    approved_at: string | null
    created_by: string
    store_id: string
    created_at: string
    updated_at: string
    customer?: {
        id: string
        name: string
        whatsapp: string | null
    }
    items?: QuoteItem[]
}

export interface QuoteItem {
    id: string
    quote_id: string
    product_id: string | null
    description: string
    quantity: number
    unit_price: number
    total: number
    product?: {
        id: string
        name: string
        sku: string
    }
}

// Get all quotes
export async function getQuotes(status?: string) {
    const supabase = await createClient()

    let query = supabase
        .from('quotes')
        .select(`
            *,
            customer:customers(id, name, whatsapp)
        `)
        .order('created_at', { ascending: false })

    if (status) {
        query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
        return { success: false, error: error.message }
    }

    return { success: true, data: data as Quote[] }
}

// Get single quote with items
export async function getQuote(quoteId: string) {
    const supabase = await createClient()

    const { data: quote, error: quoteError } = await supabase
        .from('quotes')
        .select(`
            *,
            customer:customers(id, name, whatsapp)
        `)
        .eq('id', quoteId)
        .single()

    if (quoteError) {
        return { success: false, error: quoteError.message }
    }

    const { data: items, error: itemsError } = await supabase
        .from('quote_items')
        .select(`
            *,
            product:products(id, name, sku)
        `)
        .eq('quote_id', quoteId)

    if (itemsError) {
        return { success: false, error: itemsError.message }
    }

    return {
        success: true,
        data: { ...quote, items } as Quote
    }
}

// Create quote
export async function createQuote(formData: z.infer<typeof createQuoteSchema>) {
    const supabase = await createClient()

    const parsed = createQuoteSchema.safeParse(formData)
    if (!parsed.success) {
        return { success: false, error: parsed.error.flatten().fieldErrors }
    }

    const { data: userData } = await supabase.auth.getUser()

    const { data, error } = await supabase
        .from('quotes')
        .insert({
            ...parsed.data,
            created_by: userData.user?.id,
            store_id: process.env.DEFAULT_STORE_ID || '00000000-0000-0000-0000-000000000001'
        })
        .select()
        .single()

    if (error) {
        return { success: false, error: error.message }
    }

    revalidatePath('/quotes')
    return { success: true, data }
}

// Add item to quote
export async function addQuoteItem(formData: z.infer<typeof quoteItemSchema>) {
    const supabase = await createClient()

    const parsed = quoteItemSchema.safeParse(formData)
    if (!parsed.success) {
        return { success: false, error: parsed.error.flatten().fieldErrors }
    }

    const { data, error } = await supabase
        .from('quote_items')
        .insert(parsed.data)
        .select()
        .single()

    if (error) {
        return { success: false, error: error.message }
    }

    revalidatePath('/quotes')
    return { success: true, data }
}

// Remove item from quote
export async function removeQuoteItem(itemId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('quote_items')
        .delete()
        .eq('id', itemId)

    if (error) {
        return { success: false, error: error.message }
    }

    revalidatePath('/quotes')
    return { success: true }
}

// Update quote status
export async function updateQuoteStatus(quoteId: string, status: Quote['status']) {
    const supabase = await createClient()

    const updateData: Record<string, unknown> = { status }

    if (status === 'sent') {
        updateData.sent_at = new Date().toISOString()
    } else if (status === 'approved') {
        updateData.approved_at = new Date().toISOString()
    }

    const { data, error } = await supabase
        .from('quotes')
        .update(updateData)
        .eq('id', quoteId)
        .select()
        .single()

    if (error) {
        return { success: false, error: error.message }
    }

    revalidatePath('/quotes')
    return { success: true, data }
}

// Convert quote to sale
export async function convertQuoteToSale(quoteId: string) {
    const supabase = await createClient()

    // Get quote with items
    const { data: quote, error: quoteError } = await supabase
        .from('quotes')
        .select('*, items:quote_items(*)')
        .eq('id', quoteId)
        .single()

    if (quoteError || !quote) {
        return { success: false, error: 'Orçamento não encontrado' }
    }

    const { data: userData } = await supabase.auth.getUser()

    // Create sale
    const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert({
            seller_id: userData.user?.id,
            store_id: quote.store_id,
            total_gross: quote.total,
            total_net: quote.total,
            payment_method: 'pending'
        })
        .select()
        .single()

    if (saleError) {
        return { success: false, error: saleError.message }
    }

    // Create sale items
    const saleItems = quote.items.map((item: QuoteItem) => ({
        sale_id: sale.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price_at_sale: item.unit_price
    }))

    await supabase.from('sale_items').insert(saleItems)

    // Update quote status
    await updateQuoteStatus(quoteId, 'approved')

    revalidatePath('/quotes')
    revalidatePath('/sales')

    return { success: true, data: sale }
}
