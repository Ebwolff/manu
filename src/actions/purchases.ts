"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

interface ItemPayload {
    product_id: string
    quantity: number
    unit_price: number
    effective_unit_cost: number
    suggested_sale_price: number
    product_sku?: string
    product_name?: string
}

interface PurchaseData {
    supplier: string
    invoice_number: string
    freight_cost: number
    tax_cost: number
    other_costs: number
    items: ItemPayload[]
}

export async function processPurchase(data: PurchaseData) {
    const supabase = await createClient()

    // 1. Calculate Totals
    const total_products_amount = data.items.reduce((acc, item) => acc + (item.quantity * item.unit_price), 0)
    const total_purchase_amount = total_products_amount + data.freight_cost + data.tax_cost + data.other_costs

    // 2. Insert Purchase Header
    const { data: purchase, error: purchaseError } = await supabase
        .from('purchases')
        .insert({
            supplier_name: data.supplier,
            invoice_number: data.invoice_number,
            total_products_amount,
            freight_cost: data.freight_cost,
            tax_cost: data.tax_cost,
            other_costs: data.other_costs,
            total_purchase_amount
        })
        .select()
        .single()

    if (purchaseError) {
        console.error("Error creating purchase:", purchaseError)
        return { success: false, error: "Failed to create purchase record." }
    }

    const purchaseId = purchase.id

    // 3. Process Items (Insert Item + Update/Create Product)
    for (const item of data.items) {
        let finalProductId = item.product_id

        // If product doesn't exist, create it
        if (!finalProductId) {
            const { data: newProduct, error: createError } = await supabase
                .from('products')
                .insert({
                    sku: item.product_sku,
                    name: item.product_name || "Novo Produto",
                    cost_price: item.effective_unit_cost,
                    sale_price: item.suggested_sale_price,
                    current_stock: 0, // Will be updated below
                    min_stock: 5,
                    category: 'Acessórios' // Default category
                })
                .select()
                .single()

            if (createError) {
                console.error("Error creating new product:", createError)
                continue
            }
            finalProductId = newProduct.id
        }

        // A. Insert Purchase Item
        const { error: itemError } = await supabase
            .from('purchase_items')
            .insert({
                purchase_id: purchaseId,
                product_id: finalProductId,
                quantity: item.quantity,
                unit_price: item.unit_price,
                effective_unit_cost: item.effective_unit_cost,
                total_line_amount: item.quantity * item.unit_price
            })

        if (itemError) {
            console.error("Error inserting item:", itemError)
        }

        // B. Update Product (Stock + Cost Price + Sale Price)
        const { data: product } = await supabase.from('products').select('current_stock').eq('id', finalProductId).single()
        const currentStock = product?.current_stock || 0
        const newStock = currentStock + item.quantity

        await supabase
            .from('products')
            .update({
                current_stock: newStock,
                cost_price: item.effective_unit_cost,
                sale_price: item.suggested_sale_price
            })
            .eq('id', finalProductId)
    }

    revalidatePath('/products')
    revalidatePath('/')
    redirect('/products')
}

