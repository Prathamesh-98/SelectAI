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
      has_sql: msg.has_sql || false,
      generated_sql: msg.generated_sql || undefined,
      validation_error: msg.validation_error || undefined,
      execution_result: msg.execution_result || undefined,
      execution_time_ms: msg.execution_time_ms || undefined,
      chart_data: msg.chart_data || undefined
    }))
  },
  
  create: async (payload: MessagePayload): Promise<AIMessage> => {
    const { data } = await apiClient.post('/messages', payload)
    return {
      id: data.id,
      role: data.role === 'assistant' ? 'ai' : data.role,
      content: data.content,
      has_sql: data.has_sql || false,
      generated_sql: data.generated_sql || undefined,
      validation_error: data.validation_error || undefined,
      execution_result: data.execution_result || undefined,
      execution_time_ms: data.execution_time_ms || undefined,
      chart_data: data.chart_data || undefined
    }
  }
}
