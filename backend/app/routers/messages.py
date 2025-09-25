from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Message, Conversation
from app.schemas import MessageCreate, Message as MessageSchema

router = APIRouter(prefix="/conversations/{conversation_id}/messages", tags=["messages"])

@router.get("/", response_model=List[MessageSchema], operation_id="ListMessages")
def list_messages(
    conversation_id: int, 
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    messages = db.query(Message).filter(
        Message.conversation_id == conversation_id
    ).offset(skip).limit(limit).all()
    return messages

@router.post("/", response_model=MessageSchema, operation_id="CreateMessage")
def create_message(
    conversation_id: int,
    message: MessageCreate,
    db: Session = Depends(get_db)
):
    conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    db_message = Message(
        conversation_id=conversation_id,
        **message.model_dump()
    )
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message

@router.get("/{message_id}", response_model=MessageSchema, operation_id="GetMessage")
def get_message(
    conversation_id: int,
    message_id: int,
    db: Session = Depends(get_db)
):
    message = db.query(Message).filter(
        Message.id == message_id,
        Message.conversation_id == conversation_id
    ).first()
    
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    
    return message

@router.delete("/{message_id}", operation_id="DeleteMessage")
def delete_message(
    conversation_id: int,
    message_id: int,
    db: Session = Depends(get_db)
):
    message = db.query(Message).filter(
        Message.id == message_id,
        Message.conversation_id == conversation_id
    ).first()
    
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    
    db.delete(message)
    db.commit()
    return {"detail": "Message deleted successfully"}