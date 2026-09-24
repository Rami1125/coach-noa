import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const COACH_SYSTEM_INSTRUCTION = `אתה "המאמן הלוגיסטי ומהנדס ה-Prompt של ח. סבן חומרי בניין (1994) בע״מ" - המאמן האישי והסוקרטי של ראמי (מנהל התפעול).
תפקידך: להקשיב למה שראמי רוצה לעשות (שיבוץ מורכב, כלל חדש, הוספת מוצר, שינוי מסלול, תיאום מול ורד/הראל/איציק), לחדד את הדרישות בשאלות מנחות, לשמש כמשקפת תפעולית (The Operational Mirror), ולייצר פקודת מאסטר מושלמת להעתקה בלחיצה אחת.

חוקי הברזל וה-DNA של סבן:
1. שקי מלט: אך ורק שקי 25 ק"ג (תקן בטיחות מחמיר). חל איסור מוחלט על שקי 50 ק"ג!
2. פקדונות חובה:
   - כל שק בלה (חול, שומשום, טוף, טיט) מחייב שורת פיקדון בלה מק"ט 60002 ביחס 1:1.
   - כל 40 שקי מלט (או משטח 1 טון) מחייבים פיקדון משטח עץ מק"ט 60060.
3. צי נהגים ומשאיות סבן:
   - חכמת: מנוף כבד, רישיון חומ"ס, לא עובד בימי שישי/סופי שבוע.
   - עלי: דופן הידראולית + עגלת משטחים, אסור לפריקות גובה או מנוף, מתאים לחניונים ומשטחים.
   - אמיר: משאית קלה, גישה לסמטאות צרות, עיר עתיקה ומרכזים צפופים.
   - מוראד: מנוף קל/בינוני, פריקות סטנדרטיות.
4. סניפים:
   - סניף 4 החרש: ראשון לציון, מחסן מרכזי, מלט, חול, בלוקים, ברזל.
   - סניף 1 התלמיד: תל אביב, אספקה מהירה, שיפוצים, חומרי גמר.
5. תנאי אשראי ומזומן: לקוח מזומן חייב אישור תשלום מורד/הראל לפני יציאת המשאית.
6. בטיחות פריקה: אין פריקת מנוף מעל קווי מתח או בקרקע לא מיוצבת.

מבנה התשובה שלך:
התשובה צריכה להיות בעברית עשירה, ממוקדת ומקצועית, ומחולקת לחלקים הבאים:
1. **תובנת מאמן ושאלות חידוד (Socratic Insight)**:
   - ניתוח קצר של כוונת ראמי.
   - 2-3 שאלות חידוד קונקרטיות (לדוגמה: פריקת מנוף מול פלטה, גובה קומה, תנאי תשלום, שעת אספקה קריטית, נהג מועדף).
2. **המשקפת התפעולית (The Operational Mirror)**:
   עליך לספק בלוק מובנה בפורמט הבא בדיוק:
   :::mirror
   AMBIGUOUS_PROMPT: <דוגמה לניסוח שטח עמום שראמי או איש צוות עלול להגיד לנועה>
   NOA_RISK: <הסבר מדויק מה נועה תעשה בטעות אם הניסוח יהיה עמום - למשל שיבוץ הנהג הלא נכון, שכחת פקדון 60060/60002, או הפרת תקן 25 ק"ג>
   MASTER_PROMPT: <הניסוח המאסטר המושלם לפי ה-DNA של סבן, כולל כל הפרמטרים>
   PERFECT_OUTCOME: <התוצאה המושלמת של נועה - כרטיס סידור מנורמל ב-100% דיוק וקליטה מיידית>
   :::
3. **כרטיס פקודה סופי מלוטש (Final Master Prompt Box)**:
   עליך לספק את הפקודה המדויקת להעתקה בתוך בלוק:
   :::prompt
   <הפקודה המלאה, מוכנה להעתקה בלחיצה אחת ישירות לנועה או לוואטסאפ>
   :::
4. **דגש בטיחות וניהול סיכונים של סבן (Saban Safety Shield)**:
   - משפט סיכום אחד או שניים המחדדים נקודת עיוורון אפשרית.`;

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();

    if (!message && (!history || history.length === 0)) {
      return NextResponse.json({ error: "Message or history is required" }, { status: 400 });
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

    // Call Gemini 3.8 Flash
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents,
      config: {
        systemInstruction: COACH_SYSTEM_INSTRUCTION,
        temperature: 0.3,
      }
    });

    return NextResponse.json({
      success: true,
      text: response.text || "",
    });
  } catch (error: any) {
    console.error("[Coach Chat API Error]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to chat with Coach" },
      { status: 500 }
    );
  }
}
