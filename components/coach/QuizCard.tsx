/**
 * Interactive Multiple-Choice Quiz Card (שאלון אמריקאי לחידוד החלטה)
 * ח. סבן חומרי בניין (1994) בע״מ
 * 
 * Renders 1-tap touch-friendly options for Rami to make decisions in seconds
 * without typing on mobile or desktop keyboards.
 */

import React, { useState } from "react";
import { CheckCircle2, HelpCircle, ArrowLeft, Sparkles, Send } from "lucide-react";

export interface QuizOption {
  id: string;
  label?: string; // "א", "ב", "ג"
  text: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
}

export interface QuizData {
  title?: string;
  questions: QuizQuestion[];
}

interface QuizCardProps {
  quiz: QuizData;
  onSelectAnswer: (question: string, answerText: string) => void;
  className?: string;
}

export const QuizCard: React.FC<QuizCardProps> = ({ quiz, onSelectAnswer, className = "" }) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [submittedQuestions, setSubmittedQuestions] = useState<Record<string, boolean>>({});

  const handleSelect = (questionId: string, questionText: string, option: QuizOption) => {
    if (submittedQuestions[questionId]) return;

    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: option.id,
    }));

    setSubmittedQuestions((prev) => ({
      ...prev,
      [questionId]: true,
    }));

    const formattedAnswer = `${option.label ? `[בחירה ${option.label}] ` : ""}${option.text}`;
    onSelectAnswer(questionText, formattedAnswer);
  };

  return (
    <div
      className={`rounded-2xl border-2 border-orange-500/40 bg-gradient-to-br from-orange-50/70 via-white to-amber-50/50 p-5 shadow-md my-4 space-y-5 ${className}`}
      dir="rtl"
    >
      {/* Quiz Header */}
      <div className="flex items-center justify-between pb-3 border-b border-orange-200/70">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-600 text-white shadow-xs">
            <HelpCircle className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-base text-slate-900 leading-tight">
              {quiz.title || "שאלון חידוד החלטה מהיר (בחירה בלחיצה אחת)"}
            </h4>
            <p className="text-xs text-orange-950/70 font-medium">
              בחר את החלופה המועדפת בלחיצה כדי לשגר את ההנחיה המדויקת לנועה:
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-bold text-orange-800 border border-orange-200">
          <Sparkles className="h-3 w-3 text-orange-600" />
          בלחיצה אחת
        </span>
      </div>

      {/* Questions List */}
      <div className="space-y-5">
        {quiz.questions.map((q, qIndex) => {
          const isSubmitted = !!submittedQuestions[q.id];
          const selectedOptionId = selectedAnswers[q.id];

          return (
            <div key={q.id || qIndex} className="space-y-3">
              <p className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                <span className="text-orange-600 ml-1">{qIndex + 1}.</span> {q.question}
              </p>

              {/* Options Grid */}
              <div className="grid grid-cols-1 gap-2.5">
                {q.options.map((opt, optIndex) => {
                  const isSelected = selectedOptionId === opt.id;
                  const label = opt.label || ["א", "ב", "ג", "ד"][optIndex] || String(optIndex + 1);

                  return (
                    <button
                      key={opt.id || optIndex}
                      type="button"
                      disabled={isSubmitted && !isSelected}
                      onClick={() => handleSelect(q.id, q.question, { ...opt, label })}
                      className={`w-full text-right p-3.5 sm:p-4 rounded-xl border-2 transition-all flex items-center justify-between gap-3 min-h-[50px] cursor-pointer ${
                        isSelected
                          ? "border-orange-600 bg-orange-600 text-white shadow-md font-bold scale-[1.01]"
                          : isSubmitted
                          ? "border-slate-200 bg-slate-100 text-slate-400 opacity-60 cursor-not-allowed"
                          : "border-slate-200 bg-white hover:border-orange-400 hover:bg-orange-50/50 text-slate-800 active:scale-98 shadow-xs"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-extrabold ${
                            isSelected
                              ? "bg-white text-orange-600"
                              : "bg-slate-100 text-slate-700 border border-slate-300"
                          }`}
                        >
                          {label}
                        </span>
                        <span className="text-sm sm:text-base leading-snug">{opt.text}</span>
                      </div>

                      {isSelected ? (
                        <CheckCircle2 className="h-5 w-5 text-white shrink-0" />
                      ) : (
                        <ArrowLeft className="h-4 w-4 text-slate-400 shrink-0 group-hover:-translate-x-0.5 transition-transform" />
                      )}
                    </button>
                  );
                })}
              </div>

              {isSubmitted && (
                <p className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  התשובה נבחרה ונשלחה ישירות למאמן!
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Parser helper to extract :::quiz ... ::: blocks from LLM markdown response
 */
export function extractQuizFromText(text: string): {
  cleanText: string;
  quizzes: QuizData[];
} {
  const quizRegex = /:::quiz\s*([\s\S]*?)\s*:::/g;
  const quizzes: QuizData[] = [];
  let match;

  while ((match = quizRegex.exec(text)) !== null) {
    try {
      const rawJson = match[1].trim();
      const parsed = JSON.parse(rawJson);
      if (parsed && Array.isArray(parsed.questions)) {
        quizzes.push(parsed);
      }
    } catch (_e) {
      // ignore malformed JSON block
    }
  }

  const cleanText = text.replace(quizRegex, "").trim();
  return { cleanText, quizzes };
}
