'use server'

import { createClient } from '@/lib/supabase/server'

export interface ReportFilters {
    startDate?: string
    endDate?: string
    sellerId?: string
    storeId?: string
}

export interface SalesReport {
    totalSales: number
    totalRevenue: number
    avgTicket: number
    productsSold: number
    topProducts: { name: string; quantity: number; revenue: number }[]
    topSellers: { name: string; sales: number; revenue: number }[]
    salesByPeriod: { date: string; count: number; revenue: number }[]
    paymentMethods: { method: string; count: number; total: number }[]
}

export interface PipelineReport {
    totalDeals: number
    totalValue: number
    avgDealValue: number
    conversionRate: number
    dealsByStage: { name: string; count: number; value: number; color: string }[]
    avgTimeToClose: number
    wonDeals: number
    lostDeals: number
}

// Get sales report
export async function getSalesReport(filters: ReportFilters = {}): Promise<{ success: boolean; data?: SalesReport; error?: string }> {
    const supabase = await createClient()

    const { startDate, endDate, sellerId } = filters

    // Build base query
    let salesQuery = supabase
        .from('sales')
        .select(`
            id,
            total_gross,
            total_net,
            payment_method,
            created_at,
            seller_id
        `)

    if (startDate) {
        salesQuery = salesQuery.gte('created_at', startDate)
    }
    if (endDate) {
        salesQuery = salesQuery.lte('created_at', endDate)
    }
    if (sellerId) {
        salesQuery = salesQuery.eq('seller_id', sellerId)
    }

    const { data: sales, error: salesError } = await salesQuery

    if (salesError) {
        return { success: false, error: salesError.message }
    }

    // Get sale items for top products
    const saleIds = sales?.map(s => s.id) || []

    const { data: saleItems } = await supabase
        .from('sale_items')
        .select(`
            quantity,
            unit_price_at_sale,
            product:products(id, name)
        `)
        .in('sale_id', saleIds)

    // Calculate stats
    const totalSales = sales?.length || 0
    const totalRevenue = sales?.reduce((sum, s) => sum + (s.total_gross || 0), 0) || 0
    const avgTicket = totalSales > 0 ? totalRevenue / totalSales : 0
    const productsSold = saleItems?.reduce((sum, item) => sum + item.quantity, 0) || 0

    // Top products
    const productMap = new Map<string, { name: string; quantity: number; revenue: number }>()
    saleItems?.forEach(item => {
        // Handle Supabase join which may return array or object
        const productRaw = item.product as unknown
        const product = Array.isArray(productRaw) ? productRaw[0] as { id: string; name: string } | undefined : productRaw as { id: string; name: string } | null
        const productName = product?.name || 'Desconhecido'
        const existing = productMap.get(productName) || { name: productName, quantity: 0, revenue: 0 }
        existing.quantity += item.quantity
        existing.revenue += item.quantity * item.unit_price_at_sale
        productMap.set(productName, existing)
    })
    const topProducts = Array.from(productMap.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10)

    // Payment methods
    const paymentMap = new Map<string, { count: number; total: number }>()
    sales?.forEach(sale => {
        const method = sale.payment_method || 'Outros'
        const existing = paymentMap.get(method) || { count: 0, total: 0 }
        existing.count++
        existing.total += sale.total_gross || 0
        paymentMap.set(method, existing)
    })
    const paymentMethods = Array.from(paymentMap.entries()).map(([method, data]) => ({
        method,
        count: data.count,
        total: data.total
    }))

    // Sales by period (daily)
    const dateMap = new Map<string, { count: number; revenue: number }>()
    sales?.forEach(sale => {
        const date = new Date(sale.created_at).toISOString().split('T')[0]
        const existing = dateMap.get(date) || { count: 0, revenue: 0 }
        existing.count++
        existing.revenue += sale.total_gross || 0
        dateMap.set(date, existing)
    })
    const salesByPeriod = Array.from(dateMap.entries())
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => a.date.localeCompare(b.date))

    return {
        success: true,
        data: {
            totalSales,
            totalRevenue,
            avgTicket,
            productsSold,
            topProducts,
            topSellers: [], // Would need auth.users join
            salesByPeriod,
            paymentMethods
        }
    }
}

// Get pipeline report
export async function getPipelineReport(): Promise<{ success: boolean; data?: PipelineReport; error?: string }> {
    const supabase = await createClient()

    // Get all deals with stages
    const { data: deals, error: dealsError } = await supabase
        .from('deals')
        .select(`
            id,
            value,
            created_at,
            updated_at,
            stage:deal_stages(id, name, slug, color)
        `)

    if (dealsError) {
        return { success: false, error: dealsError.message }
    }

    const totalDeals = deals?.length || 0
    const totalValue = deals?.reduce((sum, d) => sum + (d.value || 0), 0) || 0
    const avgDealValue = totalDeals > 0 ? totalValue / totalDeals : 0

    // Helper to extract stage from Supabase join (may be array or object)
    type StageObject = { id: string; name: string; slug: string; color: string }
    const getStage = (stageRaw: unknown): StageObject | null => {
        if (Array.isArray(stageRaw)) return stageRaw[0] as StageObject || null
        return stageRaw as StageObject | null
    }

    // Won and lost
    const wonDeals = deals?.filter(d => getStage(d.stage)?.slug === 'won').length || 0
    const lostDeals = deals?.filter(d => getStage(d.stage)?.slug === 'lost').length || 0
    const closedDeals = wonDeals + lostDeals
    const conversionRate = closedDeals > 0 ? (wonDeals / closedDeals) * 100 : 0

    // Deals by stage
    const stageMap = new Map<string, { name: string; count: number; value: number; color: string }>()
    deals?.forEach(deal => {
        const stage = getStage(deal.stage)
        const stageName = stage?.name || 'Sem estágio'
        const existing = stageMap.get(stageName) || {
            name: stageName,
            count: 0,
            value: 0,
            color: stage?.color || '#6B7280'
        }
        existing.count++
        existing.value += deal.value || 0
        stageMap.set(stageName, existing)
    })
    const dealsByStage = Array.from(stageMap.values())

    // Average time to close (for won deals)
    const wonDealsList = deals?.filter(d => getStage(d.stage)?.slug === 'won') || []
    let avgTimeToClose = 0
    if (wonDealsList.length > 0) {
        const totalDays = wonDealsList.reduce((sum, d) => {
            const created = new Date(d.created_at).getTime()
            const updated = new Date(d.updated_at).getTime()
            return sum + (updated - created) / (1000 * 60 * 60 * 24)
        }, 0)
        avgTimeToClose = totalDays / wonDealsList.length
    }

    return {
        success: true,
        data: {
            totalDeals,
            totalValue,
            avgDealValue,
            conversionRate,
            dealsByStage,
            avgTimeToClose,
            wonDeals,
            lostDeals
        }
    }
}

// Export sales to CSV
export async function exportSalesCSV(filters: ReportFilters = {}): Promise<{ success: boolean; data?: string; error?: string }> {
    const supabase = await createClient()

    let query = supabase
        .from('sales')
        .select(`
            id,
            total_gross,
            total_net,
            payment_method,
            created_at,
            items:sale_items(quantity, unit_price_at_sale, product:products(name, sku))
        `)
        .order('created_at', { ascending: false })

    if (filters.startDate) {
        query = query.gte('created_at', filters.startDate)
    }
    if (filters.endDate) {
        query = query.lte('created_at', filters.endDate)
    }

    const { data: sales, error } = await query

    if (error) {
        return { success: false, error: error.message }
    }

    // Build CSV
    const headers = ['ID', 'Data', 'Valor Bruto', 'Valor Líquido', 'Forma Pagamento', 'Itens']
    const rows = sales?.map(sale => [
        sale.id,
        new Date(sale.created_at).toLocaleDateString('pt-BR'),
        sale.total_gross.toFixed(2),
        sale.total_net.toFixed(2),
        sale.payment_method,
        sale.items?.length || 0
    ]) || []

    const csv = [
        headers.join(';'),
        ...rows.map(row => row.join(';'))
    ].join('\n')

    return { success: true, data: csv }
}
