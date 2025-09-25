import React from 'react'
import { useListConversations, useCreateConversation } from '../api'
import type { Conversation } from '../api'

interface ConversationSidebarProps {
  selectedConversationId: number | null
  onSelectConversation: (id: number | null) => void
}

const ConversationSidebar: React.FC<ConversationSidebarProps> = ({
  selectedConversationId,
  onSelectConversation,
}) => {
  const {
    data: conversations,
    isLoading,
    isError,
    error,
  } = useListConversations()

  const createConversationMutation = useCreateConversation()

  const handleNewConversation = () => {
    createConversationMutation.mutate(
      {
        data: {
          title: 'New Conversation',
        },
      },
      {
        onSuccess: (data) => {
          onSelectConversation(data.id)
        },
      }
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) {
      return 'Today'
    } else if (diffDays === 2) {
      return 'Yesterday'
    } else if (diffDays <= 7) {
      return `${diffDays - 1} days ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  if (isError) {
    return (
      <div className="chat-sidebar">
        <div className="padding-2">
          <div className="usa-alert usa-alert--error">
            <div className="usa-alert__heading">Error loading conversations</div>
            <div className="usa-alert__text">
              {error?.message || 'Failed to load conversations'}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="chat-sidebar">
      <div className="padding-2">
        <button
          type="button"
          onClick={handleNewConversation}
          disabled={createConversationMutation.isPending}
          className="usa-button width-full margin-bottom-2"
        >
          {createConversationMutation.isPending ? 'Creating...' : 'New Conversation'}
        </button>
      </div>

      <div className="padding-x-2">
        <h3 className="margin-y-1 font-size-sm text-bold text-uppercase">
          Recent Conversations
        </h3>
      </div>

      <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
        {isLoading ? (
          <div className="padding-2 text-center">
            <span>Loading conversations...</span>
          </div>
        ) : conversations && conversations.length > 0 ? (
          conversations.map((conversation: Conversation) => (
            <div
              key={conversation.id}
              className={`conversation-item ${
                selectedConversationId === conversation.id ? 'active' : ''
              }`}
              onClick={() => onSelectConversation(conversation.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  onSelectConversation(conversation.id)
                }
              }}
            >
              <div className="font-size-sm text-bold">
                {conversation.title || 'Untitled Conversation'}
              </div>
              <div className="font-size-xs text-base-dark margin-top-05">
                {formatDate(conversation.updated_at)}
              </div>
            </div>
          ))
        ) : (
          <div className="padding-2 text-center text-base-dark">
            <span>No conversations yet</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default ConversationSidebar