/**
 * Smart Prompt Generator Templates & Configurations
 * ח. סבן חומרי בניין (1994) בע״מ
 * 
 * Powered for Rami Manager & Company Executives
 */

export interface PromptTaskType {
  id: string;
  name: string;
  description: string;
  icon: string;
  fields: {
    key: string;
    label: string;
    type: "text" | "number" | "select";
    defaultValue: string | number;
    options?: { label: string; value: string }[];
    helperText?: string;
  }[];
  generatePrompt: (values: Record<string, any>) => string;
}

export const PROMPT_TASK_TYPES: PromptTaskType[] = [
  {
    id: "new-order",
    name: "הזמנה חדשה (עם בלות ומשטחים)",
    description: "יצירת הזמנה לוגיסטית מורכבת עם חישוב אוטומטי של בלות 60002 ומשטחי 60060 לפי 40 שקי מלט",
    icon: "ShoppingCart",
    fields: [
      {
        key: "clientName",
        label: "שם הקבלן / לקוח",
        type: "text",
        defaultValue: "יובל בניה ושיפוצים",
      },
      {
        key: "cementBags",
        label: "כמות שקי מלט 25 ק״ג",
        type: "number",
        defaultValue: 80,
        helperText: "כל 40 שקים מייצרים משטח עץ 60060 (60 ש״ח פקדון)"
      },
      {
        key: "sandBags",
        label: "כמות בלות סומסום / חול",
        type: "number",
        defaultValue: 4,
        helperText: "כל בלה מחויבת בפקדון שק 60002 (35 ש״ח פקדון)"
      },
      {
        key: "deliveryType",
        label: "אופן אספקה ומנוף",
        type: "select",
        defaultValue: "crane_high",
        options: [
          { label: "פריקת מנוף גובה (מרצדס - חכמת) לקומה 3+", value: "crane_high" },
          { label: "פריקת מנוף קרקע (מרצדס - חכמת)", value: "crane_ground" },
          { label: "חלוקה קלה עירונית (איסוזו - עלי)", value: "light_isuzu" },
          { label: "איסוף עצמי מחצר 4 (החרש)", value: "self_pickup_harash" },
        ]
      },
      {
        key: "destination",
        label: "כתובת אתר הבנייה",
        type: "text",
        defaultValue: "רחוב דיזנגוף 142, תל אביב",
      }
    ],
    generatePrompt: (v) => {
      const cement = Number(v.cementBags) || 0;
      const pallets = Math.ceil(cement / 40);
      const bels = Number(v.sandBags) || 0;
      return `נועה, תפתחי הזמנה חדשה לקבלן '${v.clientName}' עבור:
- ${cement} שקי מלט 25 ק״ג תקניים (חיוב ${pallets} משטחי עץ מק״ט 60060 ביחס 1:40)
- ${bels} בלות סומסום נקי (חיוב ${bels} שקי בלה מק״ט 60002 ביחס 1:1)
יעד: ${v.destination}
שיטת אספקה: ${v.deliveryType === "crane_high" ? "פריקת מנוף גובה עם חכמת (מרצדס מנוף), ודאי גישה וגובה קומה" : v.deliveryType === "light_isuzu" ? "חלוקה קלה עם עלי (איסוזו)" : "איסוף עצמי מחצר 4"}
אנא תוודאי יתרת אשראי מאושרת בהנה״ח, שלפי מק״טים מ-Comax והפיקי תעודת משלוח מוקדמת.`;
    }
  },
  {
    id: "site-inspection",
    name: "בדיקת אתר וגישת מנוף (חכמת מרצדס)",
    description: "וידוא התאמת אתר עבודה, רוחב רחוב, כבלי חשמל וסכנות בטיחות טרם שיגור משאית כבדה",
    icon: "ShieldAlert",
    fields: [
      {
        key: "siteAddress",
        label: "כתובת האתר לבדיקה",
        type: "text",
        defaultValue: "רחוב פינסקר 28, תל אביב",
      },
      {
        key: "floorLevel",
        label: "גובה / קומת פריקה מבוקשת",
        type: "select",
        defaultValue: "floor_3",
        options: [
          { label: "קרקע / שביל כניסה (0)", value: "ground" },
          { label: "קומה ראשונה / מרפסת (1)", value: "floor_1" },
          { label: "קומה שנייה או שלישית (2-3)", value: "floor_3" },
          { label: "גג / קומה רביעית ומעלה (4+)", value: "floor_roof" },
        ]
      },
      {
        key: "truckType",
        label: "משאית מיועדת",
        type: "select",
        defaultValue: "mercedes_crane",
        options: [
          { label: "מרצדס 26 טון + מנוף (חכמת)", value: "mercedes_crane" },
          { label: "איסוזו 7.5 טון חלוקה (עלי)", value: "isuzu_light" },
        ]
      }
    ],
    generatePrompt: (v) => {
      return `נועה, תבצעי בדיקת נגישות ואתר עבור פריקה בכתובת: ${v.siteAddress}.
משאית מיועדת: ${v.truckType === "mercedes_crane" ? "מרצדס 26 טון עם מנוף גובה (חכמת)" : "איסוזו חלוקה קלה (עלי)"}.
גובה פריקה: ${v.floorLevel}.
אנא אשרי:
1. האם רוחב הרחוב לפי Waze מתאים לכניסת משאית כבדה ללא חסימת תנועה?
2. האם קיימת התרעת כבלי חשמל נמוכים או עמודי תאורה בקרבת החלון/מרפסת?
3. האם נדרש אישור שוטר / אתת או סגירת רחוב מקדימה?
חוק סבן: אין פריקת מנוף ללא וידוא בטיחות מלא מראש.`;
    }
  },
  {
    id: "delivery-hours",
    name: "שעות אספקה ואיסור פריקות סופ״ש",
    description: "בדיקת חלונות אספקה מותרים, שמירה על איסור פריקות מנוף בשישי צהריים ובשבת",
    icon: "Clock",
    fields: [
      {
        key: "requestedDate",
        label: "מועד מבוקש על ידי הקבלן",
        type: "text",
        defaultValue: "יום שישי הקרוב בשעה 13:00",
      },
      {
        key: "materialCategory",
        label: "סוג הסחורה",
        type: "select",
        defaultValue: "crane_materials",
        options: [
          { label: "בלות וחומרי מנוף כבדים (חצר 4)", value: "crane_materials" },
          { label: "לוחות גבס ופרופילים (סניף 1)", value: "gypsum_finish" },
          { label: "איסוף עצמי של שקי מלט בלבד", value: "self_pickup" },
        ]
      }
    ],
    generatePrompt: (v) => {
      return `נועה, קבלן מבקש אספקה במועד: "${v.requestedDate}" עבור ${v.materialCategory === "crane_materials" ? "בלות ומשטחי מנוף כבדים" : "מוצרי גבס וגימור"}.
אנא בדקי את חוקי ח. סבן:
- זכרי: חל איסור מוחלט על פריקות מנוף בסופי שבוע ובימי שישי אחרי שעה 12:30.
- אם המועד נופל בסופ״ש, סרבי בנימוס מקצועי והציעי שיבוץ כעדיפות עליונה ליום ראשון בשעה 07:00 בבוקר עם חכמת או עלי.
מה הניסוח המדויק להודעת וואטסאפ ללקוח?`;
    }
  },
  {
    id: "coverage-calculator",
    name: "כושר כיסוי מ״ר ופחת (מחשבון שטח)",
    description: "חישוב מדויק של בלוקים, מלט, טיח או לוחות גבס לקיר/רצפה עם מקדמי פחת סבן",
    icon: "Calculator",
    fields: [
      {
        key: "calcCategory",
        label: "סוג העבודה",
        type: "select",
        defaultValue: "blocks_wall",
        options: [
          { label: "בניית קיר בלוקים (איטונג / בטון 20)", value: "blocks_wall" },
          { label: "מילוי סומסום ומלט לריצוף", value: "flooring_sand" },
          { label: "טיח חוץ / פנים (שחור + שליכט)", value: "plaster_wall" },
          { label: "מחיצת גבס דו-צדדית עם בידוד", value: "gypsum_partition" },
        ]
      },
      {
        key: "areaSquareMeters",
        label: "שטח כולל במ״ר",
        type: "number",
        defaultValue: 150,
      },
      {
        key: "wasteFactor",
        label: "מקדם פחת מומלץ (%)",
        type: "number",
        defaultValue: 7,
      }
    ],
    generatePrompt: (v) => {
      return `נועה, תבצעי חישוב כושר כיסוי ופחת עבור שטח של ${v.areaSquareMeters} מ״ר עבור עבודת ${v.calcCategory}:
1. כמויות נדרשות מדויקות כולל ${v.wasteFactor}% פחת מקובל בענף.
2. פירוק לאריזות סטנדרטיות (משטחי בלוקים, שקי מלט 25 ק״ג, בלות סומסום, לוחות גבס 2.60).
3. פקדונות נלווים: כמות משטחי 60060 (1:40 לשקי מלט) וכמות בלות 60002.
4. מה המלצת השיגור: סניף 4 החרש מול סניף 1 התלמיד?`;
    }
  },
  {
    id: "credit-exception",
    name: "אישור חריגת אשראי והנחת מנכ״ל",
    description: "בדיקת לקוח ב-Comax, הצגת מוסר תשלומים והפקת בקשת אישור ממוקדת להראל אידלסון",
    icon: "BadgeAlert",
    fields: [
      {
        key: "contractorName",
        label: "שם הקבלן / חברה",
        type: "text",
        defaultValue: "שפירא מבנים בע״מ",
      },
      {
        key: "requestedAmount",
        label: "סכום ההזמנה המבוקש (ש״ח)",
        type: "number",
        defaultValue: 38500,
      },
      {
        key: "overLimitSum",
        label: "סכום החריגה מהמסגרת (ש״ח)",
        type: "number",
        defaultValue: 14200,
      }
    ],
    generatePrompt: (v) => {
      return `נועה, קבלן '${v.contractorName}' מבקש להוציא הזמנה בסך ${v.requestedAmount} ש״ח הכוללת חריגה של ${v.overLimitSum} ש״ח ממסגרת האשראי המאושרת ב-Comax.
אנא הפיקי כרטיס תמצית מנהלים עבור הראל אידלסון (מנכ״ל) וגליה/לינה (הנה״ח):
- ותק הלקוח וסך רכישות ב-12 חודשים אחרונים.
- מוסר תשלומים (האם חזרו צ'קים או היו עיכובים?).
- פקדונות פתוחים שלא הוחזרו (מק״ט 60002 / 60060).
- המלצה: האם לאשר תחת התחייבות לכיסוי תוך 14 יום?`;
    }
  }
];
