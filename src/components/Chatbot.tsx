import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle, Send, X, Loader2, Mic, MicOff, Volume2, VolumeX, Trash2, History, Plus, ChevronLeft, Globe, User, Copy, Check } from "lucide-react";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

// ElevenLabs voice options
interface Voice {
  id: string;
  name: string;
  description: string;
}

const voices: Voice[] = [
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah", description: "Warm & natural" },
  { id: "JBFqnCBsd6RMkjVDRZzb", name: "George", description: "British male" },
  { id: "pFZP5JQG7iQjIQuC4Bku", name: "Lily", description: "British female" },
  { id: "TX3LPaxmHKxFdv7VOQHJ", name: "Liam", description: "American male" },
  { id: "XrExE9yKIg1WjnnlVkGX", name: "Matilda", description: "Warm female" },
  { id: "onwK4e9ZLuTAKqWW03F9", name: "Daniel", description: "Deep male" },
  { id: "cgSgspJ2msm6clMCkdW9", name: "Jessica", description: "American female" },
  { id: "iP95p4xoKVk53GoZ742B", name: "Chris", description: "Casual male" },
];

type Language = "en" | "de";

const languageLabels: Record<Language, { name: string; flag: string }> = {
  en: { name: "English", flag: "🇬🇧" },
  de: { name: "Deutsch", flag: "🇩🇪" },
};

const uiText: Record<Language, {
  title: string;
  placeholder: string;
  welcome: string;
  history: string;
  noHistory: string;
  clearConversation: string;
  newConversation: string;
  viewHistory: string;
  autoSpeak: string;
  disableAutoSpeak: string;
}> = {
  en: {
    title: "xeda.ai Assistant",
    placeholder: "Type a message...",
    welcome: "Hi! Ask me anything about AI solutions.",
    history: "Chat History",
    noHistory: "No past conversations",
    clearConversation: "Delete conversation",
    newConversation: "New conversation",
    viewHistory: "View history",
    autoSpeak: "Enable auto-speak",
    disableAutoSpeak: "Disable auto-speak",
  },
  de: {
    title: "xeda.ai Assistent",
    placeholder: "Nachricht eingeben...",
    welcome: "Hallo! Frag mich alles über KI-Lösungen.",
    history: "Chat-Verlauf",
    noHistory: "Keine vergangenen Gespräche",
    clearConversation: "Gespräch löschen",
    newConversation: "Neues Gespräch",
    viewHistory: "Verlauf anzeigen",
    autoSpeak: "Sprachausgabe aktivieren",
    disableAutoSpeak: "Sprachausgabe deaktivieren",
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

// Check for browser speech recognition support
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

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
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("chatbot_language");
    return (saved === "de" || saved === "en") ? saved : "en";
  });
  const [selectedVoice, setSelectedVoice] = useState<string>(() => {
    return localStorage.getItem("chatbot_voice") || voices[0].id;
  });
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
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

  // Save preferences
  useEffect(() => {
    localStorage.setItem("chatbot_language", language);
  }, [language]);

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
    }
  };

  // Clear current conversation
  const clearConversation = async () => {
    if (conversationId) {
      await callSignedChatBackend({
        action: "delete-conversation",
        conversationId,
      });
    }
    setMessages([]);
    setConversationId(null);
    lastSpokenRef.current = "";
  };

  const speak = async (text: string) => {
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

  const streamChat = async (userMessages: Message[], convId: string | null) => {
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages: userMessages, language }),
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

    if (autoSpeak && assistantContent && assistantContent !== lastSpokenRef.current) {
      lastSpokenRef.current = assistantContent;
      speak(assistantContent);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const convId = await getOrCreateConversation();
      if (convId) {
        await saveMessage(convId, userMessage);
      }

      await streamChat(newMessages, convId);
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

  const startRecording = () => {
    if (!SpeechRecognition) {
      toast({
        title: language === "de" ? "Nicht unterstützt" : "Not Supported",
        description: language === "de" 
          ? "Spracherkennung wird in diesem Browser nicht unterstützt. Versuchen Sie Chrome oder Edge."
          : "Speech recognition is not supported in this browser. Try Chrome or Edge.",
        variant: "destructive",
      });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = language === "de" ? "de-DE" : "en-US";

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join("");
      setInput(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsRecording(false);
      if (event.error === "not-allowed") {
        toast({
          title: language === "de" ? "Mikrofonzugriff verweigert" : "Microphone Access Denied",
          description: language === "de" 
            ? "Bitte erlauben Sie den Mikrofonzugriff, um die Spracheingabe zu nutzen."
            : "Please allow microphone access to use voice input.",
          variant: "destructive",
        });
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
        size="icon"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>

      {/* Chat window */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 w-[400px] h-[500px] shadow-xl z-50 flex flex-col overflow-hidden">
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
                        <DropdownMenuItem onClick={() => setLanguage("en")}>
                          <span className="mr-2">🇬🇧</span> English
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setLanguage("de")}>
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
                          title={`Voice: ${currentVoice.name}`}
                        >
                          <User className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel className="text-xs">Select Voice</DropdownMenuLabel>
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
                      className={`inline-block px-3 py-2 rounded-lg max-w-[85%] text-sm ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      {msg.content}
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
                          <CopyButton text={msg.content} />
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
              <div className="p-3 border-t flex gap-2 shrink-0">
                <Button
                  variant={isRecording ? "destructive" : "outline"}
                  size="icon"
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isLoading && !isRecording}
                >
                  {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
                <Input
                  placeholder={t.placeholder}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button size="icon" onClick={handleSend} disabled={isLoading || !input.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </>
  );
};

export default Chatbot;
