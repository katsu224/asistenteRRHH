import { GoogleGenAI, Modality, Part } from "@google/genai";
import { KnowledgeItem } from '../types';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });
const textModel = 'gemini-2.5-flash';
const imageModel = 'gemini-2.5-flash-image';

const getBaseSystemInstruction = (botName: string) => 
  `Eres ${botName}, un asistente de Recursos Humanos experto y amigable. Tu conocimiento se limita estrictamente a los documentos e imágenes que se te proporcionan como contexto. Tu objetivo es ayudar a los empleados a comprender las políticas de la empresa. Responde únicamente basándote en el material proporcionado. Si la respuesta no está en el material, indica amablemente que no tienes esa información. Responde en español.`;

const buildKnowledgeParts = (knowledgeBase: KnowledgeItem[]): Part[] => {
  const parts: Part[] = [];
  knowledgeBase.forEach(item => {
    if (item.type === 'text') {
      parts.push({ text: `--- INICIO DEL DOCUMENTO: ${item.name} ---\n${item.content}\n--- FIN DEL DOCUMENTO ---` });
    } else if (item.type === 'image' && item.mimeType) {
      // Remove the data URL prefix e.g., "data:image/jpeg;base64,"
      const base64Data = item.content.split(',')[1];
      if (base64Data) {
        parts.push({
          inlineData: {
            mimeType: item.mimeType,
            data: base64Data,
          }
        });
      }
    }
  });
  return parts;
};

const generateContent = async (systemInstruction: string, userPrompt: string, knowledgeBase: KnowledgeItem[]) => {
  try {
    const knowledgeParts = buildKnowledgeParts(knowledgeBase);
    const promptParts: Part[] = [
      ...knowledgeParts,
      { text: `\n---\nBasado en el contexto anterior, responde la siguiente pregunta del empleado:\n"${userPrompt}"` }
    ];

    const response = await ai.models.generateContent({
      model: textModel,
      contents: { parts: promptParts },
      config: {
        systemInstruction: systemInstruction,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Error generating content:", error);
    return "Lo siento, ocurrió un error al procesar tu solicitud. Por favor, intenta de nuevo.";
  }
};

export const getAnswer = async (knowledgeBase: KnowledgeItem[], question: string, botName: string): Promise<string> => {
  return generateContent(getBaseSystemInstruction(botName), question, knowledgeBase);
};

export const reExplain = async (knowledgeBase: KnowledgeItem[], question: string, originalAnswer: string, botName: string): Promise<string> => {
  const systemInstruction = `${getBaseSystemInstruction(botName)} Un empleado no entendió una respuesta y ha pedido una explicación alternativa.`;
  const userPrompt = `Pregunta Original: "${question}"\nRespuesta Anterior: "${originalAnswer}"\n\nPor favor, explica la respuesta anterior de una manera diferente, usando una analogía o términos más sencillos para que sea más fácil de entender.`;
  return generateContent(systemInstruction, userPrompt, knowledgeBase);
};

export const getExample = async (knowledgeBase: KnowledgeItem[], question: string, originalAnswer: string, botName: string): Promise<string> => {
  const systemInstruction = `${getBaseSystemInstruction(botName)} Un empleado ha solicitado un ejemplo práctico relacionado con una respuesta.`;
  const userPrompt = `Pregunta Original: "${question}"\nRespuesta Anterior: "${originalAnswer}"\n\nPor favor, proporciona un ejemplo concreto y práctico que ilustre el punto principal de la respuesta anterior.`;
  return generateContent(systemInstruction, userPrompt, knowledgeBase);
};

export const generateImageForConcept = async (question: string, answer: string): Promise<string> => {
  try {
    const promptGenerationInstruction = `Basado en la siguiente pregunta y respuesta de un manual de empleado, crea un prompt corto y descriptivo en inglés para un modelo de generación de imágenes de IA. El prompt debe capturar la idea central de manera visual y abstracta. Debe ser apto para un entorno profesional. El prompt no debe contener más de 20 palabras.`;
    const promptGenerationUserPrompt = `Pregunta: "${question}"\nRespuesta: "${answer}"\n\nGenera el prompt para la imagen:`;
    
    const imagePromptResponse = await ai.models.generateContent({
        model: textModel,
        contents: promptGenerationUserPrompt,
        config: { systemInstruction: promptGenerationInstruction }
    });
    const imagePrompt = imagePromptResponse.text.trim();

    const imageResponse = await ai.models.generateContent({
        model: imageModel,
        contents: { parts: [{ text: imagePrompt }] },
        config: { responseModalities: [Modality.IMAGE] }
    });

    if (imageResponse.candidates && imageResponse.candidates[0].content.parts[0].inlineData) {
        const base64ImageBytes = imageResponse.candidates[0].content.parts[0].inlineData.data;
        return `data:image/png;base64,${base64ImageBytes}`;
    } else {
        throw new Error("No se pudo generar la imagen.");
    }
  } catch (error) {
    console.error("Error generating image:", error);
    throw new Error("No se pudo generar la imagen. Por favor, intenta de nuevo.");
  }
};
