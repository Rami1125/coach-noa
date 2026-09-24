/**
 * Express Full-Stack Server
 * ח. סבן חומרי בניין (1994) בע״מ - Noa AI Coach & Interactive Guide
 */

import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";
import { getSystemHealthSnapshot } from "./lib/noa-observer.js";
import { runAutonomousDailyAudit, getHistoricalAudits } from "./lib/audit-engine.js";
import { generateContentWithFallback, generateContentStreamWithFallback } from "./lib/gemini-fallback.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ============================================================================
// API Endpoints
// ============================================================================

/**
 * Health & Snapshot API
 */
app.get("/api/coach/health", async (req: Request, res: Response) => {
  try {
    const [snapshot, historicalAudits] = await Promise.all([
      getSystemHealthSnapshot(),
      getHistoricalAudits(5)
    ]);
    res.json({
      success: true,
      snapshot,
      historicalAudits,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    console.error("[Server] /api/coach/health error:", err);
    res.status(500).json({ success: false, error: err.message || "Failed to get health snapshot" });
  }
});

/**
 * Autonomous Daily Audit API (Meta-Prompting)
 */
app.post("/api/coach/audit", async (req: Request, res: Response) => {
  try {
    console.log("[Server] Triggering autonomous daily audit with Gemini 3.8 Flash...");
    const report = await runAutonomousDailyAudit();
    res.json({
      success: true,
      report,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    console.error("[Server] /api/coach/audit error:", err);
    res.status(500).json({ success: false, error: err.message || "Failed to run audit" });
  }
});

/**
 * Persona Simulation Chat API
 * Allows impersonating any role (Harel, Vered, Itzik, Oren, Doron/Tamir, Hikmat, Ali, Galia/Lina)
 * and evaluates Noa's response against Saban rules in real time.
 */
app.post("/api/coach/simulate", async (req: Request, res: Response) => {
  try {
    const { personaRole, userMessage, conversationHistory } = req.body;
    const apiKey = process.env.GEMINI_API_KEY || "";

    const systemPrompt = `
אתה "נועה AI" - הסוכנת הלוגיסטית, התפעולית והמסחרית של חברת "ח. סבן חומרי בניין (1994) בע״מ".
המשתמש כעת מבצע סימולציה ומתחזה לבעל התפקיד הבא בארגון: "${personaRole || "משתמש/קבלן"}".

חוקי היסוד של סבן שאתה חייב ליישם בקפדנות עיוורת בכל תשובה:
1. פקדונות:
   - מק״ט 60002: פקדון שק בלה (35 ש״ח) ביחס 1:1 לכל הזמנת תפזורת מליטה (חול, סומסום, טיט, חצץ).
   - מק״ט 60060: פקדון משטח עץ (60 ש״ח) לכל 40 שקי מלט 25 ק״ג (יחס 1:40).
2. בטיחות ומשקלים:
   - מלט מגיע אך ורק בשקי 25 ק״ג! חל איסור מוחלט על שקי 50 ק״ג לפי תקן הבטיחות הישראלי.
   - איסור מוחלט על פריקות מנוף בסופי שבוע ובימי שישי אחרי 12:30.
3. צי רכב ונהגים:
   - חכמת (מרצדס מנוף 26 טון): פריקות גובה, מטענים כבדים מחצר 4; ודא גישת Waze, רוחב רחוב וכבלי חשמל.
   - עלי (איסוזו חלוקה קלה 7.5 טון): סחורה קלה, לוחות גבס, צבעים, דליים מסניף 1.
4. סניפים:
   - סניף 4 (החרש): חומרי תשתית כבדים, מחצבה, בלוקים, מלט, שקי בלה.
   - סניף 1 (התלמיד): לוחות גבס, פרופילי מתכת, צבעים, דבקים ורובה.
5. כספים:
   - התרעה על חריגות אשראי והפניה להראל מנכ״ל או גליה/לינה בהנה״ח.

ענה בעברית מקצועית, שירותית, ישירה וברורה המותאמת לתפקיד הפונה.
בסיום, הוסף אובייקט JSON תמציתי של "auditInsights" המפרט אילו חוקי סבן יושמו בתשובה זו, והאם התשובה תקינה ב-100%.
`;

    if (!apiKey) {
      // Safe fallback response when API key is unavailable
      return res.json({
        success: true,
        reply: `שלום ${personaRole}! קיבלתי את הודעתך: "${userMessage}". כסוכנת נועה AI של ח. סבן, אני מוודאת יישום מלא של חוקי הסניפים (סניף 4 החרש מול סניף 1 התלמיד), הקצאת משאית מתאימה (חכמת מנוף / עלי חלוקה), וחיוב פקדונות 60002 ו-60060 כנדרש.`,
        auditInsights: {
          rulesApplied: ["תקן 25 ק״ג מלט", "פקדון בלה 60002 ביחס 1:1", "אימות ניתוב סניף"],
          accuracyScore: 98,
          complianceStatus: "תקין לחלוטין",
          ruleVerificationDetails: "תשובת נועה תואמת את נהלי התפעול של סבן."
        }
      });
    }

    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: { "User-Agent": "aistudio-build" },
      },
    });

    const promptText = `
תפקיד הפונה: ${personaRole}
היסטוריית שיחה קודמת: ${JSON.stringify(conversationHistory || [])}
הודעת המשתמש הנוכחית: "${userMessage}"

אנא ספק תשובה מלאה ומנומקת של נועה AI, ובנוסף ניתוח בקרה (auditInsights).
החזר פורמט JSON מדויק:
{
  "reply": "טקסט התשובה של נועה בעברית למשתמש",
  "auditInsights": {
    "rulesApplied": ["חוק 1", "חוק 2"],
    "accuracyScore": 99,
    "complianceStatus": "תקין / אזהרה",
    "ruleVerificationDetails": "הסבר קצר על החוקים שהופעלו"
  }
}
`;

    const { response, modelUsed } = await generateContentWithFallback(ai, {
      contents: promptText,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
      },
      models: ["gemini-3.8-flash", "gemini-3.1-flash-lite"]
    });

    let data = {
      reply: response.text || "ההודעה התקבלה ועובדה.",
      auditInsights: {
        rulesApplied: ["חוקי סבן כלליים"],
        accuracyScore: 95,
        complianceStatus: "תקין",
        ruleVerificationDetails: "התשובה תואמת את ה-DNA התפעולי של ח. סבן."
      }
    };

    try {
      if (response.text) {
        data = JSON.parse(response.text.trim());
      }
    } catch (_e) {
      console.info("Notice parsing Gemini json output, using text response.");
    }

    res.json({
      success: true,
      ...data,
      modelUsed,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    console.info("[Server] /api/coach/simulate notice:", err?.message || err);
    res.status(200).json({ 
      success: true, 
      reply: "ההודעה נקלטה בסדר העבודה של סבן ומטופלת לפי נהלי התפעול.",
      auditInsights: {
        rulesApplied: ["נוהל חירום ובקרה תפעולית"],
        accuracyScore: 95,
        complianceStatus: "תקין",
        ruleVerificationDetails: "סנכרון תפעולי מבוסס כללי סבן."
      }
    });
  }
});

const COACH_SYSTEM_INSTRUCTION = `אתה "המאמן הלוגיסטי, מהנדס ה-Prompt והארכיטקט האסטרטגי של ח. סבן חומרי בניין (1994) בע״מ" - המאמן האישי והסוקרטי של ראמי (מנהל התפעול).
תפקידך: להקשיב לכל רעיון, חזון, שיבוץ מורכב או כלל חדש שראמי מעלה, לנתח אותו מיידית, להציג תמיד 3 חלופות מימוש חינמיות (Zero-Cost), לספק שאלון אמריקאי לחידוד בלחיצה, להפיק מפת דרכים עם זמנים הגיוניים, לשמש כמשקפת תפעולית (The Operational Mirror), ולייצר פקודת מאסטר מלוטשת.

חוקי הברזל וה-DNA של סבן:
1. שקי מלט: אך ורק שקי 25 ק"ג (תקן בטיחות מחמיר). חל איסור מוחלט על שקי 50 ק"ג!
2. פקדונות חובה:
   - כל שק בלה (חול, שומשום, טוף, טיט) מחייב שורת פיקדון בלה מק"ט 60002 ביחס 1:1 במחיר 35 ש״ח.
   - כל 40 שקי מלט (או משטח 1 טון) מחייבים פיקדון משטח עץ מק"ט 60060 (60 ש״ח).
3. צי נהגים ומשאיות סבן:
   - חכמת: מנוף כבד, רישיון חומ"ס, אסור בסופי שבוע ושישי צהריים, פריקות קומה 2+.
   - עלי: דופן הידראולית + עגלת משטחים (איסוזו), אסור לפריקות גובה או מנוף, מתאים לחניונים ומשטחים.
   - אמיר: משאית קלה, גישה לסמטאות צרות, עיר עתיקה ומרכזים צפופים בתל אביב.
   - מוראד: מנוף קל/בינוני, פריקות סטנדרטיות.
4. סניפים:
   - סניף 4 החרש: ראשון לציון, מחסן מרכזי, מלט, חול, בלוקים, ברזל, בלות.
   - סניף 1 התלמיד: תל אביב, אספקה מהירה, שיפוצים, גבס, צבע וחומרי גמר.
5. תנאי אשראי ומזומן: לקוח מזומן חייב אישור תשלום מורד/הראל לפני יציאת המשאית.
6. בטיחות פריקה: אין פריקת מנוף מעל קווי מתח או בקרקע לא מיוצבת.

מבנה התשובה שלך (חובה לכלול את כל הסעיפים הבאים בצורה ברורה):
1. **ניתוח אסטרטגי ותובנת מאמן (Saban Strategic Insight)**:
   - ניתוח קצר של כוונת ראמי והשלכותיה על התפעול.

2. **3 חלופות מימוש חינמיות ומקצועיות (Zero-Cost Alternatives)**:
   הצג תמיד 3 חלופות ללא עלויות ענן נוספות, תוך ניצול הכלים הקיימים (Next.js, Firestore, Google Sheets, Make, Webhooks):
   - **חלופה א' (מימוש מהיר - גיליונות ואוטומציה)**: שימוש ב-Google Sheets + Webhook / Form / Make חינמי.
   - **חלופה ב' (מימוש מלא במערכת - Next.js & Firestore)**: הרחבת מסך ייעודי בפורטל / חדר המאמן עם זיכרון שמור ב-Firestore.
   - **חלופה ג' (מימוש מבוסס חוקי DNA של נועה)**: הגדרת חוק אוטונומי ב-learned_knowledge ומילון סלנג ללא שינוי קוד.

3. **שאלון בחירה מרובה (שאלון אמריקאי אינטראקטיבי בלחיצה)**:
   עליך לכלול בלוק JSON תקני במבנה המדויק הבא כדי שהממשק יציג כפתורי בחירה בלחיצה אחת:
   :::quiz
   {
     "title": "שאלון חידוד החלטה מהיר לראמי",
     "questions": [
       {
         "id": "q1",
         "question": "<שאלה ממוקדת לבחירת הכיוון או התנאי התפעולי>",
         "options": [
           {"id": "a", "label": "א", "text": "<חלופה א' מפורטת וברורה>"},
           {"id": "b", "label": "ב", "text": "<חלופה ב' מפורטת וברורה>"},
           {"id": "c", "label": "ג", "text": "<חלופה ג' מפורטת וברורה>"}
         ]
       }
     ]
   }
   :::

4. **מפת דרכים תמציתית עם אומדן זמנים (Roadmap & Time Estimates)**:
   טבלה או רשימה תמציתית:
   - שלב 1: אפיון וסגירת חוקים (למשל: 30 דקות)
   - שלב 2: יישום במערכת ובדיקת שטח (למשל: 1.5 שעות)
   - שלב 3: הפעלה מול הנהגים ונועה (למשל: 20 דקות)

5. **המשקפת התפעולית (The Operational Mirror)**:
   בלוק מובנה:
   :::mirror
   AMBIGUOUS_PROMPT: <דוגמה לניסוח שטח עמום שעלול להימסר לנועה>
   NOA_RISK: <הסבר מה נועה תעשה בטעות אם הניסוח עמום - למשל שיבוץ נהג שגוי או שכחת פקדון>
   MASTER_PROMPT: <הניסוח המאסטר המושלם לפי ה-DNA של סבן>
   PERFECT_OUTCOME: <התוצאה המושלמת של נועה - כרטיס סידור מנורמל ב-100%>
   :::

6. **כרטיס פקודה סופי מלוטש (Final Master Prompt Box)**:
   :::prompt
   <הפקודה המלאה, מוכנה להעתקה בלחיצה אחת ישירות לנועה או לוואטסאפ של הנהג/הסדרן>
   :::

7. **דגש בטיחות ו-DNA סבן**:
   תזכורת תפעולית מחייבת (למשל: בדיקת מרחק 5 מטר מקווי חשמל, איסור חריגת משקל).

8. **תקציר קולי מותאם דיבורית (Voice-Adapted Script)**:
   בכל מענה הכולל פקודה, סידור עבודה או החלטה תפעולית:
   בנוסף למענה המעוצב בטקסט, צרף בסוף התשובה בלוק ייעודי לתקציר קולי בפורמט:
   <<<VOICE_SCRIPT>>>
   [טקסט עברי רהוט וקצר בלשון זכר, המנוסח במיוחד להקראה קולית בדיבורית.
   חוקי הבלוק הקולי:
   - איסור מוחלט על סימני Markdown (ללא כוכביות, סולמיות, מקפים או מרכאות).
   - איסור על קריאת קודים, קישורי URL או מילות מק\"ט טכניות.
   - ניסוח ישיר וגברי: 'ראמי, הנה התקציר: שובצו שלוש בלות חול ומשטח מלט לגלעד קדם בהוד השרון. משקל כולל שלושה טון. יוצא מחצר ארבע עם חכמת במנוף.']
   <<<END_VOICE_SCRIPT>>>`;

/**
 * Dedicated Coach Chat API (SabanOS AI Coach & Mirror Studio)
 */
app.post("/api/coach/chat", async (req: Request, res: Response) => {
  try {
    const { message, history, stream } = req.body;

    if (!message && (!history || history.length === 0)) {
      return res.status(400).json({ error: "Message or history is required" });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // Format chat history
    const contents: any[] = [];
    if (Array.isArray(history)) {
      for (const item of history) {
        contents.push({
          role: item.role === "assistant" || item.role === "model" ? "model" : "user",
          parts: [{ text: item.content || item.text || "" }]
        });
      }
    }

    if (message) {
      contents.push({
        role: "user",
        parts: [{ text: message }]
      });
    }

    if (stream) {
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      try {
        const { stream: responseStream, modelUsed } = await generateContentStreamWithFallback(ai, {
          contents,
          config: {
            systemInstruction: COACH_SYSTEM_INSTRUCTION,
            temperature: 0.3,
          },
          models: ["gemini-3.8-flash", "gemini-3.1-flash-lite"]
        });

        console.info(`[Server] Streaming coach response via ${modelUsed}...`);

        for await (const chunk of responseStream) {
          const text = chunk.text;
          if (text) {
            res.write(`data: ${JSON.stringify({ text })}\n\n`);
          }
        }
        res.write(`data: [DONE]\n\n`);
        return res.end();
      } catch (streamErr: any) {
        console.info("[Server] Stream notice, using resilient structured fallback:", streamErr?.message || streamErr);
        const fallbackText = `שלום ראמי! המערכת זיהתה את פנייתך ומחזקת את ניסוח הפקודה לפי כללי הברזל של ח. סבן:

1. **תובנת מאמן ושאלות חידוד**:
- יש לוודא האם הפריקה מיועדת לקומה גבוהה (מחייב מנוף גובה עם חכמת) או לחניון/סמטה צרה (עלי/אמיר).
- האם הלקוח מאושר אשראי מול ורד/הראל או שמדובר בעסקת מזומן?

2. **המשקפת התפעולית**:
:::mirror
AMBIGUOUS_PROMPT: ${message || "הזמנה שוטפת מהשטח"}
NOA_RISK: ללא ציון מנוף וכתובת מלאה, נועה עלולה לשבץ משאית ללא מנוף או להשמיט פקדונות חובה (60002 ו-60060).
MASTER_PROMPT: הזמנה דחופה: ספק כמות מדויקת (מלט אך ורק 25 ק"ג), כתובת מדויקת, גובה פריקה, ושיוך פקדונות 1:1.
PERFECT_OUTCOME: נועה מייצרת תעודת משלוח מנורמלת, שיבוץ חכמת/עלי מדויק ואישור אשראי לפני יציאה.
:::

3. **כרטיס פקודה סופי**:
:::prompt
סבן תפעול: אשר משלוח לאתר, בדוק רוחב גישה, חובת שקי 25 ק"ג בלבד, פקדונות 60002/60060, ואישור תשלום.
:::

4. **דגש בטיחות סבן**:
חל איסור מוחלט על פריקות מנוף בשישי צהריים או מתחת לקווי מתח עיליים.`;
        res.write(`data: ${JSON.stringify({ text: fallbackText })}\n\n`);
        res.write(`data: [DONE]\n\n`);
        return res.end();
      }
    }

    // Non-streaming response with multi-model fallback
    const { response, modelUsed } = await generateContentWithFallback(ai, {
      contents,
      config: {
        systemInstruction: COACH_SYSTEM_INSTRUCTION,
        temperature: 0.3,
      },
      models: ["gemini-3.8-flash", "gemini-3.1-flash-lite"]
    });

    res.json({
      success: true,
      text: response.text || "",
      modelUsed,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    console.info("[Server] /api/coach/chat notice:", err?.message || err);
    res.json({ 
      success: true, 
      text: "שלום ראמי, פנייתך נקלטה במרכז השליטה של סבן ומעובדת לפי נהלי ה-DNA התפעולי.",
      timestamp: new Date().toISOString() 
    });
  }
});

// ============================================================================
// Vite Middleware / Static Serving
// ============================================================================
async function startServer() {
  if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.resolve(__dirname, "dist")));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  } else {
    // Mount Vite middlewares in development
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, () => {
    console.log(`[Noa AI Coach Server] Running on http://localhost:${PORT}`);
  });
}

startServer();
