import { z } from "zod";
import { ItemService } from "./item.service";
import { ItemModel, ItemSearchFilter } from "./item.types";

export const itemTools = [

    //TOOL 1: Get All Items (Smart Filter)
    {
        name: "get_all_items",
        description: "Browse the full inventory catalog or items. Use this tool when the user asks to 'list', 'show', 'browse', or 'filter' items. " +
            "Useful for queries like 'Show me all items', 'List active services','List active products' or 'What brands do we have?'. " +
            "Supports filtering by Type (Goods/Services), Category, Brand, and Status.",
       // description: "Fetch a list of inventory items (PRODUCT or SERVICE). It is a items (PRODUCT/SERVICE) catalog. You can filter by Category, Brand, Type (PRODUCT/SERVICE), or Active status. If the user wants to see the next page of results, increment the 'page' parameter.",
        parameters: z.object({
            page: z.number().default(0).describe("Page number (starts at 0)"),
            size: z.number().default(10).describe("Number of items per page"),
            itemType: z.enum(['PRODUCT', 'SERVICE']).optional().describe("Filter by Item Type"),
            brand: z.string().optional().describe("Filter by Brand Name"),
            category: z.string().optional().describe("Filter by Category"),
            active: z.boolean().default(true).describe("Filter by Active status (default true)")
        }),
        execute: async (args: any, token: string) => {
            try {
                const filter: ItemSearchFilter = {
                    itemType: args.itemType ? args.itemType === "" ? null : args.itemType : null,
                    brand: args.brand,
                    category: args.category,
                    active: args.active
                };
                console.log("Fetching items with filter:", filter);
                const data = await ItemService.getAll(args.page, args.size, filter, token);
                return JSON.stringify(data);
            } catch (error: any) {
                return `Error fetching items: ${error.message}`;
            }
        }
    },

    //Search Items (Keyword Search)
    {
        name: "search_items",
        description: "Search for items using a specific keyword (matches Name or Description).",
        parameters: z.object({
            query: z.string().describe("The search keyword (e.g. 'Samsung', 'Cable')")
        }),
        execute: async (args: { query: string }, token: string) => {
            try {
                const filter: ItemSearchFilter = { searchQuery: args.query };
                // We use page 0, size 20 for search results by default
                const data = await ItemService.search(filter, token);
                return JSON.stringify(data);
            } catch (error: any) {
                return `Search failed: ${error.message}`;
            }
        }
    },

    //Add New Item
    {
        name: "add_item",
        description: "Create a new inventory item. REQUIRES: Name, Category, Unit, Purchase Price, and Selling Price.",
        parameters: z.object({
            name: z.string().describe("Item Name"),
            category: z.string().describe("Category (e.g., Electronics, Raw Material)"),
            unitOfMeasure: z.string().describe("Unit (e.g., PCS, KG, BOX)"),
            purchasePrice: z.number().describe("Buying Price (Cost)"),
            sellingPrice: z.number().describe("Selling Price (MRP/Sales)"),
            // Optional Fields
            itemType: z.enum(['PRODUCT', 'SERVICE']).default('PRODUCT'),
            brand: z.string().optional(),
            manufacturer: z.string().optional(),
            itemCode: z.string().optional().describe("Unique Item Code. If omitted, one will be generated."),
            sku: z.string().optional(),
            barcode: z.string().optional(),
            hsnSacCode: z.string().optional(),
            description: z.string().optional(),
            taxPercentage: z.number().optional(),
            discountPercentage: z.number().optional()
        }),
        execute: async (args: any, token: string) => {
            try {
                // Logic: Auto-generate code if missing (Mirroring your Angular logic)
                const generatedCode = args.itemCode || `ITM-${Math.floor(1000 + Math.random() * 9000)}`;

                const payload: ItemModel = {
                    ...args,
                    itemCode: generatedCode,
                    isActive: true // Default to true on creation
                };

                const response = await ItemService.create(payload, token);
                return `Success! Created Item '${args.name}' with Code: ${generatedCode}.`;
            } catch (error: any) {
                // Safe error handling to show message to user
                const errorMsg = error.response?.data?.message || error.message;
                return `Failed to create item. Reason: ${errorMsg}`;
            }
        }
    },

    //Edit Item
    {
        name: "edit_item",
        description: "Update details of an existing item. You MUST identify the item by its numeric ID.",
        parameters: z.object({
            id: z.number().describe("The numeric ID of the item to update"),
            // All fields are optional because we might only update one
            name: z.string().optional(),
            sellingPrice: z.number().optional(),
            purchasePrice: z.number().optional(),
            category: z.string().optional(),
            brand: z.string().optional(),
            description: z.string().optional()
        }),
        execute: async (args: any, token: string) => {
            try {
                const { id, ...updates } = args;
                await ItemService.update(id, updates, token);
                return `Successfully updated details for Item ID ${id}.`;
            } catch (error: any) {
                return `Update failed: ${error.message}`;
            }
        }
    },

    //TOOL 5: Toggle Active Status (Soft Delete)
    {
        name: "toggle_item_status",
        description: "Enable or Disable an item (Soft Delete).",
        parameters: z.object({
            id: z.number().describe("The numeric ID of the item"),
            active: z.boolean().describe("True to enable, False to disable")
        }),
        execute: async (args: { id: number, active: boolean }, token: string) => {
            try {
                await ItemService.toggleStatus(args.id, args.active, token);
                return `Item ${args.id} is now ${args.active ? 'Active' : 'Inactive'}.`;
            } catch (error: any) {
                return `Status change failed: ${error.message}`;
            }
        }
    },

    // TOOL 6: Get Bulk Template
    {
        name: "get_bulk_template",
        description: "Get the download link for the Item Import Excel Template.",
        parameters: z.object({}), // No params needed
        execute: async (_: any, token: string) => {
            try {
                const url = ItemService.getTemplateUrl();
                return `You can download the template here: ${url}`;
            } catch (error: any) {
                return `Error getting template: ${error.message}`;
            }
        }
    }
];