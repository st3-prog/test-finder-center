
import { AnalysisResult } from "../types";

/**
 * 프론트엔드 서비스:
 * 이제 브라우저에서 직접 구글 API를 호출하지 않고,
 * 보안을 위해 생성한 Netlify Function(//.netlify/functions/analyze)을 호출합니다.
 */
export const analyzeItem = async (
  imageContent?: string,
  textPrompt?: string
): Promise<AnalysisResult> => {
  try {
    const response = await fetch("/.netlify/functions/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image: imageContent,
        prompt: textPrompt
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // 서버 함수에서 정의한 에러 타입이 있다면 해당 에러를 던짐
      if (data.error) {
        throw new Error(data.error);
      }
      throw new Error("API_ERROR");
    }

    return data as AnalysisResult;
  } catch (error: any) {
    console.error("Service Proxy Error:", error);
    throw error;
  }
};
