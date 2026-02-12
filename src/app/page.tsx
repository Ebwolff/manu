import { createClient } from "@/lib/supabase/server"
import { DashboardClient } from "@/components/dashboard/dashboard-client"

const quickActions = [
  { href: "/products", label: "Cadastrar Produto", iconName: "Package", description: "Adicione novos itens ao estoque" },
  { href: "/sales", label: "Nova Venda", iconName: "ShoppingCart", description: "Registre uma venda rapidamente" },
  { href: "/customers", label: "Novo Cliente", iconName: "Users", description: "Cadastre um novo cliente" },
  { href: "/calculator", label: "Calcular Preço", iconName: "TrendingUp", description: "Precifique produtos corretamente" },
]

export default async function DashboardPage() {
  const supabase = await createClient()

  // 1. Fetch Sales Today
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const { data: salesToday } = await supabase
    .from('sales')
    .select('total_net')
    .gte('created_at', today.toISOString())

  const totalSalesValue = salesToday?.reduce((acc, curr) => acc + Number(curr.total_net), 0) || 0
  const salesCount = salesToday?.length || 0

  // 2. Fetch Low Stock Products
  const { data: allProducts } = await supabase.from('products').select('current_stock, min_stock')
  const actualLowStockCount = allProducts?.filter(p => p.current_stock <= p.min_stock).length || 0
  const totalStockCount = allProducts?.length || 0

  // 3. Fetch Customers
  const { count: customersCount } = await supabase
    .from('customers')
    .select('*', { count: 'exact', head: true })

  const stats = [
    {
      title: "Faturamento Hoje",
      value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalSalesValue),
      rawValue: totalSalesValue,
      change: "Hoje",
      trend: "neutral" as const,
      iconName: "DollarSign",
      color: "from-green-500 to-emerald-600"
    },
    {
      title: "Vendas Hoje",
      value: salesCount.toString(),
      rawValue: salesCount,
      change: "Transações",
      trend: "neutral" as const,
      iconName: "ShoppingCart",
      color: "from-accent to-orange-600"
    },
    {
      title: "Produtos em Estoque",
      value: totalStockCount.toString(),
      rawValue: totalStockCount,
      change: `${actualLowStockCount} baixo estoque`,
      trend: actualLowStockCount > 0 ? "warning" as const : "up" as const,
      iconName: "Package",
      // FIXED: Changed from blue/indigo to amber/yellow
      color: "from-amber-500 to-yellow-600"
    },
    {
      title: "Clientes Ativos",
      value: customersCount?.toString() || "0",
      rawValue: customersCount || 0,
      change: "Total cadastrado",
      trend: "up" as const,
      iconName: "Users",
      // FIXED: Changed from banned color to rose/red (Purple Ban)
      color: "from-rose-500 to-red-600"
    },
  ]

  // Fetch only a few products for alerts to show
  const { data: alertProducts } = await supabase
    .from('products')
    .select('name, current_stock, min_stock')
    .lte('current_stock', 5)
    .limit(3)

  return (
    <DashboardClient
      stats={stats}
      quickActions={quickActions}
      alertProducts={alertProducts}
    />
  )
}
