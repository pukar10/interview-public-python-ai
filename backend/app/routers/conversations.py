from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List
from app.database import get_db
from app.models import Conversation, Message
from app.schemas import (
    ConversationCreate, 
    ConversationUpdate,
    Conversation as ConversationSchema,
    ConversationWithMessages
)

router = APIRouter(prefix="/conversations", tags=["conversations"])

@router.get("/", response_model=List[ConversationSchema], operation_id="ListConversations")
def list_conversations(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    conversations = db.query(Conversation).order_by(desc(Conversation.created_at)).offset(skip).limit(limit).all()
    return conversations

@router.post("/", response_model=ConversationSchema, operation_id="CreateConversation")
def create_conversation(conversation: ConversationCreate, db: Session = Depends(get_db)):
    db_conversation = Conversation(**conversation.model_dump())
    db.add(db_conversation)
    db.commit()
    db.refresh(db_conversation)
    return db_conversation

@router.get("/{conversation_id}", response_model=ConversationWithMessages, operation_id="GetConversation")
def get_conversation(conversation_id: int, db: Session = Depends(get_db)):
    conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conversation

@router.put("/{conversation_id}", response_model=ConversationSchema, operation_id="UpdateConversation")
def update_conversation(
    conversation_id: int, 
    conversation_update: ConversationUpdate, 
    db: Session = Depends(get_db)
):
    conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    update_data = conversation_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(conversation, field, value)
    
    db.commit()
    db.refresh(conversation)
    return conversation

@router.delete("/{conversation_id}", operation_id="DeleteConversation")
def delete_conversation(conversation_id: int, db: Session = Depends(get_db)):
    conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    db.delete(conversation)
    db.commit()
    return {"detail": "Conversation deleted successfully"}