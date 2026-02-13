import { createClient } from "@/lib/supabase/server";
import { NewProductDialog } from "@/components/products/new-product-dialog";
import { Filter, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductsContent } from "@/components/products/products-content";

export default async function ProductsPage() {
    const supabase = await createClient();
    const { data: products, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching products:", error);
    }

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
                        <Download className="w-4 h-4" /> Exportar
                    </Button>
                    <NewProductDialog />
                </div>
            </div>

            {/* Cards de Filtro + Tabela */}
            <ProductsContent products={products || []} />
        </div>
    );
}
