import { createClient } from "@/lib/supabase/server";
import { NewProductDialog } from "@/components/products/new-product-dialog";
import { Package, Filter, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductTable } from "@/components/products/product-table";

export default async function ProductsPage() {
    const supabase = await createClient();
    const { data: products, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching products:", error);
    }

    const totalProducts = products?.length || 0;
    const lowStockCount = products?.filter(p => p.current_stock <= p.min_stock).length || 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-text-primary">Gestão de Produtos</h1>
                    <p className="text-text-secondary mt-1">Gerencie seu catálogo e estoque</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="gap-2 border-white/10 hover:bg-white/5">
                        <Filter className="w-4 h-4" /> Filtrar
                    </Button>
                    <Button variant="outline" className="gap-2 border-white/10 hover:bg-white/5">
                        <Download className="w-4 h-4" /> Exportar
                    </Button>
                    <NewProductDialog />
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="stat-card rounded-xl p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                        <Package className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                        <p className="text-text-muted text-sm">Total de Produtos</p>
                        <p className="text-2xl font-bold text-text-primary">{totalProducts}</p>
                    </div>
                </div>
                <div className="stat-card rounded-xl p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                        <Package className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                        <p className="text-text-muted text-sm">Estoque Baixo</p>
                        <p className="text-2xl font-bold text-red-500">{lowStockCount}</p>
                    </div>
                </div>
                <div className="stat-card rounded-xl p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                        <Package className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                        <p className="text-text-muted text-sm">Estoque Saudável</p>
                        <p className="text-2xl font-bold text-green-500">{totalProducts - lowStockCount}</p>
                    </div>
                </div>
                <div className="stat-card rounded-xl p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                        <Package className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                        <p className="text-text-muted text-sm">Categorias</p>
                        <p className="text-2xl font-bold text-accent">12</p>
                    </div>
                </div>
            </div>

            {/* Table */}
            <ProductTable initialProducts={products || []} />
        </div>
    );
}
