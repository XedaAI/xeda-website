import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle, Send, X, Loader2, Mic, MicOff, Volume2, VolumeX, Trash2, History, Plus, ChevronLeft, Globe, User, Copy, Check } from "lucide-react";
import { format } from "date-fns";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

// ElevenLabs voice options. Named for how they sound, never with a person's
// name: a voice called "Sarah" invites the visitor to believe they are talking
// to Sarah, which the AI Act's disclosure duty (Art. 50) is there to prevent.
interface Voice {
  id: string;
  name: string;
  description: string;
}

const voices: Voice[] = [
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Natural", description: "Female · warm" },
  { id: "JBFqnCBsd6RMkjVDRZzb", name: "British", description: "Male" },
  { id: "pFZP5JQG7iQjIQuC4Bku", name: "Soft British", description: "Female" },
  { id: "TX3LPaxmHKxFdv7VOQHJ", name: "American", description: "Male" },
  { id: "XrExE9yKIg1WjnnlVkGX", name: "Warm", description: "Female" },
  { id: "onwK4e9ZLuTAKqWW03F9", name: "Deep", description: "Male" },
  { id: "cgSgspJ2msm6clMCkdW9", name: "Bright American", description: "Female" },
  { id: "iP95p4xoKVk53GoZ742B", name: "Casual", description: "Male" },
];

type Language = "en" | "de";

const languageLabels: Record<Language, { name: string; flag: string }> = {
  en: { name: "English", flag: "🇬🇧" },
  de: { name: "Deutsch", flag: "🇩🇪" },
};

const uiText: Record<Language, {
  title: string;
  placeholder: string;
  listening: string;
  transcribing: string;
  welcome: string;
  notice: string;
  privacy: string;
  history: string;
  noHistory: string;
  clearConversation: string;
  newConversation: string;
  viewHistory: string;
  autoSpeak: string;
  disableAutoSpeak: string;
  selectVoice: string;
  voiceUnsupported: string;
  micDenied: string;
  micDeniedHint: string;
  transcribeFailed: string;
  noSpeech: string;
  deleteFailed: string;
  error: string;
  linkInChat: string;
}> = {
  en: {
    title: "xeda.ai Assistant",
    placeholder: "Type a message...",
    listening: "Listening… sends when you pause",
    transcribing: "Transcribing…",
    // BS-71 / BS-74: the AI disclosure (AI Act Art. 50) and the retention
    // period (DSGVO Art. 5(1)(e)) belong in the first thing the visitor reads.
    welcome:
      "Hi, I'm Xeda's AI assistant, not a person. Ask me anything about what we build and how we work, by text or with the mic. Chats are stored for 30 days, so please don't share personal or client data here.",
    notice: "AI assistant · chats deleted after 30 days",
    privacy: "Privacy",
    history: "Chat History",
    noHistory: "No past conversations",
    clearConversation: "Delete conversation",
    newConversation: "New conversation",
    viewHistory: "View history",
    autoSpeak: "Read answers to spoken questions aloud",
    disableAutoSpeak: "Stop reading answers aloud",
    selectVoice: "Answer voice",
    voiceUnsupported: "Voice input isn't available in this browser. You can still type.",
    micDenied: "Microphone access denied",
    micDeniedHint: "Allow microphone access in your browser to ask by voice.",
    transcribeFailed: "Couldn't understand the recording. Please try again or type your question.",
    noSpeech: "I didn't hear anything. Check that the right microphone is selected, then try again.",
    deleteFailed: "Couldn't delete the conversation. Please try again.",
    error: "Error",
    linkInChat: "the link in the chat",
  },
  de: {
    title: "xeda.ai Assistent",
    placeholder: "Nachricht eingeben...",
    listening: "Ich höre zu … sendet, sobald Sie eine Pause machen",
    transcribing: "Wird umgewandelt …",
    welcome:
      "Hallo, ich bin der KI-Assistent von Xeda, kein Mensch. Fragen Sie mich alles darüber, was wir bauen und wie wir arbeiten, per Text oder Mikrofon. Chats werden 30 Tage gespeichert, bitte geben Sie hier also keine personenbezogenen Daten oder Mandantendaten ein.",
    notice: "KI-Assistent · Chats werden nach 30 Tagen gelöscht",
    privacy: "Datenschutz",
    history: "Chat-Verlauf",
    noHistory: "Keine vergangenen Gespräche",
    clearConversation: "Gespräch löschen",
    newConversation: "Neues Gespräch",
    viewHistory: "Verlauf anzeigen",
    autoSpeak: "Antworten auf gesprochene Fragen vorlesen",
    disableAutoSpeak: "Antworten nicht mehr vorlesen",
    selectVoice: "Stimme für Antworten",
    voiceUnsupported: "Spracheingabe ist in diesem Browser nicht verfügbar. Sie können weiterhin tippen.",
    micDenied: "Mikrofonzugriff verweigert",
    micDeniedHint: "Erlauben Sie den Mikrofonzugriff im Browser, um per Sprache zu fragen.",
    transcribeFailed: "Die Aufnahme war nicht verständlich. Bitte erneut versuchen oder die Frage tippen.",
    noSpeech: "Ich habe nichts gehört. Bitte prüfen Sie, ob das richtige Mikrofon ausgewählt ist, und versuchen Sie es erneut.",
    deleteFailed: "Das Gespräch konnte nicht gelöscht werden. Bitte erneut versuchen.",
    error: "Fehler",
    linkInChat: "den Link im Chat",
  },
};

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Conversation {
  id: string;
  created_at: string;
  updated_at: string;
  preview: string;
}

interface ChatSession {
  sessionId: string;
  sessionToken: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
const TTS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`;

const callChatBackend = async <T,>(payload: Record<string, unknown>): Promise<T> => {
  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  if (!resp.ok) {
    const error = await resp.json().catch(() => ({ error: "Chat request failed" }));
    throw new Error(error.error || "Chat request failed");
  }

  const { data } = await resp.json();
  return data as T;
};

const STT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/speech-to-text`;

// Voice input is recorded here and transcribed by our own speech-to-text
// function. The browser's SpeechRecognition was used before; in Chrome it sends
// the visitor's audio to Google, and Firefox does not have it at all.
const MAX_RECORDING_MS = 30_000;
// Anything shorter is a tap, not a question.
const MIN_RECORDING_BYTES = 1_000;

// End of turn. Once the visitor has spoken, this much quiet sends the question,
// the way a person stops and waits for an answer. The recording used to run
// until the mic was tapped a second time, so a visitor who asked and waited got
// nothing back for 30 seconds.
const END_OF_SPEECH_SILENCE_MS = 1_200;
// Nobody has said anything in this long: stop, rather than hold the mic open.
const NO_SPEECH_TIMEOUT_MS = 8_000;
// Microphone level (RMS of the waveform, 0 to 1) that counts as speech, held
// for a few readings so a click or a cough does not count. Noise suppression is
// on, so a quiet room stays well below it.
const SPEECH_RMS = 0.015;
const SPEECH_MIN_READINGS = 3;
const LEVEL_CHECK_MS = 100;

// First container this browser can record: Opus in WebM for Chrome, Edge and
// Firefox, AAC in MP4 for Safari.
const pickRecordingType = (): string => {
  if (typeof MediaRecorder === "undefined") return "";
  return ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"]
    .find((type) => MediaRecorder.isTypeSupported(type)) ?? "";
};

const canRecord = () =>
  typeof MediaRecorder !== "undefined" && !!navigator.mediaDevices?.getUserMedia;

// The assistant is asked for plain text, but a model sometimes formats anyway.
// The window renders text as-is, so strip the markup rather than show it.
const toPlainText = (text: string) =>
  text
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, "$1 ($2)")
    .replace(/(\*\*|__)(.+?)\1/g, "$2")
    .replace(/^\s*#{1,6}\s+/gm, "")
    .replace(/^\s*[*\-•]\s+/gm, "· ")
    .replace(/`([^`]+)`/g, "$1");

// The TTS function caps text at 1000 characters (it is a spend cap). Longer
// answers used to fail there and fall back to the browser's robot voice.
const MAX_SPOKEN_CHARS = 1000;

// What gets read aloud: no symbols, and no URL spelled out letter by letter.
const toSpeech = (text: string, linkPhrase: string) => {
  const spoken = toPlainText(text)
    .replace(/\s*\((https?:\/\/[^)\s]+)\)/g, "")
    .replace(/https?:\/\/\S+/g, linkPhrase)
    .split("\n")
    .map((line) => line.replace(/^· /, "").trim())
    .filter(Boolean)
    // End each line as a sentence, so list items get a pause between them
    // instead of running together.
    .map((line) => (/[.!?:;]$/.test(line) ? line : `${line}.`))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  if (spoken.length <= MAX_SPOKEN_CHARS) return spoken;

  // Cut at the last sentence end that fits, so it stops on a full stop rather
  // than mid-word.
  const cut = spoken.slice(0, MAX_SPOKEN_CHARS);
  const end = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("? "), cut.lastIndexOf("! "));
  return end > MAX_SPOKEN_CHARS / 2 ? cut.slice(0, end + 1) : cut;
};

// Retrieve the anonymous signed session used for chat history.
const getStoredChatSession = (): ChatSession | null => {
  const sessionId = localStorage.getItem("chatbot_session_id");
  const sessionToken = localStorage.getItem("chatbot_session_token");
  return sessionId && sessionToken ? { sessionId, sessionToken } : null;
};

// Copy button component with feedback
const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-5 w-5"
      onClick={handleCopy}
    >
      {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
    </Button>
  );
};

const Chatbot = () => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  // The chat follows the site's language until the visitor picks one in the
  // chat's own menu; only that explicit pick is remembered. It previously fell
  // back to "en", which greeted every German visitor in English on a German
  // page. Derived rather than synced in an effect, so a site language switch
  // shows up in the same render.
  const { language: siteLanguage } = useLanguage();
  const [chosenLanguage, setChosenLanguage] = useState<Language | null>(() => {
    const saved = localStorage.getItem("chatbot_language");
    return saved === "de" || saved === "en" ? saved : null;
  });
  const language: Language = chosenLanguage ?? (siteLanguage === "de" ? "de" : "en");
  const [selectedVoice, setSelectedVoice] = useState<string>(() => {
    return localStorage.getItem("chatbot_voice") || voices[0].id;
  });
  const scrollRef = useRef<HTMLDivElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<number | null>(null);
  const silenceWatchRef = useRef<{ context: AudioContext; timer: number } | null>(null);
  const transcribeRef = useRef<((recording: Blob) => Promise<void>) | null>(null);
  // Answers are read aloud only when the question was spoken. Speaking a reply
  // to a typed question is audio nobody asked for.
  const lastInputWasVoiceRef = useRef(false);
  const lastSpokenRef = useRef<string>("");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sessionRef = useRef<ChatSession | null>(null);

  const t = uiText[language];
  const currentVoice = voices.find(v => v.id === selectedVoice) || voices[0];

  const getChatSession = useCallback(async () => {
    if (sessionRef.current) return sessionRef.current;

    const storedSession = getStoredChatSession();
    if (storedSession) {
      sessionRef.current = storedSession;
      return storedSession;
    }

    const session = await callChatBackend<ChatSession>({
      action: "init-session",
    });

    localStorage.setItem("chatbot_session_id", session.sessionId);
    localStorage.setItem("chatbot_session_token", session.sessionToken);
    sessionRef.current = session;
    return session;
  }, []);

  const callSignedChatBackend = useCallback(async <T,>(payload: Record<string, unknown>) => {
    const session = await getChatSession();
    return callChatBackend<T>({
      ...payload,
      sessionId: session.sessionId,
      sessionToken: session.sessionToken,
    });
  }, [getChatSession]);

  // Persist only an explicit pick. Writing the default on mount would make it
  // look like a choice and pin the chat to it after a site language switch.
  const chooseLanguage = useCallback((next: Language) => {
    localStorage.setItem("chatbot_language", next);
    setChosenLanguage(next);
  }, []);

  useEffect(() => {
    localStorage.setItem("chatbot_voice", selectedVoice);
  }, [selectedVoice]);

  // Load conversation history
  const loadConversationHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      const convs = await callSignedChatBackend<Conversation[]>({
        action: "list-conversations",
      });
      setConversations(convs ?? []);
    } catch (error) {
      console.error("Failed to load conversation history:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  // Load specific conversation
  const loadConversation = useCallback(async (convId: string) => {
    try {
      const msgs = await callSignedChatBackend<Message[]>({
        action: "load-conversation",
        conversationId: convId,
      });
      setMessages(msgs ?? []);
      setConversationId(convId);
      setShowHistory(false);
    } catch (error) {
      console.error("Failed to load conversation:", error);
    }
  }, []);

  // Load existing conversation on mount
  useEffect(() => {
    const initConversation = async () => {
      try {
        const conversation = await callSignedChatBackend<{ id: string } | null>({
          action: "latest-conversation",
        });

        if (conversation) {
          await loadConversation(conversation.id);
        }
      } catch (error) {
        console.error("Failed to load conversation:", error);
      }
    };

    initConversation();
  }, [loadConversation]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Load history when panel opens
  useEffect(() => {
    if (showHistory) {
      loadConversationHistory();
    }
  }, [showHistory, loadConversationHistory]);

  // Save message to database
  const saveMessage = useCallback(async (convId: string, message: Message) => {
    try {
      await callSignedChatBackend({
        action: "save-message",
        conversationId: convId,
        message,
      });
    } catch (error) {
      console.error("Failed to save message:", error);
    }
  }, []);

  // Create new conversation
  const createNewConversation = useCallback(async () => {
    setMessages([]);
    setConversationId(null);
    lastSpokenRef.current = "";
    setShowHistory(false);
  }, []);

  // Get or create conversation
  const getOrCreateConversation = useCallback(async () => {
    if (conversationId) return conversationId;

    try {
      const data = await callSignedChatBackend<{ id: string }>({
        action: "create-conversation",
      });
      
      setConversationId(data.id);
      return data.id;
    } catch (error) {
      console.error("Failed to create conversation:", error);
      return null;
    }
  }, [conversationId]);

  // Delete conversation
  const deleteConversation = async (convId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await callSignedChatBackend({
        action: "delete-conversation",
        conversationId: convId,
      });
      setConversations((prev) => prev.filter((c) => c.id !== convId));
      
      if (convId === conversationId) {
        setMessages([]);
        setConversationId(null);
      }
    } catch (error) {
      console.error("Failed to delete conversation:", error);
      toast({ title: t.error, description: t.deleteFailed, variant: "destructive" });
    }
  };

  // Delete the current conversation. Only clear the window once the server has
  // actually erased it: a delete button that empties the screen but leaves the
  // transcript stored is worse than one that visibly fails.
  const clearConversation = async () => {
    if (conversationId) {
      try {
        await callSignedChatBackend({
          action: "delete-conversation",
          conversationId,
        });
      } catch (error) {
        console.error("Failed to delete conversation:", error);
        toast({ title: t.error, description: t.deleteFailed, variant: "destructive" });
        return;
      }
    }
    setMessages([]);
    setConversationId(null);
    lastSpokenRef.current = "";
  };

  const speak = async (raw: string) => {
    const text = toSpeech(raw, t.linkInChat);
    if (!text) return;

    stopSpeaking();
    
    setIsLoadingAudio(true);
    setIsSpeaking(true);
    
    try {
      const resp = await fetch(TTS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ text, voiceId: selectedVoice }),
      });

      if (!resp.ok) {
        throw new Error("Failed to generate speech");
      }

      const { audioContent } = await resp.json();
      
      const audio = new Audio(`data:audio/mpeg;base64,${audioContent}`);
      audioRef.current = audio;
      
      audio.onended = () => {
        setIsSpeaking(false);
        audioRef.current = null;
      };
      
      audio.onerror = () => {
        setIsSpeaking(false);
        audioRef.current = null;
      };
      
      await audio.play();
    } catch (error) {
      console.error("TTS error:", error);
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language === "de" ? "de-DE" : "en-US";
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
      } else {
        setIsSpeaking(false);
        toast({
          title: "Speech Error",
          description: "Failed to generate speech",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoadingAudio(false);
    }
  };

  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const speakMessage = (content: string) => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speak(content);
    }
  };

  const streamChat = async (userMessages: Message[], convId: string | null, replyLanguage: Language) => {
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      // A spoken question gets a short answer: it is read aloud, and a long one
      // takes as long to generate as it does to listen to.
      body: JSON.stringify({
        messages: userMessages,
        language: replyLanguage,
        voice: lastInputWasVoiceRef.current,
      }),
    });

    if (!resp.ok) {
      const error = await resp.json();
      throw new Error(error.error || "Failed to get response");
    }

    if (!resp.body) throw new Error("No response body");

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let assistantContent = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      let newlineIndex;
      while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
        let line = buffer.slice(0, newlineIndex);
        buffer = buffer.slice(newlineIndex + 1);

        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") break;

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            assistantContent += content;
            setMessages((prev) => {
              const last = prev[prev.length - 1];
              if (last?.role === "assistant") {
                return prev.map((m, i) =>
                  i === prev.length - 1 ? { ...m, content: assistantContent } : m
                );
              }
              return [...prev, { role: "assistant", content: assistantContent }];
            });
          }
        } catch {
          buffer = line + "\n" + buffer;
          break;
        }
      }
    }

    if (convId && assistantContent) {
      await saveMessage(convId, { role: "assistant", content: assistantContent });
    }

    if (
      autoSpeak &&
      lastInputWasVoiceRef.current &&
      assistantContent &&
      assistantContent !== lastSpokenRef.current
    ) {
      lastSpokenRef.current = assistantContent;
      speak(assistantContent);
    }
  };

  // replyLanguage: the language a spoken question was asked in, when known.
  const sendMessage = async (text: string, viaVoice: boolean, replyLanguage: Language = language) => {
    const content = text.trim();
    if (!content || isLoading) return;

    lastInputWasVoiceRef.current = viaVoice;
    const userMessage: Message = { role: "user", content };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const convId = await getOrCreateConversation();
      if (convId) {
        await saveMessage(convId, userMessage);
      }

      await streamChat(newMessages, convId, replyLanguage);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => sendMessage(input, false);

  // A spoken question goes straight in, like pressing send: this is a voice
  // conversation, and the transcript appears as the visitor's own message.
  const transcribe = async (recording: Blob) => {
    if (recording.size < MIN_RECORDING_BYTES) return;

    setIsTranscribing(true);
    try {
      const resp = await fetch(STT_URL, {
        method: "POST",
        headers: {
          "Content-Type": recording.type || "audio/webm",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: recording,
      });
      if (!resp.ok) throw new Error(`Speech-to-text failed (${resp.status})`);

      const { text, language: spoken } = await resp.json();
      // Nothing recognisable: usually silence, a muted or the wrong microphone.
      if (typeof text !== "string" || !text.trim()) {
        toast({ title: t.error, description: t.noSpeech, variant: "destructive" });
        return;
      }

      // Answer in the language the question was asked in.
      await sendMessage(text, true, spoken === "de" || spoken === "en" ? spoken : language);
    } catch (error) {
      console.error("Speech-to-text error:", error);
      toast({ title: t.error, description: t.transcribeFailed, variant: "destructive" });
    } finally {
      setIsTranscribing(false);
    }
  };

  // The recorder reports back after later renders, so it reaches transcribe
  // through a ref that always holds the latest messages, language and state.
  useEffect(() => {
    transcribeRef.current = transcribe;
  });

  const stopRecording = () => {
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== "inactive") recorder.stop();
  };

  // Touches refs only, so it is stable across renders.
  const stopSilenceWatch = useCallback(() => {
    const watch = silenceWatchRef.current;
    if (!watch) return;
    window.clearInterval(watch.timer);
    watch.context.close().catch(() => {});
    silenceWatchRef.current = null;
  }, []);

  // Follow the microphone level and end the turn when the visitor pauses. If
  // the browser cannot measure it, tapping the mic and the 30-second limit
  // still end the recording.
  const watchForSilence = (context: AudioContext, stream: MediaStream) => {
    const analyser = context.createAnalyser();
    analyser.fftSize = 2048;
    context.createMediaStreamSource(stream).connect(analyser);
    const samples = new Float32Array(analyser.fftSize);

    const startedAt = performance.now();
    let lastSpeechAt = 0;
    let loudReadings = 0;
    const timer = window.setInterval(() => {
      analyser.getFloatTimeDomainData(samples);
      let sum = 0;
      for (const sample of samples) sum += sample * sample;
      const level = Math.sqrt(sum / samples.length);
      const now = performance.now();

      loudReadings = level > SPEECH_RMS ? loudReadings + 1 : 0;
      if (loudReadings >= SPEECH_MIN_READINGS) lastSpeechAt = now;

      if (lastSpeechAt ? now - lastSpeechAt > END_OF_SPEECH_SILENCE_MS : now - startedAt > NO_SPEECH_TIMEOUT_MS) {
        stopRecording();
      }
    }, LEVEL_CHECK_MS);

    silenceWatchRef.current = { context, timer };
  };

  const startRecording = async () => {
    if (!canRecord()) {
      toast({ title: t.error, description: t.voiceUnsupported, variant: "destructive" });
      return;
    }

    stopSpeaking();

    // Created here, inside the tap, because browsers only let audio start from
    // a user gesture; after the permission prompt it could start suspended and
    // hear nothing.
    const AudioContextClass =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    const context = AudioContextClass ? new AudioContextClass() : null;

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
    } catch (error) {
      context?.close().catch(() => {});
      console.error("Microphone error:", error);
      const denied = error instanceof DOMException && error.name === "NotAllowedError";
      toast({
        title: denied ? t.micDenied : t.error,
        description: denied ? t.micDeniedHint : t.voiceUnsupported,
        variant: "destructive",
      });
      return;
    }

    const type = pickRecordingType();
    const recorder = new MediaRecorder(stream, type ? { mimeType: type } : undefined);

    chunksRef.current = [];
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunksRef.current.push(event.data);
    };
    recorder.onstop = () => {
      if (recordingTimerRef.current !== null) window.clearTimeout(recordingTimerRef.current);
      recordingTimerRef.current = null;
      stopSilenceWatch();
      // Release the microphone so the browser's recording indicator goes off.
      stream.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
      recorderRef.current = null;
      setIsRecording(false);

      const recording = new Blob(chunksRef.current, { type: recorder.mimeType || type });
      chunksRef.current = [];
      transcribeRef.current?.(recording);
    };

    micStreamRef.current = stream;
    recorderRef.current = recorder;
    recorder.start();
    setIsRecording(true);

    // A hard stop, so a forgotten open microphone cannot keep recording, or
    // keep running up the transcription bill.
    recordingTimerRef.current = window.setTimeout(stopRecording, MAX_RECORDING_MS);

    if (context) {
      try {
        await context.resume();
        // Stopped or discarded while resuming: nothing left to watch.
        if (recorderRef.current === recorder) watchForSilence(context, stream);
        else context.close().catch(() => {});
      } catch (error) {
        console.error("Silence detection unavailable:", error);
        context.close().catch(() => {});
      }
    }
  };

  // Switch the microphone off and drop a recording in progress without sending
  // it. Touches refs only, so it is stable across renders.
  const discardRecording = useCallback(() => {
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.onstop = null;
      recorder.stop();
    }
    recorderRef.current = null;
    if (recordingTimerRef.current !== null) window.clearTimeout(recordingTimerRef.current);
    recordingTimerRef.current = null;
    micStreamRef.current?.getTracks().forEach((track) => track.stop());
    micStreamRef.current = null;
    stopSilenceWatch();
  }, [stopSilenceWatch]);

  // Never leave the microphone on after the widget goes away.
  useEffect(() => discardRecording, [discardRecording]);

  // Closing the window mid-recording discards it rather than sending it.
  const toggleOpen = () => {
    if (isOpen) {
      discardRecording();
      setIsRecording(false);
    }
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Floating button */}
      <Button
        onClick={toggleOpen}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
        size="icon"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>

      {/* Chat window */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 w-[calc(100vw-3rem)] max-w-[400px] h-[min(540px,calc(100dvh-8rem))] shadow-xl z-50 flex flex-col overflow-hidden">
          <CardHeader className="py-3 px-4 border-b shrink-0">
            <CardTitle className="text-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                {showHistory ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setShowHistory(false)}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                ) : (
                  <MessageCircle className="h-5 w-5 text-primary" />
                )}
                {showHistory ? t.history : t.title}
              </div>
              <div className="flex items-center gap-1">
                {!showHistory && (
                  <>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title={languageLabels[language].name}
                        >
                          <Globe className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => chooseLanguage("en")}>
                          <span className="mr-2">🇬🇧</span> English
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => chooseLanguage("de")}>
                          <span className="mr-2">🇩🇪</span> Deutsch
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setShowHistory(true)}
                      title={t.viewHistory}
                    >
                      <History className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={createNewConversation}
                      title={t.newConversation}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    {messages.length > 0 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={clearConversation}
                        title={t.clearConversation}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title={`${t.selectVoice}: ${currentVoice.name}`}
                        >
                          <User className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel className="text-xs">{t.selectVoice}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {voices.map((voice) => (
                          <DropdownMenuItem
                            key={voice.id}
                            onClick={() => setSelectedVoice(voice.id)}
                            className={selectedVoice === voice.id ? "bg-muted" : ""}
                          >
                            <div className="flex flex-col">
                              <span className="font-medium">{voice.name}</span>
                              <span className="text-xs text-muted-foreground">{voice.description}</span>
                            </div>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setAutoSpeak(!autoSpeak)}
                      title={autoSpeak ? t.disableAutoSpeak : t.autoSpeak}
                    >
                      {autoSpeak ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                    </Button>
                  </>
                )}
              </div>
            </CardTitle>
          </CardHeader>

          {showHistory ? (
            <CardContent className="flex-1 p-0 overflow-hidden">
              <ScrollArea className="h-full">
                {isLoadingHistory ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : conversations.length === 0 ? (
                  <p className="text-center text-muted-foreground text-sm py-8">
                    {t.noHistory}
                  </p>
                ) : (
                  <div className="divide-y">
                    {conversations.map((conv) => (
                      <div
                        key={conv.id}
                        className={`p-3 cursor-pointer hover:bg-muted/50 transition-colors ${
                          conv.id === conversationId ? "bg-muted" : ""
                        }`}
                        onClick={() => loadConversation(conv.id)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {conv.preview}...
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {format(new Date(conv.updated_at), "MMM d, yyyy h:mm a")}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 shrink-0"
                            onClick={(e) => deleteConversation(conv.id, e)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          ) : (
            <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
              <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                {messages.length === 0 && (
                  <p className="text-center text-muted-foreground text-sm py-8">
                    {t.welcome}
                  </p>
                )}
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`mb-3 ${msg.role === "user" ? "text-right" : "text-left"}`}
                  >
                    <div
                      className={`inline-block px-3 py-2 rounded-lg max-w-[85%] text-sm text-left whitespace-pre-line ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      {msg.role === "assistant" ? toPlainText(msg.content) : msg.content}
                      {msg.role === "assistant" && (
                        <span className="inline-flex ml-1 gap-0.5 align-middle">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            onClick={() => speakMessage(msg.content)}
                          >
                            <Volume2 className="h-3 w-3" />
                          </Button>
                          <CopyButton text={toPlainText(msg.content)} />
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && messages[messages.length - 1]?.role === "user" && (
                  <div className="text-left mb-3">
                    <div className="inline-block px-3 py-2 rounded-lg bg-muted">
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-foreground/60 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-2 h-2 bg-foreground/60 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-2 h-2 bg-foreground/60 rounded-full animate-bounce"></span>
                      </div>
                    </div>
                  </div>
                )}
              </ScrollArea>
              <div className="px-3 pt-3 flex gap-2 shrink-0 border-t">
                <Button
                  variant={isRecording ? "destructive" : "outline"}
                  size="icon"
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={(isLoading || isTranscribing) && !isRecording}
                  aria-pressed={isRecording}
                  aria-label={language === "de" ? "Spracheingabe" : "Voice input"}
                >
                  {isTranscribing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isRecording ? (
                    <MicOff className="h-4 w-4" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </Button>
                <Input
                  placeholder={isRecording ? t.listening : isTranscribing ? t.transcribing : t.placeholder}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  disabled={isLoading || isRecording || isTranscribing}
                  className="flex-1"
                />
                <Button size="icon" onClick={handleSend} disabled={isLoading || !input.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              {/* Always visible, not only before the first message: the AI
                  disclosure has to hold for a reloaded conversation too. */}
              <p className="px-3 pt-1.5 pb-2 text-[11px] leading-tight text-muted-foreground shrink-0">
                {t.notice} ·{" "}
                <Link to="/privacy" className="underline underline-offset-2 hover:text-foreground">
                  {t.privacy}
                </Link>
              </p>
            </CardContent>
          )}
        </Card>
      )}
    </>
  );
};

export default Chatbot;
