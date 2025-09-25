import React from 'react'
import type { Message } from '../api/types'

interface MessageListProps {
  messages: Message[]
}

const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (messages.length === 0) {
    return (
      <div className="display-flex flex-align-center flex-justify-center height-full">
        <div className="text-center text-base-dark">
          <p>No messages yet. Start the conversation!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="message-list">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`message ${
            message.role === 'user' ? 'message-user' : 'message-assistant'
          }`}
        >
          <div className={`message-content ${message.role}`}>
            {message.content}
            <div
              className={`font-size-xs margin-top-1 ${
                message.role === 'user' ? 'text-white' : 'text-base-dark'
              }`}
              style={{ opacity: 0.7 }}
            >
              {formatTime(message.created_at)}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default MessageList