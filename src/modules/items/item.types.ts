export interface ItemModel {
    id?: number;
    name: string;
    itemCode: string;
    sku?: string;
    barcode?: string;
    itemType: 'SERVICE' | 'PRODUCT';
    imageUrl?: string;
    category: string;
    unitOfMeasure: string;
    brand?: string;
    manufacturer?: string;
    purchasePrice: number;
    sellingPrice: number;
    mrp?: number;
    taxPercentage?: number;
    discountPercentage?: number;
    hsnSacCode?: string;
    description?: string;
    isActive: boolean;
}

export interface ItemSearchFilter {
    searchQuery?: string | null;
    active?: boolean | null;
    itemType?: 'SERVICE' | 'PRODUCT' | null;
    brand?: string | null;
    category?: string | null;
}

export interface BulkUploadResponse {
    message: string;
    downloadUrl?: string;
}