import { createClient } from "@/lib/supabase/server";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { NewProductDialog } from "@/components/products/new-product-dialog";
import { Product } from "@/types/schema";
import { Package, Filter, Download, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

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
            <div className="card-gradient rounded-xl overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="border-white/5 hover:bg-transparent">
                            <TableHead className="text-text-muted font-medium">SKU</TableHead>
                            <TableHead className="text-text-muted font-medium">Produto</TableHead>
                            <TableHead className="text-text-muted font-medium">Categoria</TableHead>
                            <TableHead className="text-right text-text-muted font-medium">Custo</TableHead>
                            <TableHead className="text-right text-text-muted font-medium">Venda</TableHead>
                            <TableHead className="text-right text-text-muted font-medium">Margem</TableHead>
                            <TableHead className="text-right text-text-muted font-medium">Estoque</TableHead>
                            <TableHead className="text-right text-text-muted font-medium">Status</TableHead>
                            <TableHead className="w-10"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {(!products || products.length === 0) ? (
                            <TableRow>
                                <TableCell colSpan={9} className="h-32 text-center">
                                    <div className="flex flex-col items-center justify-center text-text-muted">
                                        <Package className="w-12 h-12 mb-3 opacity-50" />
                                        <p className="font-medium">Nenhum produto cadastrado</p>
                                        <p className="text-sm">Clique em "Novo Produto" para começar</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            products.map((product: Product) => {
                                const margin = ((product.sale_price - product.cost_price) / product.sale_price * 100).toFixed(1);
                                const isLowStock = product.current_stock <= product.min_stock;

                                return (
                                    <TableRow
                                        key={product.id}
                                        className="border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                                    >
                                        <TableCell className="font-mono text-sm text-text-secondary">{product.sku}</TableCell>
                                        <TableCell className="font-medium text-text-primary">{product.name}</TableCell>
                                        <TableCell>
                                            <span className="px-2 py-1 rounded-full bg-white/5 text-text-secondary text-xs">
                                                {product.category}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right text-text-muted">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.cost_price)}
                                        </TableCell>
                                        <TableCell className="text-right text-accent font-semibold">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.sale_price)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <span className={`font-medium ${Number(margin) >= 40 ? 'text-green-500' : Number(margin) >= 20 ? 'text-yellow-500' : 'text-red-500'}`}>
                                                {margin}%
                                            </span>
                                        </TableCell>
                                        <TableCell className={`text-right font-medium ${isLowStock ? 'text-red-500' : 'text-text-primary'}`}>
                                            {product.current_stock}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {isLowStock ? (
                                                <span className="inline-flex items-center rounded-full bg-red-500/10 px-3 py-1 text-xs font-medium text-red-400 ring-1 ring-inset ring-red-500/20">
                                                    Repor
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400 ring-1 ring-inset ring-green-500/20">
                                                    OK
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                                                <MoreHorizontal className="w-4 h-4 text-text-muted" />
                                            </button>
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
