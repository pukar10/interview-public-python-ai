from langchain_ollama import ChatOllama
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from sqlalchemy.orm import Session
from app.models import Conversation, Message, MessageRole
from app.config import OLLAMA_MODEL, OLLAMA_BASE_URL
from typing import Optional, AsyncGenerator
import json
import asyncio

class ChatService:
    def __init__(self):
        self.llm = ChatOllama(
            model=OLLAMA_MODEL,
            base_url=OLLAMA_BASE_URL,
            temperature=0.7
        )
    
    def get_or_create_conversation(self, db: Session, conversation_id: Optional[int] = None) -> Conversation:
        if conversation_id:
            conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
            if conversation:
                return conversation
        
        conversation = Conversation(title="New Conversation")
        db.add(conversation)
        db.commit()
        db.refresh(conversation)
        return conversation
    
    def get_conversation_history(self, db: Session, conversation_id: int):
        messages = db.query(Message).filter(
            Message.conversation_id == conversation_id
        ).order_by(Message.created_at).all()
        
        langchain_messages = []
        for msg in messages:
            if msg.role == MessageRole.USER:
                langchain_messages.append(HumanMessage(content=msg.content))
            elif msg.role == MessageRole.ASSISTANT:
                langchain_messages.append(AIMessage(content=msg.content))
            elif msg.role == MessageRole.SYSTEM:
                langchain_messages.append(SystemMessage(content=msg.content))
        
        return langchain_messages
    
    async def process_chat_stream(self, db: Session, user_message: str, conversation_id: Optional[int] = None) -> AsyncGenerator[str, None]:
        try:
            conversation = self.get_or_create_conversation(db, conversation_id)

            user_msg = Message(
                conversation_id=conversation.id,
                role=MessageRole.USER,
                content=user_message
            )
            db.add(user_msg)
            db.commit()
            db.refresh(user_msg)

            yield f"data: {json.dumps({'type': 'conversation_id', 'data': conversation.id})}\n\n"
            yield f"data: {json.dumps({'type': 'user_message', 'data': user_message})}\n\n"

            history = self.get_conversation_history(db, conversation.id)

            try:
                assistant_content = ""
                async for chunk in self.llm.astream(history):
                    if chunk.content:
                        assistant_content += chunk.content
                        yield f"data: {json.dumps({'type': 'assistant_chunk', 'data': chunk.content})}\n\n"
            except Exception as e:
                assistant_content = f"Echo: {user_message}\n\n(Note: Unable to connect to Ollama. Make sure Ollama is running with the model '{OLLAMA_MODEL}' available. Error: {str(e)})"
                for word in assistant_content.split():
                    yield f"data: {json.dumps({'type': 'assistant_chunk', 'data': word + ' '})}\n\n"
                    await asyncio.sleep(0.1)  # Simulate streaming delay

            assistant_msg = Message(
                conversation_id=conversation.id,
                role=MessageRole.ASSISTANT,
                content=assistant_content
            )
            db.add(assistant_msg)
            db.commit()
            db.refresh(assistant_msg)

            if conversation.title == "New Conversation" and len(user_message) > 0:
                conversation.title = user_message[:50] + "..." if len(user_message) > 50 else user_message
                db.commit()
                db.refresh(conversation)

            yield f"data: {json.dumps({'type': 'complete', 'data': assistant_msg.id})}\n\n"

        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'data': str(e)})}\n\n"

chat_service = ChatService()