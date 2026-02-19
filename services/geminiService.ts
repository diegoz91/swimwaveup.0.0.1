

import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import type { ProfessionalUser } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateProfileSummary = async (profile: ProfessionalUser): Promise<string> => {
  try {
    const prompt = `
      Sei un esperto di personal branding per professionisti. 
      Scrivi un riassunto professionale (bio) di massimo 3-4 frasi per il seguente profilo di AquaNetwork.
      Sii conciso, professionale e metti in evidenza i punti di forza.
      NON usare markdown, solo testo semplice.

      Dettagli del profilo:
      - Nome: ${profile.name}
      - Titolo: ${profile.title}
      - Specializzazioni: ${profile.specializations.join(', ')}
      - Esperienza chiave: ${profile.experience[0].role} presso ${profile.experience[0].facility}
      - Bio attuale: ${profile.bio}

      Genera un nuovo riassunto basato su questi dati.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text.trim();
  } catch (error) {
    console.error("Error generating profile summary:", error);
    return "Non è stato possibile generare un riassunto al momento.";
  }
};


export const generateQuickReplies = async (lastMessage: string): Promise<string[]> => {
  try {
    const prompt = `
      You are a professional communication assistant for a social network.
      Based on the last message received in a chat, generate 3 short, professional quick replies.
      The replies must be concise (maximum 5-6 words).

      Last message: "${lastMessage}"

      Generate the 3 quick replies in Italian.
    `;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            replies: {
              type: Type.ARRAY,
              description: "List of 3 short, professional quick replies in Italian.",
              items: { type: Type.STRING }
            }
          },
          required: ["replies"]
        }
      }
    });

    const jsonText = response.text.trim();
    const json = JSON.parse(jsonText);
    return (json.replies || []).slice(0, 3);
  } catch (error) {
    console.error("Error generating quick replies:", error);
    return ["Grazie!", "Ok, ricevuto.", "Ci sentiamo presto."]; // Fallback replies
  }
};

const fileToGenerativePart = (file: File) => {
  return new Promise<{ inlineData: { data: string; mimeType: string; } }>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        return reject(new Error("Failed to read file as data URL."));
      }
      const data = reader.result.split(',')[1];
      resolve({
        inlineData: {
          data,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

export const generateImageAltText = async (imageFile: File): Promise<string> => {
    try {
        const imagePart = await fileToGenerativePart(imageFile);
        const textPart = { text: "Descrivi brevemente questa immagine per il testo alternativo (alt text) di un post su un social network. Sii conciso e descrittivo. Rispondi solo con la descrizione." };

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
        });

        return response.text.trim();
    } catch (error) {
        console.error("Error generating image alt text:", error);
        return "Non è stato possibile generare una descrizione.";
    }
};
