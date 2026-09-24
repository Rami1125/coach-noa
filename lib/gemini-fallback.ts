import { GoogleGenAI } from "@google/genai";

const DEFAULT_MODELS = ["gemini-3.8-flash", "gemini-3.1-flash-lite"];

export interface GenerateWithFallbackParams {
  contents: any;
  config?: any;
  models?: string[];
}

/**
 * Resilient content generator that tries the primary model (gemini-3.8-flash)
 * and automatically falls back to secondary models (gemini-3.1-flash-lite)
 * if 503 Service Unavailable, 429 rate limit, or high demand spikes occur.
 */
export async function generateContentWithFallback(
  ai: GoogleGenAI,
  params: GenerateWithFallbackParams
) {
  const models = params.models && params.models.length > 0 ? params.models : DEFAULT_MODELS;
  let lastError: any = null;

  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: params.config,
      });
      return { response, modelUsed: model };
    } catch (err: any) {
      lastError = err;
      const errMsg = err?.message || String(err);
      const isTransient =
        errMsg.includes("503") ||
        errMsg.includes("UNAVAILABLE") ||
        errMsg.includes("high demand") ||
        errMsg.includes("429") ||
        errMsg.includes("Resource exhausted");

      console.info(
        `[GeminiFallback] Model ${model} encountered notice (${isTransient ? "transient capacity spike" : "error"}), switching to next fallback if available...`
      );

      if (!isTransient && models.indexOf(model) === models.length - 1) {
        throw err;
      }
    }
  }

  throw lastError || new Error("All model fallbacks exhausted");
}

/**
 * Resilient streaming content generator that tries the primary model
 * and seamlessly falls back if initial stream connection encounters high demand.
 */
export async function generateContentStreamWithFallback(
  ai: GoogleGenAI,
  params: GenerateWithFallbackParams
) {
  const models = params.models && params.models.length > 0 ? params.models : DEFAULT_MODELS;
  let lastError: any = null;

  for (const model of models) {
    try {
      const stream = await ai.models.generateContentStream({
        model,
        contents: params.contents,
        config: params.config,
      });
      return { stream, modelUsed: model };
    } catch (err: any) {
      lastError = err;
      const errMsg = err?.message || String(err);
      console.info(
        `[GeminiFallback] Stream initialization for ${model} encountered notice, trying next model in chain...`
      );
    }
  }

  throw lastError || new Error("All streaming model fallbacks exhausted");
}
