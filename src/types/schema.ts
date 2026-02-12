export interface Product {
    id: string;
    sku: string;
    name: string;
    category: string;
    cost_price: number;
    sale_price: number;
    current_stock: number;
    min_stock: number;
    compatible_models: string[] | null;
    store_id: string;
    created_at?: string;
}

export interface Customer {
    id: string;
    name: string;
    whatsapp: string | null;
    current_device_model: string | null;
    last_purchase_date: string | null;
    store_id: string;
}
