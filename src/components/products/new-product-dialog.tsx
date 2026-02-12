"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { ProductForm } from "./product-form"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useState } from "react"

export function NewProductDialog() {
    const [open, setOpen] = useState(false)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-accent hover:bg-accent/90 text-white gap-2">
                    <Plus className="w-4 h-4" /> Novo Produto
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Adicionar Novo Produto</DialogTitle>
                    <DialogDescription>
                        Preencha os dados do produto para adicionar ao estoque.
                    </DialogDescription>
                </DialogHeader>
                <ProductForm onClose={() => setOpen(false)} />
            </DialogContent>
        </Dialog>
    )
}
