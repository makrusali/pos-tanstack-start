import type { ImageFile } from "#/components/image-upload";

export interface CreateSkuForm {
    id?: string;
    code: string;
    name: string;
    price: number;
    buy_price: number;
    status: 'active' | 'inactive';
    unit_id: string;
    images: ImageFile[];
    stock_locations: Array<{
        stock_location_id: string;
        quantity: number;
        is_primary: boolean;
    }>;
}

export interface UpdateSkuForm {
    id?: string;
    code: string;
    name: string;
    price: number;
    buy_price: number;
    status: 'active' | 'inactive';
    unit_id: string;
    images: ImageFile[];
    stock_locations: Array<{
        stock_location_id: string;
        quantity: number;
        is_primary: boolean;
    }>;
}