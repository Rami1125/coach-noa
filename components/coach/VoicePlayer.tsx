/**
 * VoicePlayer Component - Voice-Adapted Audio Reader for SabanOS
 * ח. סבן חומרי בניין (1994) בע״מ
 * 
 * Uses Web Speech API (SpeechSynthesisUtterance) to read out a voice-crafted script
 * for hands-free vehicle speakerphone (סמסונג בדיבורית ברכב או באוזניה בחצר).
 * 
 * Strict Voice Rules:
 * - Reads ONLY clean voice scripts (strips all markdown, raw codes, URLs, and JSON).
 * - Target: 'he-IL' language, Male voice priority (Google עברית זכר / David / Asaf).
 * - Speech rate: 1.0 (natural), Pitch: 0.95 (calm authoritative masculine tone).
 */

import React, { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, Square, Play, Sparkles, Check, Copy } from "lucide-react";

interface VoicePlayerProps {
  /**
   * The raw message content from coach, which may contain <<<VOICE_SCRIPT>>>...<<<END_VOICE_SCRIPT>>>
   */
  rawText: string;
  /**
   * Optional manual override voice script
   */
  voiceScript?: string;
  /**
   * Label variant: "full" | "icon" | "pill"
   */
  variant?: "full" | "icon" | "pill";
  className?: string;
}

/**
 * Extracts and cleans the voice-adapted script from raw coach response
 */
export function extractVoiceScript(rawText: string): string {
  if (!rawText) return "";

  // 1. Look for explicit <<<VOICE_SCRIPT>>> block
  const match = rawText.match(/<<<VOICE_SCRIPT>>>([\s\S]*?)(?:<<<END_VOICE_SCRIPT>>>|$)/i);
  if (match && match[1]) {
    return cleanVoiceText(match[1]);
  }

  // 2. Fallback: Clean the raw text thoroughly so no markdown or code is spoken
  return fallbackCleanText(rawText);
}

/**
 * Thoroughly removes markdown artifacts, symbols, and formatting
 */
function cleanVoiceText(text: string): string {
  return text
    // Remove markdown headers, bold, italics, strikethrough
    .replace(/[#*_~`]/g, "")
    // Remove bracketed instructions or system notes like [הערה:]
    .replace(/\[(?:הערה|שים לב|הוראה|טקסט עברי)[\s\S]*?\]/gi, "")
    // Remove URLs
    .replace(/https?:\/\/[^\s]+/g, "")
    // Remove bullets and numbering prefixes at line starts
    .replace(/^\s*[-•*]\s*/gm, "")
    .replace(/^\s*\d+[\.)]\s*/gm, "")
    // Remove quotes
    .replace(/["'״׳]/g, " ")
    // Clean multiple whitespace and newlines into natural pause punctuation
    .replace(/\n+/g, ". ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/**
 * Fallback cleaner for texts that lack explicit <<<VOICE_SCRIPT>>>
 */
function fallbackCleanText(text: string): string {
  let cleaned = text
    .replace(/<<<VOICE_SCRIPT>>>[\s\S]*?(?:<<<END_VOICE_SCRIPT>>>|$)/gi, "")
    .replace(/:::mirror[\s\S]*?(?::::|$)/gi, "")
    .replace(/:::prompt[\s\S]*?(?::::|$)/gi, "")
    .replace(/:::quiz[\s\S]*?(?::::|$)/gi, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/\|[^\n]+\|/g, "") // remove tables
    .replace(/<[^>]+>/g, ""); // remove HTML

  cleaned = cleanVoiceText(cleaned);

  // Take the first 2-3 essential sentences for concise audio briefing
  const sentences = cleaned.split(/(?<=[.!?])\s+/).filter(Boolean);
  if (sentences.length > 3) {
    return sentences.slice(0, 3).join(" ");
  }
  return cleaned;
}

export const VoicePlayer: React.FC<VoicePlayerProps> = ({
  rawText,
  voiceScript: overrideScript,
  variant = "pill",
  className = "",
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [showTranscript, setShowTranscript] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const spokenText = overrideScript || extractVoiceScript(rawText);

  // Initialize SpeechSynthesis and select the best Hebrew Male Voice
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setIsSupported(false);
      return;
    }

    const selectBestHebrewVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices || voices.length === 0) return;

      // Filter for Hebrew voices
      const hebrewVoices = voices.filter(
        (v) =>
          v.lang.toLowerCase().startsWith("he") ||
          v.lang.toLowerCase().includes("il") ||
          v.name.includes("Hebrew") ||
          v.name.includes("עברית")
      );

      if (hebrewVoices.length > 0) {
        // Preference 1: Explicit Male identifier (David, Asaf, Male, זכר, Google עברית זכר)
        const maleVoice = hebrewVoices.find((v) => {
          const name = v.name.toLowerCase();
          return (
            name.includes("male") ||
            name.includes("זכר") ||
            name.includes("david") ||
            name.includes("asaf") ||
            name.includes("guy") ||
            name.includes("he-il-language")
          );
        });

        // Preference 2: Any Google or Natural Hebrew voice
        const naturalVoice = hebrewVoices.find((v) =>
          v.name.toLowerCase().includes("google") || v.name.toLowerCase().includes("natural")
        );

        setSelectedVoice(maleVoice || naturalVoice || hebrewVoices[0]);
      }
    };

    selectBestHebrewVoice();

    // Listen for voice loading event (common in Chrome/Android/Samsung Internet)
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = selectBestHebrewVoice;
    }

    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Stop playback when component unmounts
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleTogglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isSupported || !spokenText) return;

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    // Cancel any previous active speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(spokenText);
    utterance.lang = "he-IL";
    utterance.rate = 1.0; // Natural, authoritative cadence
    utterance.pitch = 0.95; // Calm, masculine, focused tone

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onstart = () => {
      setIsPlaying(true);
    };

    utterance.onend = () => {
      setIsPlaying(false);
    };

    utterance.onerror = (event) => {
      // Ignore user cancellation errors
      if (event.error !== "canceled" && event.error !== "interrupted") {
        console.warn("Speech synthesis notice:", event.error);
      }
      setIsPlaying(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handleCopyTranscript = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!spokenText) return;
    navigator.clipboard.writeText(spokenText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isSupported || !spokenText) {
    return null;
  }

  // Icon only variant
  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handleTogglePlay}
        title={isPlaying ? "עצור הקראה קולית" : "הקראה קולית מותאמת דיבורית"}
        className={`h-8 w-8 rounded-lg flex items-center justify-center transition-all ${
          isPlaying
            ? "bg-rose-600 text-white shadow-md animate-pulse scale-105"
            : "bg-slate-100 text-slate-700 hover:bg-orange-100 hover:text-orange-700"
        } ${className}`}
      >
        {isPlaying ? <Square className="h-4 w-4 fill-current" /> : <Volume2 className="h-4 w-4" />}
      </button>
    );
  }

  return (
    <div className={`inline-flex flex-col items-start gap-1.5 ${className}`} dir="rtl">
      <div className="flex items-center gap-1.5">
        {/* Main Audio Trigger Button */}
        <button
          type="button"
          onClick={handleTogglePlay}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer ${
            isPlaying
              ? "bg-rose-600 text-white shadow-rose-200 border border-rose-700 animate-pulse"
              : "bg-gradient-to-r from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 text-orange-950 border border-orange-200/80 hover:border-orange-400"
          }`}
          title={isPlaying ? "לחץ לעצירת ההקראה" : "הקראה קולית בדיבורית (קול גברי, ללא קודים)"}
        >
          {isPlaying ? (
            <>
              {/* Animated Sound Wave Equalizer Bars */}
              <div className="flex items-end gap-0.5 h-3.5 w-3.5">
                <span className="w-1 bg-white rounded-full animate-bounce [animation-delay:0ms] h-full"></span>
                <span className="w-1 bg-white rounded-full animate-bounce [animation-delay:150ms] h-2/3"></span>
                <span className="w-1 bg-white rounded-full animate-bounce [animation-delay:300ms] h-4/5"></span>
              </div>
              <Square className="h-3 w-3 fill-current ml-0.5" />
              <span>עצור הקראה</span>
            </>
          ) : (
            <>
              <Volume2 className="h-3.5 w-3.5 text-orange-600" />
              <span>השמע בדיבורית</span>
              <span className="text-[10px] font-normal text-orange-700/80 px-1 py-0.2 rounded bg-orange-100/80 border border-orange-200">
                קול גברי
              </span>
            </>
          )}
        </button>

        {/* Peek Transcript Toggle */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowTranscript((prev) => !prev);
          }}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          title="הצג/הסתר תמליל דיבורית"
        >
          <Sparkles className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Spoken Script Popover / Drawer */}
      {showTranscript && (
        <div className="mt-1 p-3 rounded-xl bg-orange-50/90 border border-orange-200/90 shadow-xs text-xs text-orange-950 space-y-1.5 max-w-md animate-fadeIn">
          <div className="flex items-center justify-between pb-1 border-b border-orange-200/60 font-semibold text-[11px] text-orange-900">
            <span>תמליל שידור בדיבורית (נקי מקוד וסימנים):</span>
            <button
              type="button"
              onClick={handleCopyTranscript}
              className="flex items-center gap-1 text-[10px] text-orange-700 hover:text-orange-900"
            >
              {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
              <span>{copied ? "הועתק" : "העתק"}</span>
            </button>
          </div>
          <p className="leading-relaxed font-medium">"{spokenText}"</p>
        </div>
      )}
    </div>
  );
};
