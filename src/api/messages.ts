import { apiClient } from './client'
import { AIMessage } from '../app/types'

interface MessagePayload {
  session_id: string
  role: 'user' | 'assistant'
  content: string
}

export const messagesApi = {
  list: async (sessionId: string): Promise<AIMessage[]> => {
    const { data } = await apiClient.get('/messages', { params: { session_id: sessionId } })
    // Mapping backend response to AIMessage
    return data.data.map((msg: any) => ({
      id: msg.id,
      role: msg.role === 'assistant' ? 'ai' : msg.role,
      content: msg.content,
      sql: msg.has_sql ? '' : undefined // we don't have SQL payload right now, handled later
    }))
  },
  
  create: async (payload: MessagePayload): Promise<AIMessage> => {
    const { data } = await apiClient.post('/messages', payload)
    return {
      id: data.id,
      role: data.role === 'assistant' ? 'ai' : data.role,
      content: data.content,
      sql: data.has_sql ? '' : undefined
    }
  }
}
