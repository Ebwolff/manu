"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Product } from "@/types/schema";
import { Package, MoreHorizontal, Edit2 } from "lucide-react";
import { useState } from "react";
import { EditProductDialog } from "./edit-product-dialog";

interface ProductTableProps {
    initialProducts: Product[];
}

export function ProductTable({ initialProducts }: ProductTableProps) {
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

    const handleEdit = (product: Product) => {
        setSelectedProduct(product);
        setIsEditDialogOpen(true);
    };

    return (
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
                    {(!initialProducts || initialProducts.length === 0) ? (
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
                        initialProducts.map((product: Product) => {
                            const margin = product.sale_price > 0
                                ? ((product.sale_price - product.cost_price) / product.sale_price * 100).toFixed(1)
                                : "0.0";
                            const isLowStock = product.current_stock <= product.min_stock;

                            return (
                                <TableRow
                                    key={product.id}
                                    className="border-white/5 hover:bg-white/5 transition-colors cursor-pointer group"
                                    onClick={() => handleEdit(product)}
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
                                        <button
                                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEdit(product);
                                            }}
                                        >
                                            <Edit2 className="w-4 h-4 text-text-muted group-hover:text-accent transition-colors" />
                                        </button>
                                    </TableCell>
                                </TableRow>
                            )
                        })
                    )}
                </TableBody>
            </Table>

            {selectedProduct && (
                <EditProductDialog
                    product={selectedProduct}
                    open={isEditDialogOpen}
                    onOpenChange={setIsEditDialogOpen}
                />
            )}
        </div>
    );
}
