import React, { useState } from "react";
import { 
  SlidersHorizontal, 
  Copy, 
  Check, 
  Sparkles, 
  ShoppingCart, 
  ShieldAlert, 
  Clock, 
  Calculator, 
  BadgeAlert,
  Bot
} from "lucide-react";
import { PROMPT_TASK_TYPES, type PromptTaskType } from "@/src/data/promptTemplates";

interface SmartPromptGeneratorProps {
  onSendToSandbox?: (prompt: string) => void;
}

export const SmartPromptGenerator: React.FC<SmartPromptGeneratorProps> = ({ onSendToSandbox }) => {
  const [selectedTask, setSelectedTask] = useState<PromptTaskType>(PROMPT_TASK_TYPES[0]);
  const [fieldValues, setFieldValues] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    PROMPT_TASK_TYPES[0].fields.forEach((f) => {
      initial[f.key] = f.defaultValue;
    });
    return initial;
  });
  const [copied, setCopied] = useState(false);

  // Switch task type and reset fields with defaults
  const handleSelectTask = (task: PromptTaskType) => {
    setSelectedTask(task);
    const initial: Record<string, any> = {};
    task.fields.forEach((f) => {
      initial[f.key] = f.defaultValue;
    });
    setFieldValues(initial);
    setCopied(false);
  };

  const handleFieldChange = (key: string, value: any) => {
    setFieldValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Generate output prompt based on current field values
  const generatedPrompt = selectedTask.generatePrompt(fieldValues);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case "ShoppingCart":
        return <ShoppingCart className="w-4 h-4" />;
      case "ShieldAlert":
        return <ShieldAlert className="w-4 h-4" />;
      case "Clock":
        return <Clock className="w-4 h-4" />;
      case "Calculator":
        return <Calculator className="w-4 h-4" />;
      case "BadgeAlert":
        return <BadgeAlert className="w-4 h-4" />;
      default:
        return <SlidersHorizontal className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
      
      {/* Title */}
      <div className="border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2 text-slate-900">
          <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
            <SlidersHorizontal className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-base sm:text-lg font-bold font-['Rubik',sans-serif]">
              מחולל פקודות חכם (Smart Command Generator)
            </h2>
            <p className="text-xs text-slate-500">
              הפקה מהירה של פקודות מושלמות לשימוש מול נועה AI, לפי כללי הברזל של ח. סבן
            </p>
          </div>
        </div>
      </div>

      {/* Task Selector Buttons */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 block">
          1. בחר את סוג המשימה / הפעולה הנדרשת:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {PROMPT_TASK_TYPES.map((task) => {
            const isSelected = selectedTask.id === task.id;
            return (
              <button
                key={task.id}
                onClick={() => handleSelectTask(task)}
                className={`p-3 rounded-xl border text-right transition-all flex items-start gap-2.5 ${
                  isSelected
                    ? "bg-amber-50/80 border-amber-400 ring-2 ring-amber-400/20 shadow-xs"
                    : "bg-slate-50/60 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                }`}
              >
                <span className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                  isSelected ? "bg-amber-500 text-white" : "bg-slate-200 text-slate-700"
                }`}>
                  {renderIcon(task.icon)}
                </span>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">
                    {task.name}
                  </div>
                  <div className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                    {task.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Parameters Configuration Form */}
      <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800">
            2. התאם את פרטי המשימה ({selectedTask.name}):
          </span>
          <span className="text-[11px] text-slate-500">
            הערכים יוטמעו אוטומטית בפקודה
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {selectedTask.fields.map((field) => (
            <div key={field.key} className="space-y-1">
              <label className="text-xs font-medium text-slate-700 flex justify-between">
                <span>{field.label}</span>
                {field.helperText && (
                  <span className="text-[10px] text-amber-700">{field.helperText}</span>
                )}
              </label>

              {field.type === "select" ? (
                <select
                  value={fieldValues[field.key] ?? field.defaultValue}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                >
                  {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : field.type === "number" ? (
                <input
                  type="number"
                  value={fieldValues[field.key] ?? field.defaultValue}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              ) : (
                <input
                  type="text"
                  value={fieldValues[field.key] ?? field.defaultValue}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Generated Output Preview Box */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>3. פקודה מנוסחת מושלמת להעתקה (Prompt Result):</span>
          </label>
          <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-medium">
            תואם 100% ל-DNA של סבן
          </span>
        </div>

        <div className="relative">
          <textarea
            readOnly
            value={generatedPrompt}
            rows={5}
            className="w-full text-xs sm:text-sm font-['Rubik',sans-serif] bg-slate-900 text-slate-100 rounded-2xl p-4 leading-relaxed resize-none focus:outline-none border border-slate-800 shadow-inner"
          />

          <div className="absolute left-3 bottom-3 flex items-center gap-2">
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                copied
                  ? "bg-emerald-600 text-white"
                  : "bg-amber-500 hover:bg-amber-600 text-white active:scale-95"
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>הועתק ללוח!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>העתק פקודה בלחיצה</span>
                </>
              )}
            </button>

            {onSendToSandbox && (
              <button
                onClick={() => onSendToSandbox(generatedPrompt)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all active:scale-95"
              >
                <Bot className="w-3.5 h-3.5 text-amber-400" />
                <span>בדוק עכשיו בסימולטור</span>
              </button>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};
