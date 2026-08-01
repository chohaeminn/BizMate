type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type AzureChatChoice = {
  message?: {
    content?: string;
  };
};

type AzureChatResponse = {
  choices?: AzureChatChoice[];
};

const azureOpenAIScope = "https://cognitiveservices.azure.com/.default";

const requiredAzureEnv = [
  "AZURE_OPENAI_ENDPOINT",
  "AZURE_OPENAI_DEPLOYMENT",
] as const;

async function getAzureAccessToken() {
  const { DefaultAzureCredential } = await import("@azure/identity");
  const credential = new DefaultAzureCredential();
  const token = await credential.getToken(azureOpenAIScope);

  if (!token?.token) {
    throw new Error("Azure OpenAI access token could not be acquired");
  }

  return token.token;
}

export function getAzureOpenAIStatus() {
  const missing = requiredAzureEnv.filter((key) => !process.env[key]);

  return {
    configured: missing.length === 0,
    missing,
    apiVersion: process.env.AZURE_OPENAI_API_VERSION ?? "2024-10-21",
  };
}

export async function createAzureChatCompletion(messages: ChatMessage[]) {
  const status = getAzureOpenAIStatus();

  if (!status.configured) {
    throw new Error(`Missing Azure OpenAI env: ${status.missing.join(", ")}`);
  }

  const endpoint = process.env.AZURE_OPENAI_ENDPOINT!.replace(/\/$/, "");
  const deployment = encodeURIComponent(process.env.AZURE_OPENAI_DEPLOYMENT!);
  const apiVersion = encodeURIComponent(status.apiVersion);
  const url = `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;
  const accessToken = await getAzureAccessToken();

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      messages,
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Azure OpenAI request failed: ${response.status} ${detail}`);
  }

  const data = (await response.json()) as AzureChatResponse;
  return data.choices?.[0]?.message?.content ?? "";
}
