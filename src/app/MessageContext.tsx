import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { messagesApi } from '../api/messages'
import { AIMessage } from './types'

interface MessageContextType {
  messages: AIMessage[]
  isLoading: boolean
  error: string | null
  sendMessage: (content: string) => Promise<void>
  refresh: () => Promise<void>
}

const MessageContext = createContext<MessageContextType | undefined>(undefined)

export function MessageProvider({ children }: { children: React.ReactNode }) {
  const { sessionId } = useParams<{ sessionId: string }>()
  
  const [messages, setMessages] = useState<AIMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMessages = useCallback(async (sid: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await messagesApi.list(sid)
      setMessages(data)
    } catch (err: any) {
      console.error('Failed to load messages:', err)
      setError(err.response?.data?.message || 'Failed to load messages')
      setMessages([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (sessionId) {
      fetchMessages(sessionId)
    } else {
      setMessages([])
    }
  }, [sessionId, fetchMessages])

  const refresh = useCallback(async () => {
    if (sessionId) await fetchMessages(sessionId)
  }, [sessionId, fetchMessages])

  const sendMessage = useCallback(async (content: string) => {
    if (!sessionId) return

    // 1. Immediately append to chat
    const tempId = `temp-${Date.now()}`
    const userMsg: AIMessage = { id: tempId, role: 'user', content }
    setMessages(prev => [...prev, userMsg])

    try {
      // Save user message to backend
      const savedUserMsg = await messagesApi.create({
        session_id: sessionId,
        role: 'user',
        content
      })
      
      // Update temp message with real id
      setMessages(prev => prev.map(m => m.id === tempId ? savedUserMsg : m))

      // The backend now generates the assistant reply automatically when a user message is sent.
      // Refresh the message list to get the assistant's reply.
      await fetchMessages(sessionId)
    } catch (err: any) {
      console.error('Failed to send message:', err)
      // Rollback optimistic update
      setMessages(prev => prev.filter(m => m.id !== tempId))
      throw err
    }
  }, [sessionId])

  const contextValue = useMemo(() => ({
    messages,
    isLoading,
    error,
    sendMessage,
    refresh
  }), [messages, isLoading, error, sendMessage, refresh])

  return (
    <MessageContext.Provider value={contextValue}>
      {children}
    </MessageContext.Provider>
  )
}

export function useMessages() {
  const context = useContext(MessageContext)
  if (context === undefined) {
    throw new Error('useMessages must be used within a MessageProvider')
  }
  return context
}
