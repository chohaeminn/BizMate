import type { NextApiRequest, NextApiResponse } from "next";
import { createAzureChatCompletion } from "@/lib/azureOpenAI";

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse,
) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  const body = request.body as { prompt?: string };

  if (!body.prompt) {
    response.status(400).json({ error: "prompt is required" });
    return;
  }

  try {
    const content = await createAzureChatCompletion([
      {
        role: "system",
        content:
          "당신은 소상공인 지원사업 추천 서비스 BizMate의 한국어 상담 도우미입니다. 답변은 간결하고 실무적으로 작성하세요.",
      },
      {
        role: "user",
        content: body.prompt,
      },
    ]);

    response.status(200).json({ content });
  } catch (error) {
    response.status(500).json({
      error: error instanceof Error ? error.message : "Azure OpenAI error",
    });
  }
}
