import os
from pathlib import Path
from datetime import datetime
from typing import List
from sqlalchemy import create_engine, Column, Integer, Text, DateTime, func, ForeignKey
from sqlalchemy.orm import sessionmaker, Session, relationship
from .repo_db import Base  


class ChatHistory(Base):
    __tablename__ = "chat_history"
    id = Column(Integer, primary_key=True, autoincrement=True)
    repo_id = Column(Integer, ForeignKey("repositories.id"), nullable=False)
    query = Column(Text, nullable=False)
    response = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=func.now())
    repository = relationship("Repository", back_populates="chat_history")


class ChatHistoryManager:
    def __init__(self, db_path: str = "./data/repositories.db"):
        db_dir = Path(db_path).parent
        os.makedirs(db_dir, exist_ok=True)
        self.engine = create_engine(f"sqlite:///{db_path}", echo=False)
        self.SessionLocal = sessionmaker(
            autocommit=False, autoflush=False, bind=self.engine
        )

    def get_session(self) -> Session:
        return self.SessionLocal()

    def add_chat_message(self, repo_id: int, query: str, response: str):
        """Adds a new chat message to the history."""
        with self.get_session() as session:
            try:
                new_message = ChatHistory(
                    repo_id=repo_id, query=query, response=response
                )
                session.add(new_message)
                session.commit()
            except Exception as e:
                session.rollback()
                raise e

    def get_chat_history(self, repo_id: int) -> List[ChatHistory]:
        """Retrieves all chat messages for a given repository."""
        with self.get_session() as session:
            history = (
                session.query(ChatHistory)
                .filter(ChatHistory.repo_id == repo_id)
                .order_by(ChatHistory.timestamp.asc())
                .all()
            )
            return history