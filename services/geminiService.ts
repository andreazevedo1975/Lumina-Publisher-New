import { GoogleGenAI, Type, SchemaParams } from "@google/genai";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("A chave da API Gemini está ausente.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export interface AnalysisResult {
  title: string;
  toc: { title: string; level: number }[];
  suggestedStyles: {
    headerFont: string;
    bodyFont: string;
    primaryColor: string;
  };
  semanticHTML: string;
}

export const analyzeManuscript = async (rawText: string): Promise<AnalysisResult | null> => {
  const ai = getAiClient();
  if (!ai) return null;

  // Schema for structured output
  const schema: SchemaParams = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "Título sugerido do livro" },
      toc: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            level: { type: Type.INTEGER, description: "1 para H1, 2 para H2" }
          }
        }
      },
      suggestedStyles: {
        type: Type.OBJECT,
        properties: {
          headerFont: { type: Type.STRING, description: "Nome de uma Google Font para títulos" },
          bodyFont: { type: Type.STRING, description: "Nome de uma Google Font para corpo de texto" },
          primaryColor: { type: Type.STRING, description: "Código Hex para cor de destaque" }
        }
      },
      semanticHTML: {
        type: Type.STRING,
        description: "O texto bruto convertido para HTML semântico limpo (h1, h2, p, blockquote) adequado para EPUB."
      }
    },
    required: ["title", "toc", "suggestedStyles", "semanticHTML"]
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Você é um diagramador e editor sênior especialista. Analise o seguinte trecho de manuscrito. 
      Identifique a estrutura (capítulos, títulos). 
      Sugira um par tipográfico profissional baseado no sentimento do texto (ex: Serifada para clássico, Sans para moderno). 
      Converta o texto para HTML semântico e limpo (sem tags head/body, apenas conteúdo).
      O conteúdo deve ser mantido em seu idioma original (se for Português, mantenha em Português).
      
      Trecho do Manuscrito:
      ${rawText.substring(0, 10000)}`, // Limit context window usage for demo
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        systemInstruction: "Saída apenas em JSON válido. Seja preciso com a marcação semântica."
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AnalysisResult;
    }
    return null;

  } catch (error) {
    console.error("Falha na Análise Gemini", error);
    return null;
  }
};

export const suggestAltText = async (imageBase64: string): Promise<string> => {
    const ai = getAiClient();
    if (!ai) return "Descrição da imagem indisponível.";

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash', // Using flash for speed on image analysis
            contents: [
                {
                    inlineData: {
                        mimeType: 'image/jpeg',
                        data: imageBase64
                    }
                },
                { text: "Gere uma descrição de texto alternativo concisa e acessível para esta imagem de um ebook, em Português do Brasil." }
            ]
        });
        return response.text || "";
    } catch (e) {
        console.error("Geração de texto alternativo falhou", e);
        return "";
    }
}