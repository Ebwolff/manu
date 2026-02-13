'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

// Validation Schema
const saleItemSchema = z.object({
    product_id: z.string().uuid(),
    quantity: z.number().min(1),
    unit_price: z.number().min(0)
})

const createSaleSchema = z.object({
    customer_id: z.string().uuid().optional(),
    total_gross: z.number().min(0),
    total_net: z.number().min(0),
    payment_method: z.string().min(1),
    items: z.array(saleItemSchema).min(1, 'Adicione pelo menos um item')
})

export async function createSale(formData: z.infer<typeof createSaleSchema>) {
    const supabase = await createClient()

    const parsed = createSaleSchema.safeParse(formData)
    if (!parsed.success) {
        return { success: false, error: parsed.error.flatten().fieldErrors }
    }

    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) return { success: false, error: 'Usuário não autenticado' }

    // Use DEFAULT_STORE_ID if available, or fetch from profile
    const store_id = process.env.DEFAULT_STORE_ID || '00000000-0000-0000-0000-000000000001'

    try {
        // 1. Insert Sale
        const { data: sale, error: saleError } = await supabase
            .from('sales')
            .insert({
                seller_id: userData.user.id,
                store_id,
                total_gross: parsed.data.total_gross,
                total_net: parsed.data.total_net,
                payment_method: parsed.data.payment_method
            })
            .select()
            .single()

        if (saleError) throw new Error(saleError.message)

        // 2. Insert Sale Items
        const { error: itemsError } = await supabase
            .from('sale_items')
            .insert(
                parsed.data.items.map(item => ({
                    sale_id: sale.id,
                    product_id: item.product_id,
                    quantity: item.quantity,
                    unit_price_at_sale: item.unit_price
                }))
            )

        if (itemsError) throw new Error(itemsError.message)

        // 3. Update Stock (One by one or via RPC if stock logic gets complex)
        for (const item of parsed.data.items) {
            const { error: stockError } = await supabase.rpc('decrement_stock', {
                p_id: item.product_id,
                p_quantity: item.quantity
            })

            // If RPC doesn't exist yet, we'll do it manually for now, 
            // but RPC is cleaner to avoid race conditions.
            if (stockError) {
                // Fallback approach if RPC is missing
                const { data: product } = await supabase
                    .from('products')
                    .select('current_stock')
                    .eq('id', item.product_id)
                    .single()

                if (product) {
                    await supabase
                        .from('products')
                        .update({ current_stock: product.current_stock - item.quantity })
                        .eq('id', item.product_id)
                }
            }
        }

        // 4. Add to Cash Flow
        await supabase.from('cash_flow').insert({
            store_id,
            amount: parsed.data.total_net,
            category: 'sale',
            description: `Venda #${sale.id.slice(0, 8)}`,
            created_by: userData.user.id
        })

        revalidatePath('/sales')
        revalidatePath('/')

        return { success: true, data: sale }
    } catch (err: any) {
        console.error('Error in createSale:', err)
        return { success: false, error: err.message }
    }
}
