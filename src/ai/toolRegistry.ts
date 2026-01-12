import { itemTools } from "../modules/items/item.tools";

// Combine all tools here
const allTools = [
    ...itemTools,
    // ...employeeTools 
];

// Helper to format tools for Gemini
export const getGeminiTools = () => {
    return [{
        functionDeclarations: allTools.map(t => ({
            name: t.name,
            description: t.description,
            parameters: {
                type: "object",
                properties: getZodProperties(t.parameters),
                required: Object.keys((t.parameters as any).shape)
            }
        }))
    }];
};

// Helper to find and execute a tool
export const executeTool = async (name: string, args: any, token: string) => {
    const tool = allTools.find(t => t.name === name);
    if (!tool) throw new Error(`Tool ${name} not found`);
    return await tool.execute(args, token);
};

// Utility to convert Zod schema to JSON Schema for Gemini
function getZodProperties(zodObj: any) {
    const properties: any = {};
    for (const key in zodObj.shape) {
        const field = zodObj.shape[key];
        properties[key] = {
            type: field._def.typeName === "ZodNumber" ? "number" : "string",
            description: field.description
        };
    }
    return properties;
}