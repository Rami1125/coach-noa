/**
 * Coach Response Parser
 * Extracts Insight, Operational Mirror, and Final Master Prompt blocks
 */

export interface ParsedCoachResponse {
  introText: string;
  mirror: {
    ambiguousPrompt: string;
    noaRisk: string;
    masterPrompt: string;
    perfectOutcome: string;
  } | null;
  prompt: string | null;
  voiceScript: string | null;
  outroText: string;
}

export function parseCoachResponse(text: string): ParsedCoachResponse {
  if (!text) {
    return { introText: "", mirror: null, prompt: null, voiceScript: null, outroText: "" };
  }

  let introText = text;
  let outroText = "";
  let mirror = null;
  let prompt = null;
  let voiceScript = null;

  // Extract <<<VOICE_SCRIPT>>> ... <<<END_VOICE_SCRIPT>>>
  const voiceMatch = text.match(/<<<VOICE_SCRIPT>>>([\s\S]*?)(?:<<<END_VOICE_SCRIPT>>>|$)/i);
  if (voiceMatch) {
    voiceScript = voiceMatch[1].trim();
  }

  // Extract :::mirror ... :::
  const mirrorMatch = text.match(/:::mirror([\s\S]*?)(:::|$)/);
  if (mirrorMatch) {
    const block = mirrorMatch[1];
    const ambMatch = block.match(/AMBIGUOUS_PROMPT:\s*([^\n\r]+(?:\n(?!NOA_RISK:|MASTER_PROMPT:|PERFECT_OUTCOME:)[^\n\r]+)*)/i);
    const riskMatch = block.match(/NOA_RISK:\s*([^\n\r]+(?:\n(?!MASTER_PROMPT:|PERFECT_OUTCOME:|AMBIGUOUS_PROMPT:)[^\n\r]+)*)/i);
    const masterMatch = block.match(/MASTER_PROMPT:\s*([^\n\r]+(?:\n(?!PERFECT_OUTCOME:|AMBIGUOUS_PROMPT:|NOA_RISK:)[^\n\r]+)*)/i);
    const outcomeMatch = block.match(/PERFECT_OUTCOME:\s*([^\n\r]+(?:\n(?!AMBIGUOUS_PROMPT:|NOA_RISK:|MASTER_PROMPT:)[^\n\r]+)*)/i);

    if (ambMatch || masterMatch) {
      mirror = {
        ambiguousPrompt: ambMatch ? ambMatch[1].trim() : "הזמנה דחופה מלט וחול לאתר בראשון",
        noaRisk: riskMatch ? riskMatch[1].trim() : "נועה עלולה לשבץ ללא פקדון משטחים (60060) או לשבץ משאית ללא דופן הידראולית",
        masterPrompt: masterMatch ? masterMatch[1].trim() : "",
        perfectOutcome: outcomeMatch ? outcomeMatch[1].trim() : "כרטיס סידור מנורמל ב-100% דיוק",
      };
    }
  }

  // Extract :::prompt ... :::
  const promptMatch = text.match(/:::prompt([\s\S]*?)(:::|$)/);
  if (promptMatch) {
    prompt = promptMatch[1].trim();
  }

  // Clean intro and outro by removing the special tags
  // Replace machine blocks with clean space
  let cleanText = text
    .replace(/<<<VOICE_SCRIPT>>>[\s\S]*?(?:<<<END_VOICE_SCRIPT>>>|$)/gi, "")
    .replace(/:::mirror[\s\S]*?(?::::|$)/g, "")
    .replace(/:::prompt[\s\S]*?(?::::|$)/g, "")
    .replace(/:::quiz[\s\S]*?(?::::|$)/g, "")
    .trim();

  // Split into intro (before the removed blocks) and outro if needed
  introText = cleanText;

  return {
    introText,
    mirror,
    prompt,
    voiceScript,
    outroText,
  };
}
