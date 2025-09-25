import { useQueryClient } from '@tanstack/react-query'
import type { ChatRequest } from '../api'

const API_BASE_URL = 'http://localhost:8000'

interface StreamingChatCallbacks {
  onChunk: (chunk: string) => void
  onComplete: (conversationId: number, messageId: number) => void
  onError: (error: string) => void
  onConversationId?: (conversationId: number) => void
  onUserMessage?: (message: string) => void
}

export const useStreamingChat = () => {
  const queryClient = useQueryClient()

  const sendStreamingMessage = async (
    data: ChatRequest,
    callbacks: StreamingChatCallbacks
  ) => {
    const { onChunk, onComplete, onError, onConversationId, onUserMessage } = callbacks

    try {
      // If conversation_id is 0 or null, don't send it (let backend create new conversation)
      const requestData = data.conversation_id ? data : { message: data.message }

      const response = await fetch(`${API_BASE_URL}/chat/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No reader available')
      }

      const decoder = new TextDecoder()
      let conversationId: number | null = null

      while (true) {
        const { done, value } = await reader.read()

        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const eventData = JSON.parse(line.slice(6))

              switch (eventData.type) {
                case 'conversation_id':
                  conversationId = eventData.data
                  onConversationId?.(eventData.data)
                  break
                case 'user_message':
                  onUserMessage?.(eventData.data)
                  break
                case 'assistant_chunk':
                  onChunk(eventData.data)
                  break
                case 'complete':
                  if (conversationId) {
                    onComplete(conversationId, eventData.data)
                    // Invalidate queries to refresh the conversation data
                    queryClient.invalidateQueries({ queryKey: [{ url: '/conversations/' }] })
                    queryClient.invalidateQueries({ queryKey: [{ url: '/conversations/:conversation_id', params: { conversation_id: conversationId } }] })
                  }
                  break
                case 'error':
                  onError(eventData.data)
                  break
              }
            } catch (e) {
              // Skip invalid JSON lines
              console.warn('Failed to parse SSE data:', line)
            }
          }
        }
      }
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Unknown error occurred')
    }
  }

  return { sendStreamingMessage }
}
