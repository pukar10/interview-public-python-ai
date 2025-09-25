import { useState } from 'react'
import ConversationSidebar from './components/ConversationSidebar'
import ChatArea from './components/ChatArea'

function App() {
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null)

  return (
    <div className="App">
      <header className="usa-header">
        <div className="usa-nav-container">
          <h1>Chat Interface</h1>
        </div>
      </header>

      <div className="chat-container">
        <ConversationSidebar
          selectedConversationId={selectedConversationId}
          onSelectConversation={setSelectedConversationId}
        />
        <ChatArea
          conversationId={selectedConversationId}
          onConversationCreated={setSelectedConversationId}
        />
      </div>
    </div>
  )
}

export default App
