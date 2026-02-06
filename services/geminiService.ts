
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeItem = async (
  imageContent?: string,
  textPrompt?: string
): Promise<AnalysisResult> => {
  const model = 'gemini-3-flash-preview';
  
  const systemInstruction = `
    당신은 학교 분실물 센터의 도우미입니다. 
    사용자가 제공한 이미지나 텍스트를 바탕으로 분실/습득물을 분석하여 제목, 카테고리, 태그, 설명을 JSON 형식으로 생성하세요.
    카테고리는 다음 중 하나여야 합니다: 전자기기, 의류, 학용품, 지갑/카드, 악세사리, 기타.
    태그는 검색에 용이한 키워드 3~5개를 한국어로 작성하세요.
  `;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: '물건의 간단한 명칭' },
      category: { type: Type.STRING, description: '전자기기, 의류, 학용품, 지갑/카드, 악세사리, 기타 중 하나' },
      tags: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING },
        description: '연관 키워드 리스트'
      },
      description: { type: Type.STRING, description: '물건에 대한 상세한 묘사' }
    },
    required: ['title', 'category', 'tags', 'description']
  };

  const parts: any[] = [];
  if (imageContent) {
    parts.push({
      inlineData: {
        mimeType: 'image/jpeg',
        data: imageContent.split(',')[1] // Remove prefix if present
      }
    });
  }
  
  if (textPrompt) {
    parts.push({ text: textPrompt });
  } else {
    parts.push({ text: "이 물건을 분석해주세요." });
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema
      }
    });

    return JSON.parse(response.text || '{}') as AnalysisResult;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      title: "알 수 없는 물건",
      category: "기타",
      tags: [],
      description: "분석에 실패했습니다."
    };
  }
};
