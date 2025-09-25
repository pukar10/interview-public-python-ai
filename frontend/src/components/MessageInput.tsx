import React, { useState } from 'react'
import { useCreateConversation } from '../api'
import { useStreamingChat } from '../hooks/useStreamingChat'

interface MessageInputProps {
  conversationId: number | null
  onMessageSent?: () => void
  onConversationCreated: (id: number) => void
  onStreamingStart?: () => void
  onStreamingChunk?: (chunk: string) => void
  onStreamingComplete?: () => void
  onUserMessage?: (message: string) => void
}

const MessageInput: React.FC<MessageInputProps> = ({
  conversationId,
  onMessageSent,
  onConversationCreated,
  onStreamingStart,
  onStreamingChunk, // TODO: Implement streaming functionality
  onStreamingComplete,
  onUserMessage,
}) => {
  const [message, setMessage] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createConversationMutation = useCreateConversation()
  const { sendStreamingMessage } = useStreamingChat()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || isStreaming) return

    const userMessage = message.trim()
    setError(null)
    setIsStreaming(true)
    onUserMessage?.(userMessage)
    onStreamingStart?.()

    const sendMessage = async (targetConversationId: number) => {
      await sendStreamingMessage(
        {
          message: userMessage,
          conversation_id: targetConversationId,
        },
        {
          onChunk: (chunk: string) => {
            onStreamingChunk?.(chunk)
          },
          onComplete: () => {
            setIsStreaming(false)
            setMessage('')
            onStreamingComplete?.()
            onMessageSent?.()
          },
          onError: (errorMessage: string) => {
            setIsStreaming(false)
            setError(errorMessage)
          },
          onConversationId: (conversationId: number) => {
            // Update the conversation ID if it was created during streaming
            if (!targetConversationId || targetConversationId !== conversationId) {
              onConversationCreated(conversationId)
            }
          }
        }
      )
    }

    if (!conversationId) {
      // Send message without conversation ID - backend will create one automatically
      await sendMessage(0) // Use 0 or null to indicate no conversation ID
    } else {
      // Send message to existing conversation
      await sendMessage(conversationId)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const isLoading = isStreaming || createConversationMutation.isPending
  const displayError = error || createConversationMutation.error?.message

  return (
    <div className="chat-input-container">
      {displayError && (
        <div className="margin-bottom-2">
          <div className="usa-alert usa-alert--error">
            <div className="usa-alert__heading">Error sending message</div>
            <div className="usa-alert__text">
              {displayError || 'Failed to send message. Please try again.'}
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="display-flex flex-gap-1">
        <div className="flex-fill">
          <textarea
            id="message-input"
            name="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message here... (Press Enter to send, Shift+Enter for new line)"
            rows={3}
            disabled={isLoading}
            required
            className="usa-textarea width-full"
          />
        </div>
        <div className="display-flex flex-align-end">
          <button
            type="submit"
            disabled={!message.trim() || isLoading}
            className="usa-button margin-left-1"
          >
{isStreaming ? 'Streaming...' : isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default MessageInput