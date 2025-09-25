import React, { useEffect, useRef, useState } from 'react'
import { useGetConversation } from '../api'
import MessageInput from './MessageInput'
import MessageList from './MessageList'

interface ChatAreaProps {
  conversationId: number | null
  onConversationCreated: (id: number) => void
}

const ChatArea: React.FC<ChatAreaProps> = ({ conversationId, onConversationCreated }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [streamingContent, setStreamingContent] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [pendingUserMessage, setPendingUserMessage] = useState<string | null>(null)

  const {
    data: conversation,
    isLoading,
    isError,
    error,
  } = useGetConversation(conversationId ?? 0, {
    query: {
      enabled: !!conversationId,
    },
  })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [conversation?.messages, streamingContent])

  const handleStreamingStart = () => {
    setIsStreaming(true)
    setStreamingContent('')
  }

  const handleStreamingChunk = (chunk: string) => {
    setStreamingContent(prev => prev + chunk)
  }

  const handleStreamingComplete = () => {
    setIsStreaming(false)
    setStreamingContent('')
    setPendingUserMessage(null)
  }

  const handleUserMessage = (message: string) => {
    setPendingUserMessage(message)
  }

  if (!conversationId && !pendingUserMessage) {
    return (
      <div className="chat-main">
        <div className="display-flex flex-align-center flex-justify-center height-full">
          <div className="text-center">
            <h2 className="margin-bottom-2">Welcome to Chat Interface</h2>
            <p className="text-base-dark">
              Select a conversation from the sidebar or start a new conversation to begin chatting.
            </p>
          </div>
        </div>
        <MessageInput
          conversationId={conversationId}
          onMessageSent={scrollToBottom}
          onConversationCreated={onConversationCreated}
          onStreamingStart={handleStreamingStart}
          onStreamingChunk={handleStreamingChunk}
          onStreamingComplete={handleStreamingComplete}
          onUserMessage={handleUserMessage}
        />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="chat-main">
        <div className="padding-2">
          <div className="usa-alert usa-alert--error">
            <div className="usa-alert__heading">Error loading conversation</div>
            <div className="usa-alert__text">
              {error?.message || 'Failed to load conversation'}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="chat-main">
      <div className="chat-messages">
        {isLoading && conversationId ? (
          <div className="display-flex flex-align-center flex-justify-center height-full">
            <span>Loading conversation...</span>
          </div>
        ) : (
          <>
            {conversation && <MessageList messages={conversation.messages || []} />}
            {pendingUserMessage && (
              <div className="message message-user">
                <div className="message-content user">
                  {pendingUserMessage}
                </div>
              </div>
            )}
            {isStreaming && streamingContent && (
              <div className="message message-assistant">
                <div className="message-content assistant">
                  {streamingContent}
                  <span className="streaming-cursor">|</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <MessageInput
        conversationId={conversationId}
        onMessageSent={scrollToBottom}
        onConversationCreated={onConversationCreated}
        onStreamingStart={handleStreamingStart}
        onStreamingChunk={handleStreamingChunk}
        onStreamingComplete={handleStreamingComplete}
        onUserMessage={handleUserMessage}
      />
    </div>
  )
}

export default ChatArea