import { GoogleGenAI, Type } from "@google/genai";

export const handler = async (event: any) => {
  // POST 요청만 허용합니다.
  if (event.httpMethod !== "POST") {
    return { 
      statusCode: 405, 
      body: JSON.stringify({ error: "Method Not Allowed" }) 
    };
  }

  try {
    const { image, prompt } = JSON.parse(event.body);
    // Netlify 환경 변수에서 API 키를 가져옵니다.
    const apiKey = process.env.API_KEY;

    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: "API_KEY_MISSING", 
          message: "Netlify 환경 설정(Site settings > Environment variables)에서 API_KEY가 설정되지 않았습니다." 
        })
      };
    }

    // GoogleGenAI 초기화 (지침 준수)
    const ai = new GoogleGenAI({ apiKey });
    
    // 분석을 위한 시스템 명령어 설정
    const systemInstruction = `
      당신은 학교 분실물 센터의 AI 도우미입니다. 
      제공된 이미지나 텍스트를 분석하여 다음 정보를 JSON 형식으로 정확히 반환하세요:
      - title: 물건의 이름 (예: 파란색 필통, 흰색 에어팟)
      - category: '전자기기', '의류', '학용품', '지갑/카드', '악세사리', '기타' 중 하나를 선택
      - tags: 검색에 도움이 될만한 키워드 3개 (문자열 리스트)
      - description: 물건의 특징 (색상, 상태, 고유한 특징 등)
    `;

    const parts: any[] = [];
    if (image) {
      // Base64 데이터에서 프리픽스(data:image/jpeg;base64,) 제거 후 전송
      const base64Data = image.includes(',') ? image.split(',')[1] : image;
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Data
        }
      });
    }
    
    parts.push({ text: prompt || "이 물건에 대해 상세히 분석해서 정보를 채워줘." });

    // 모델 호출 (gemini-3-flash-preview 사용)
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            category: { type: Type.STRING },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            description: { type: Type.STRING }
          },
          required: ['title', 'category', 'tags', 'description']
        }
      }
    });

    // .text 프로퍼티를 사용하여 결과 추출
    const resultText = response.text;

    return {
      statusCode: 200,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*" 
      },
      body: resultText
    };
  } catch (error: any) {
    console.error("Netlify Function Error:", error);
    
    let errorType = "SERVER_ERROR";
    let statusCode = error.status || 500;

    // 에러 메시지에 따른 유형 분류
    if (error.message?.toLowerCase().includes("quota") || statusCode === 429) {
      errorType = "QUOTA_EXCEEDED";
    } else if (error.message?.toLowerCase().includes("permission") || statusCode === 403) {
      errorType = "PERMISSION_DENIED";
    }

    return {
      statusCode,
      body: JSON.stringify({ 
        error: errorType, 
        message: error.message || "알 수 없는 서버 오류가 발생했습니다." 
      })
    };
  }
};