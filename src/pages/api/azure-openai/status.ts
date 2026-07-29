import type { NextApiRequest, NextApiResponse } from "next";
import { getAzureOpenAIStatus } from "@/lib/azureOpenAI";

export default function handler(_request: NextApiRequest, response: NextApiResponse) {
  response.status(200).json(getAzureOpenAIStatus());
}
