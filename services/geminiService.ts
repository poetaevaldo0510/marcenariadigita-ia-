import { GoogleGenAI, Modality, GenerateContentResponse, Type } from "@google/genai";
import type { Part } from "@google/genai";
// FIX: Removed the deprecated Marceneiro import. The Client type is used for 'marceneiros' and is handled elsewhere.
import type { Finish, ProjectHistoryItem, LocationState, PricedBomItem, ProjectLead, UserPerformance } from '../types.ts';
import { cleanAndParseJson } from "../utils/helpers.ts";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

function fileToGenerativePart(base64Data: string, mimeType: string): Part {
  return {
    inlineData: {
      data: base64Data,
      mimeType,
    },
  };
}

async function callApiWithRetry<T extends () => Promise<GenerateContentResponse>>(
  apiCall: T,
  maxRetries: number = 3
): Promise<GenerateContentResponse> {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await apiCall();
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed:`, error);
      attempt++;
      if (attempt >= maxRetries) {
        throw error;
      }
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error("API call failed after multiple retries.");
}

function processImageGenerationResponse(response: GenerateContentResponse, errorContext: string): string {
    // Check for blocking reasons first
    if (response.promptFeedback?.blockReason) {
        const blockReason = response.promptFeedback.blockReason;
        const blockMessage = response.promptFeedback.blockReasonMessage || 'Motivo não especificado.';
        console.error(`${errorContext} bloqueada. Motivo: ${blockReason}. Mensagem: ${blockMessage}`);
        throw new Error(`A ${errorContext} foi bloqueada por motivos de segurança: ${blockReason}. ${blockMessage}`);
    }

    // Check if the model refused to generate an image
    if (response.candidates?.[0]?.finishReason === 'NO_IMAGE') {
        console.error(`A IA se recusou a gerar uma imagem para ${errorContext}. Motivo: NO_IMAGE.`);
        throw new Error(`A IA não conseguiu gerar uma imagem para esta solicitação. Isso pode acontecer por motivos de segurança ou se o pedido for muito complexo. Tente reformular sua solicitação.`);
    }

    const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (imagePart?.inlineData?.data) {
        return imagePart.inlineData.data;
    }

    // If no image, check if there's a text response with an error
    const textPart = response.text;
    if (textPart) {
        console.error(`A IA retornou texto em vez de uma imagem durante ${errorContext}:`, textPart);
        throw new Error(`A IA retornou uma mensagem de texto em vez de uma imagem: "${textPart}"`);
    }

    // Generic error if nothing else matches
    console.error(`Resposta inesperada da IA durante ${errorContext}:`, JSON.stringify(response, null, 2));
    throw new Error(`Não foi possível realizar a ${errorContext}. A resposta da IA não continha dados de imagem ou texto de erro.`);
}


export async function generateImage(
    prompt: string, 
    base64Images: { data: string; mimeType: string }[] | null
): Promise<string> {
    const model = 'gemini-2.5-flash-image';

    const parts: Part[] = [{ text: prompt }];

    if (base64Images) {
        for (const img of base64Images) {
            parts.push(fileToGenerativePart(img.data, img.mimeType));
        }
    }

    const apiCall = () => ai.models.generateContent({
        model: model,
        contents: { parts: parts },
        config: { responseModalities: [Modality.IMAGE] },
    });
    
    const response = await callApiWithRetry(apiCall);
    return processImageGenerationResponse(response, `geração de imagem`);
}

export async function editImage(base64Data: string, mimeType: string, prompt: string): Promise<string> {
    const model = 'gemini-2.5-flash-image';
    
    const parts: Part[] = [
        fileToGenerativePart(base64Data, mimeType),
        { text: prompt }
    ];

    const apiCall = () => ai.models.generateContent({
        model: model,
        contents: { parts: parts },
        config: { responseModalities: [Modality.IMAGE] },
    });
    
    const response = await callApiWithRetry(apiCall);
    return processImageGenerationResponse(response, 'edição de imagem');
}

// FIX: Completed the truncated editFloorPlan function.
export async function editFloorPlan(base64Data: string, mimeType: string, prompt: string): Promise<string> {
    const model = 'gemini-2.5-flash-image';
    
    const parts: Part[] = [
        fileToGenerativePart(base64Data, mimeType),
        { text: prompt }
    ];

    const apiCall = () => ai.models.generateContent({
        model: model,
        contents: { parts: parts },
        config: { responseModalities: [Modality.IMAGE] },
    });
    
    const response = await callApiWithRetry(apiCall);
    return processImageGenerationResponse(response, 'edição de planta baixa');
}

// FIX: Added all missing functions to be exported.

export async function generateText(prompt: string): Promise<string> {
    const model = 'gemini-2.5-flash';
    const response = await callApiWithRetry(() => ai.models.generateContent({
        model: model,
        contents: prompt,
    }));
    return response.text;
}

export async function generateBom(project: ProjectHistoryItem): Promise<string> {
    const model = 'gemini-2.5-pro';
    const parts: Part[] = [];
    
    if (project.uploadedReferenceImageUrls) {
        for (const imageUrl of project.uploadedReferenceImageUrls) {
            const base64Data = imageUrl.split(',')[1];
            const mimeType = imageUrl.match(/data:(.*);/)?.[1] || 'image/png';
            parts.push(fileToGenerativePart(base64Data, mimeType));
        }
    }
    
    parts.push({ text: `Analyze the following furniture project description and any provided images to generate a detailed Bill of Materials (BOM) in Markdown format. The BOM should be practical for a woodworker.
    
    Project Description: "${project.description}"
    
    The BOM should include sections for:
    - Main panels (e.g., MDF, plywood), with quantity, dimensions (Length x Width x Thickness in mm), and description/use (e.g., "Side Panel").
    - Hardware (e.g., hinges, screws, handles), with quantity and description.
    - Finishing materials (e.g., edge banding, paint), if applicable.
    
    Format the output clearly using Markdown headings and lists.` });

    const response = await callApiWithRetry(() => ai.models.generateContent({
        model: model,
        contents: { parts },
    }));
    return response.text;
}

export async function generateCuttingPlan(project: ProjectHistoryItem, sheetWidth: number, sheetHeight: number): Promise<{ text: string; image: string; optimization: string }> {
    const model = 'gemini-2.5-pro';
    
    const prompt = `Based on the following Bill of Materials (BOM), generate a cutting plan for standard sheets of material measuring ${sheetWidth}mm x ${sheetHeight}mm.
    
    BOM:
    ${project.bom}
    
    Your response must contain three distinct parts:
    1.  **A textual cutting list:** A clear, step-by-step list of cuts to be made on each sheet. Use Markdown format.
    2.  **A visual diagram prompt:** A detailed, descriptive prompt that can be fed into an image generation AI to create a visual diagram of the cutting plan. This prompt should describe how the pieces from the BOM are laid out on one or more ${sheetWidth}x${sheetHeight}mm sheets to minimize waste. The diagram should be simple, 2D, black and white, and clearly label each piece with its dimensions.
    3.  **Optimization tips:** Provide a short paragraph with tips for optimizing the cutting process, such as blade kerf consideration or cutting order.
    
    Please structure your response by separating each part with '---CUT---'.
    Example:
    [Cutting List in Markdown]
    ---CUT---
    [Prompt for image generation]
    ---CUT---
    [Optimization tips]
    `;

    const textResponse = await callApiWithRetry(() => ai.models.generateContent({ model, contents: prompt }));
    const parts = textResponse.text.split('---CUT---');
    
    if (parts.length < 3) {
        throw new Error("Failed to generate all parts of the cutting plan.");
    }
    
    const cuttingListText = parts[0].trim();
    const imagePrompt = parts[1].trim();
    const optimizationText = parts[2].trim();

    const imageModel = 'gemini-2.5-flash-image';
    const imageResponse = await callApiWithRetry(() => ai.models.generateContent({
        model: imageModel,
        contents: { parts: [{ text: imagePrompt }] },
        config: { responseModalities: [Modality.IMAGE] },
    }));
    
    const imageBase64 = processImageGenerationResponse(imageResponse, 'geração de diagrama de plano de corte');

    return { text: cuttingListText, image: imageBase64, optimization: optimizationText };
}

export async function estimateProjectCosts(project: ProjectHistoryItem): Promise<{ materialCost: number; laborCost: number }> {
    const model = 'gemini-2.5-pro';
    const prompt = `Analyze the following furniture project to provide a cost estimate. Base your estimate on typical Brazilian market prices (in BRL) for materials and labor.
    
    Project Name: ${project.name}
    Project Description: ${project.description}
    Bill of Materials (BOM):
    ${project.bom}
    
    Return a JSON object with two keys: "materialCost" (estimated cost of all materials from the BOM) and "laborCost" (estimated cost for labor based on the project's complexity).
    Example: {"materialCost": 1250.50, "laborCost": 800.00}`;

    const response = await callApiWithRetry(() => ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    materialCost: { type: Type.NUMBER },
                    laborCost: { type: Type.NUMBER },
                },
                required: ["materialCost", "laborCost"]
            }
        }
    }));
    
    const jsonString = response.text;
    return cleanAndParseJson<{ materialCost: number; laborCost: number }>(jsonString);
}

export async function generateAssemblyDetails(project: ProjectHistoryItem): Promise<string> {
    const model = 'gemini-2.5-flash';
    const prompt = `Based on the project "${project.name}" with description "${project.description}" and this BOM:\n${project.bom}\n\nPlease generate step-by-step assembly instructions.`;
    const response = await callApiWithRetry(() => ai.models.generateContent({ model, contents: prompt }));
    return response.text;
}

export async function parseBomToList(bom: string): Promise<PricedBomItem[]> {
    const model = 'gemini-2.5-flash';
    const prompt = `Parse the following Bill of Materials (BOM) into a JSON array. Each item in the array should be an object with three keys: "item" (string), "qty" (string), and "dimensions" (string).
    
    BOM:
    ${bom}
    
    Example output: [{"item": "Lateral Panel", "qty": "2x", "dimensions": "700x500x18mm"}]
    `;
    
    const response = await callApiWithRetry(() => ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        item: { type: Type.STRING },
                        qty: { type: Type.STRING },
                        dimensions: { type: Type.STRING },
                    },
                    required: ["item", "qty", "dimensions"]
                }
            }
        }
    }));
    
    const jsonString = response.text;
    const parsedItems = cleanAndParseJson<{ item: string; qty: string; dimensions: string; }[]>(jsonString);
    return parsedItems.map(item => ({ ...item, isSearching: false }));
}

export async function findSupplierPrice(itemDescription: string): Promise<{ price: number; supplier: string; url: string; }> {
    const model = 'gemini-2.5-pro';
    const prompt = `Using Google Search, find the current price in BRL for the following woodworking item in Brazil: "${itemDescription}". Identify a major supplier (like Leo Madeiras, GMAD, etc.) if possible.
    
    Return the information in a single line with values separated by '||'.
    Format: PRICE||SUPPLIER||URL
    
    Example: 280.50||Leo Madeiras||https://www.leomadeiras.com.br/produto
    
    If you cannot find a price, use 0. If you cannot find a supplier or URL, leave it blank.
    Example if not found: 0||||
    `;

    const response = await callApiWithRetry(() => ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
        }
    }));
    
    const [priceStr, supplier, url] = response.text.trim().split('||');
    
    const price = parseFloat(priceStr);

    return {
        price: isNaN(price) ? 0 : price,
        supplier: supplier || "N/A",
        url: url || "",
    };
}

export async function calculateFinancialSummary(project: ProjectHistoryItem): Promise<any> {
    console.warn("calculateFinancialSummary is not implemented.");
    return { revenue: 0, cost: 0, profit: 0 };
}

export async function fetchSupplierCatalog(supplier: string): Promise<any[]> {
    console.warn("fetchSupplierCatalog is not implemented.");
    return [];
}

export async function calculateShippingCost(destination: string, items: any[]): Promise<number> {
    console.warn("calculateShippingCost is not implemented.");
    return 0;
}

export async function suggestAlternativeStyles(description: string, currentStyle: string, imageSrc: string): Promise<string[]> {
    const model = 'gemini-2.5-pro';
    const base64Data = imageSrc.split(',')[1];
    const mimeType = imageSrc.match(/data:(.*);/)?.[1] || 'image/png';

    const parts: Part[] = [
        fileToGenerativePart(base64Data, mimeType),
        {
            text: `Analyze the provided image of a furniture piece and its description. The current style is "${currentStyle}".
            Description: "${description}"
            Suggest 3 alternative design styles that would also fit this piece of furniture. Do not include the current style ("${currentStyle}") in your suggestions.
            Return your answer as a JSON array of strings.
            Example: ["Industrial", "Rustic", "Minimalist"]`
        }
    ];

    const response = await callApiWithRetry(() => ai.models.generateContent({
        model,
        contents: { parts },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
            }
        }
    }));

    return cleanAndParseJson<string[]>(response.text);
}

export async function suggestAlternativeFinishes(projectDescription: string, imageSrc: string, currentFinishName?: string): Promise<Finish[]> {
    const model = 'gemini-2.5-pro';
    const base64Data = imageSrc.split(',')[1];
    const mimeType = imageSrc.match(/data:(.*);/)?.[1] || 'image/png';

    let promptText = `Analyze the provided image of a furniture piece and its description. Suggest 3 alternative finishes that would complement this furniture piece, focusing on major Brazilian brands (like Duratex, Arauco, Guararapes, Sudati).
    Project Description: "${projectDescription}".`;

    if (currentFinishName) {
        promptText += ` Please exclude finishes similar to "${currentFinishName}".`;
    }

    promptText += ` Return a JSON array of objects. Each object must have these keys:
    - "id": A unique string identifier.
    - "name": The commercial name of the finish.
    - "description": A brief description of the finish's appearance.
    - "type": The material type, which must be one of: 'wood', 'solid', 'metal', 'stone', 'concrete', 'ceramic', 'fabric', 'glass', 'laminate', 'veneer'.
    - "imageUrl": A publicly accessible URL to an image of the finish.
    - "manufacturer": The name of the brand/manufacturer.`;

    const parts: Part[] = [
        fileToGenerativePart(base64Data, mimeType),
        { text: promptText }
    ];

    const response = await callApiWithRetry(() => ai.models.generateContent({
        model,
        contents: { parts },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.STRING },
                        name: { type: Type.STRING },
                        description: { type: Type.STRING },
                        type: { type: Type.STRING },
                        imageUrl: { type: Type.STRING },
                        manufacturer: { type: Type.STRING },
                    },
                    required: ["id", "name", "description", "type", "imageUrl", "manufacturer"]
                }
            }
        }
    }));

    return cleanAndParseJson<Finish[]>(response.text);
}


export async function generateFloorPlanFrom3D(project: ProjectHistoryItem): Promise<string> {
    const model = 'gemini-2.5-flash-image';
    const imageSrc = project.views3d[0];
    const base64Data = imageSrc.split(',')[1];
    const mimeType = imageSrc.match(/data:(.*);/)?.[1] || 'image/png';

    const prompt = `Convert this 3D photorealistic rendering of a furniture piece into a 2D top-down technical floor plan drawing. The drawing should be black and white, with clear lines and dimensions in millimeters based on the proportions in the image. Include overall dimensions (width, depth).
    
    Project Description for context: "${project.description}"`;

    const parts: Part[] = [
        fileToGenerativePart(base64Data, mimeType),
        { text: prompt }
    ];

    const apiCall = () => ai.models.generateContent({
        model: model,
        contents: { parts: parts },
        config: { responseModalities: [Modality.IMAGE] },
    });
    
    const response = await callApiWithRetry(apiCall);
    return processImageGenerationResponse(response, 'geração de planta baixa');
}

export async function generate3Dfrom2D(project: ProjectHistoryItem, style: string, finish: string): Promise<string> {
    if (!project.image2d) {
        throw new Error("Project does not have a 2D image to generate from.");
    }
    const model = 'gemini-2.5-flash-image';
    const imageSrc = project.image2d;
    const base64Data = imageSrc.split(',')[1];
    const mimeType = imageSrc.match(/data:(.*);/)?.[1] || 'image/png';

    const prompt = `Convert this 2D floor plan drawing into a 3D photorealistic rendering.
    
    - The design should follow the layout and dimensions shown in the 2D plan.
    - Apply a "${style}" design style.
    - The primary finish should be "${finish}".
    - The final image should be high-quality, with studio lighting, focused on the furniture piece.
    - Project Description for context: "${project.description}"`;

    const parts: Part[] = [
        fileToGenerativePart(base64Data, mimeType),
        { text: prompt }
    ];

    const apiCall = () => ai.models.generateContent({
        model: model,
        contents: { parts: parts },
        config: { responseModalities: [Modality.IMAGE] },
    });
    
    const response = await callApiWithRetry(apiCall);
    return processImageGenerationResponse(response, 'geração de vista 3D');
}

export async function suggestImageEdits(description: string, imageSrc: string): Promise<string[]> {
    const model = 'gemini-2.5-pro';
    const base64Data = imageSrc.split(',')[1];
    const mimeType = imageSrc.match(/data:(.*);/)?.[1] || 'image/png';

    const parts: Part[] = [
        fileToGenerativePart(base64Data, mimeType),
        {
            text: `Analyze the provided image and its description: "${description}".
            Suggest 3 creative and practical edits that could be made to this furniture piece. The suggestions should be short, actionable prompts for an image editing AI.
            Return your answer as a JSON array of strings.
            Example: ["Change the wood finish to a dark walnut", "Add gold handles to the drawers", "Place the furniture in a brightly lit living room setting"]`
        }
    ];

    const response = await callApiWithRetry(() => ai.models.generateContent({
        model,
        contents: { parts },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
            }
        }
    }));

    return cleanAndParseJson<string[]>(response.text);
}

export async function searchFinishes(query: string): Promise<Finish[]> {
    const model = 'gemini-2.5-pro';
    const prompt = `You are a search engine for a woodworker's finish catalog. Based on the user query, find 4 relevant finishes from major Brazilian brands (like Duratex, Arauco, Guararapes, Sudati).
    
    User query: "${query}"
    
    Return a JSON array of objects. Each object must have these keys:
    - "id": A unique string identifier (e.g., "duratex_cristallo").
    - "name": The commercial name of the finish.
    - "description": A brief description of the finish's appearance.
    - "type": The material type, which must be one of: 'wood' | 'solid' | 'metal' | 'stone' | 'concrete' | 'ceramic' | 'fabric' | 'glass' | 'laminate' | 'veneer'.
    - "imageUrl": A publicly accessible URL to an image of the finish.
    - "manufacturer": The name of the brand/manufacturer.`;
    
    const response = await callApiWithRetry(() => ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.STRING },
                        name: { type: Type.STRING },
                        description: { type: Type.STRING },
                        type: { type: Type.STRING },
                        imageUrl: { type: Type.STRING },
                        manufacturer: { type: Type.STRING },
                    },
                    required: ["id", "name", "description", "type", "imageUrl", "manufacturer"]
                }
            }
        }
    }));

    return cleanAndParseJson<Finish[]>(response.text);
}

export async function generateGroundedResponse(prompt: string, location: LocationState): Promise<{ text: string; sources: any[] }> {
    const model = 'gemini-2.5-flash';

    const config: any = {
        tools: [{ googleSearch: {} }],
    };

    if (location && (prompt.toLowerCase().includes('perto') || prompt.toLowerCase().includes('nearby') || prompt.toLowerCase().includes('próximos'))) {
        config.tools.push({ googleMaps: {} });
        config.toolConfig = {
            retrievalConfig: {
                latLng: {
                    latitude: location.latitude,
                    longitude: location.longitude
                }
            }
        };
    }

    const response = await callApiWithRetry(() => ai.models.generateContent({
        model,
        contents: prompt,
        config,
    }));

    const text = response.text;
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    return { text, sources };
}

export async function findProjectLeads(city: string): Promise<ProjectLead[]> {
    const model = 'gemini-2.5-pro';
    
    const prompt = `Generate a realistic list of 3-5 project leads for a woodworker in the city of ${city}, Brazil.
    
    Return a JSON array of objects. Each object must represent a project lead and have these keys:
    - "id": A unique string ID for the lead.
    - "title": A short, descriptive title for the project.
    - "description": A one-sentence description of what the client wants.
    - "location": The neighborhood and city.
    - "budget": A string representing the client's budget range (e.g., "R$ 5.000 - R$ 8.000").
    `;

    const response = await callApiWithRetry(() => ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.STRING },
                        title: { type: Type.STRING },
                        description: { type: Type.STRING },
                        location: { type: Type.STRING },
                        budget: { type: Type.STRING },
                    },
                    required: ["id", "title", "description", "location", "budget"]
                }
            }
        }
    }));

    return cleanAndParseJson<ProjectLead[]>(response.text);
}

export async function getUserPerformance(userEmail: string): Promise<UserPerformance> {
    console.log(`Fetching performance for ${userEmail}. This is mock data.`);
    // In a real application, this would fetch data from a backend service.
    // For this simulation, we'll return a static, realistic-looking object.
    return Promise.resolve({
        points: 1250,
        level: 5,
        progress: 62.5, // (1250 - 1000) / (2000 - 1000) * 100
        nextLevelPoints: 2000,
        achievements: [
            { id: 'achv1', name: 'Projetista Rápido', description: 'Completou 10 projetos em uma semana.', icon: 'bolt' },
            { id: 'achv2', name: 'Mestre do Detalhe', description: 'Usou BOM e Plano de Corte 20 vezes.', icon: 'ruler' },
            { id: 'achv3', name: 'Favorito dos Clientes', description: 'Recebeu 5 avaliações positivas.', icon: 'heart' },
        ],
    });
}