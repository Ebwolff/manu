"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { ProductForm } from "./product-form"
import { Product } from "@/types/schema"

interface EditProductDialogProps {
    product: Product
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function EditProductDialog({ product, open, onOpenChange }: EditProductDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Editar Produto</DialogTitle>
                    <DialogDescription>
                        Atualize as informações de estoque e precificação do produto.
                    </DialogDescription>
                </DialogHeader>
                <ProductForm product={product} onClose={() => onOpenChange(false)} />
            </DialogContent>
        </Dialog>
    )
}
