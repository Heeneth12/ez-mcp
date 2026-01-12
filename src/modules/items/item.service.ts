import { API_CONFIG, apiClient } from "../../config/api.config";
import { ItemModel, ItemSearchFilter } from "./item.types";

const ITEMS_BASE_URL = API_CONFIG.BASE_URL + '/v1/items';

export const ItemService = {

    /**
     * 1. GET ALL ITEMS (Paginated & Filtered)
     * Matches: POST /v1/items/all?page=0&size=10
     */
    getAll: async (page: number, size: number, filter: ItemSearchFilter, token: string) => {
        // Merge "active: true" default if you want standard behavior, or let filter override it
        const payload = {
            active: true,
            ...filter
        };
        const response = await apiClient.post(
            `${ITEMS_BASE_URL}/all?page=${page}&size=${size}`,
            payload,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
    },

    /**
     * 2. CREATE ITEM
     * Matches: POST /v1/items
     */
    create: async (item: ItemModel, token: string) => {
        const response = await apiClient.post(
            `${ITEMS_BASE_URL}`,
            item,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
    },

    /**
     * 3. GET ITEM BY ID
     * Matches: GET /v1/items/{id}
     */
    getById: async (id: number | string, token: string) => {
        const response = await apiClient.get(
            `${ITEMS_BASE_URL}/${id}`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
    },

    /**
     * 4. UPDATE ITEM
     * Matches: POST /v1/items/{id}/update
     */
    update: async (id: number | string, item: Partial<ItemModel>, token: string) => {
        const response = await apiClient.post(
            `${ITEMS_BASE_URL}/${id}/update`,
            item,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
    },

    /**
     * 5. TOGGLE ACTIVE STATUS
     * Matches: POST /v1/items/{id}/status?active={bool}
     */
    toggleStatus: async (id: number | string, isActive: boolean, token: string) => {
        const response = await apiClient.post(
            `${ITEMS_BASE_URL}/${id}/status?active=${isActive}`,
            {}, // Empty body
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
    },

    /**
     * 6. SEARCH ITEMS (Dedicated Endpoint)
     * Matches: POST /v1/items/search
     */
    search: async (searchFilter: ItemSearchFilter, token: string) => {
        const response = await apiClient.post(
            `${ITEMS_BASE_URL}/search`,
            searchFilter,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
    },

    // --- BULK OPERATIONS ---

    /**
     * 7. GET TEMPLATE URL
     * Helper to get the template link
     */
    getTemplateUrl: () => {
        return `${ITEMS_BASE_URL}/template`;
    },

    /**
     * 8. GET BULK DOWNLOAD URL
     * Helper to get the bulk download link
     */
    getBulkDownloadUrl: () => {
        return `${ITEMS_BASE_URL}/bulk/download`;
    }
};