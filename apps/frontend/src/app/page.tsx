"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Bot, User, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
  isStreaming?: boolean
}

const AI_RESPONSES = [
  "¡Hola! Soy tu asistente de IA. Estoy aquí para ayudarte con cualquier pregunta o tarea que tengas. ¿En qué puedo asistirte hoy?",
  "Esa es una excelente pregunta. Basándome en mi conocimiento, puedo decirte que este tema tiene varios aspectos interesantes que vale la pena explorar...",
  "Entiendo perfectamente lo que necesitas. Te voy a explicar paso a paso cómo puedes abordar esta situación de la manera más efectiva...",
  "Me parece muy interesante tu planteamiento. Desde mi perspectiva como IA, creo que la mejor manera de abordar esto sería considerando los siguientes factores...",
  "Perfecto, puedo ayudarte con eso. Déjame analizar la información y proporcionarte una respuesta detallada y útil...",
  "Esa es una pregunta muy reflexiva. Te voy a dar mi análisis considerando diferentes perspectivas y enfoques posibles...",
]

export default function ModernAIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "¡Hola! Soy tu asistente de IA. ¿En qué puedo ayudarte hoy?",
      role: "assistant",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const simulateAIResponse = async (userMessage: string) => {
    setIsTyping(true)

    // Simular tiempo de "pensamiento"
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000))

    const responseText = AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)]

    const aiMessage: Message = {
      id: Date.now().toString(),
      content: "",
      role: "assistant",
      timestamp: new Date(),
      isStreaming: true,
    }

    setMessages((prev) => [...prev, aiMessage])
    setIsTyping(false)

    // Simular streaming de texto
    for (let i = 0; i <= responseText.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 20 + Math.random() * 30))

      setMessages((prev) =>
        prev.map((msg) => (msg.id === aiMessage.id ? { ...msg, content: responseText.slice(0, i) } : msg)),
      )
    }

    // Marcar como completado
    setMessages((prev) => prev.map((msg) => (msg.id === aiMessage.id ? { ...msg, isStreaming: false } : msg)))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      role: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")

    await simulateAIResponse(input.trim())
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-4">
        <div className="flex items-center gap-3 max-w-4xl mx-auto">
          <div className="relative">
            <Avatar className="h-10 w-10 border-2 border-blue-200 dark:border-blue-800">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                <Bot className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse" />
          </div>
          <div>
            <h1 className="font-semibold text-slate-900 dark:text-slate-100">Asistente IA</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">En línea • Siempre disponible</p>
          </div>
          <div className="ml-auto">
            <Sparkles className="h-5 w-5 text-blue-500 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn("flex gap-3 group", message.role === "user" ? "justify-end" : "justify-start")}
            >
              {message.role === "assistant" && (
                <Avatar className="h-8 w-8 border border-slate-200 dark:border-slate-700 shrink-0">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}

              <div
                className={cn("flex flex-col gap-1 max-w-[80%]", message.role === "user" ? "items-end" : "items-start")}
              >
                <Card
                  className={cn(
                    "p-3 shadow-sm border-0 transition-all duration-200",
                    message.role === "user"
                      ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                      : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700",
                    message.isStreaming && "animate-pulse",
                  )}
                >
                  <p
                    className={cn(
                      "text-sm leading-relaxed",
                      message.role === "user" ? "text-white" : "text-slate-700 dark:text-slate-300",
                    )}
                  >
                    {message.content}
                    {message.isStreaming && <span className="inline-block w-2 h-4 bg-current ml-1 animate-pulse" />}
                  </p>
                </Card>

                <span className="text-xs text-slate-400 dark:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  {formatTime(message.timestamp)}
                </span>
              </div>

              {message.role === "user" && (
                <Avatar className="h-8 w-8 border border-slate-200 dark:border-slate-700 shrink-0">
                  <AvatarFallback className="bg-gradient-to-br from-slate-500 to-slate-600 text-white text-xs">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3 justify-start">
              <Avatar className="h-8 w-8 border border-slate-200 dark:border-slate-700">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <Card className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                  <div
                    className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  />
                  <div
                    className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  />
                </div>
              </Card>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-4">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe tu mensaje aquí..."
                className="pr-12 h-12 border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                disabled={isTyping}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Button
                  type="submit"
                  size="sm"
                  disabled={!input.trim() || isTyping}
                  className="h-8 w-8 p-0 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-center">
            Presiona Enter para enviar • La IA puede cometer errores
          </p>
        </form>
      </div>
    </div>
  )
}
