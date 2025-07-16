import os
from pathlib import Path
from datetime import datetime
from typing import List, Optional, Tuple, Dict, Any
from sqlalchemy.orm import sessionmaker, Session, relationship
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import create_engine, Column, Integer, String, DateTime, func, Text

Base = declarative_base()


class Repository(Base):
    __tablename__ = "repositories"

    id = Column(Integer, primary_key=True, autoincrement=True)
    repo_url = Column(String, unique=True, nullable=False)
    collection_name = Column(String, nullable=False)
    created_at = Column(DateTime, default=func.now())
    last_updated = Column(DateTime, default=func.now(), onupdate=func.now())
    podcast_script = Column(Text, nullable=True)
    diagram_script = Column(Text, nullable=True)
    name = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    stars = Column(Integer, nullable=True)
    forks = Column(Integer, nullable=True)
    issues = Column(Integer, nullable=True)
    license = Column(String, nullable=True)
    owner = Column(String, nullable=True)
    last_activity: Optional[List[Dict[str, Any]]] = None
    chat_history = relationship(
        "ChatHistory", back_populates="repository", cascade="all, delete-orphan"
    )


class RepositoryDataManager:
    def __init__(self, db_path: str = "./data/repositories.db"):
        db_dir = Path(db_path).parent
        os.makedirs(db_dir, exist_ok=True)
        self.db_path = db_path
        self.engine = create_engine(f"sqlite:///{db_path}", echo=False)
        self.SessionLocal = sessionmaker(
            autocommit=False, autoflush=False, bind=self.engine
        )
        self.init_database()

    def init_database(self):
        from .chat_db import ChatHistory

        Base.metadata.create_all(bind=self.engine)

    def get_session(self) -> Session:
        return self.SessionLocal()

    def add_repository(self, repo_url: str) -> int:
        with self.get_session() as session:
            try:
                # Check if repository already exists
                existing_repo = (
                    session.query(Repository)
                    .filter(Repository.repo_url == repo_url)
                    .first()
                )

                if existing_repo:
                    return existing_repo.id

                # Create new repository entry
                collection_name = f"repo_{hash(repo_url) % 100}"
                new_repo = Repository(
                    repo_url=repo_url, collection_name=collection_name
                )

                session.add(new_repo)
                session.commit()
                session.refresh(new_repo)

                return new_repo.id

            except Exception as e:
                session.rollback()
                raise e

    def get_repository(self, repo_id: int) -> Optional[Tuple[str, str]]:
        with self.get_session() as session:
            repo = session.query(Repository).filter(Repository.id == repo_id).first()
            if repo:
                return (repo.repo_url, repo.collection_name)
            return None

    def get_full_repository_by_id(self, repo_id: int) -> Optional[Repository]:
        """
        Get the full Repository object by its ID, including all columns.
        """
        with self.get_session() as session:
            repo = session.query(Repository).filter(Repository.id == repo_id).first()
            return repo

    def get_repository_by_url(self, repo_url: str) -> Optional[Tuple[int, str]]:
        with self.get_session() as session:
            repo = (
                session.query(Repository)
                .filter(Repository.repo_url == repo_url)
                .first()
            )
            if repo:
                return (repo.id, repo.collection_name)
            return None

    def list_repositories(self) -> List[Tuple[int, str, str, datetime]]:
        """
        Get all repositories stored in DB
        """
        with self.get_session() as session:
            repos = session.query(Repository).all()
            return [
                (repo.id, repo.repo_url, repo.collection_name, repo.created_at)
                for repo in repos
            ]

    def update_repository_timestamp(self, repo_id: int):
        with self.get_session() as session:
            try:
                repo = (
                    session.query(Repository).filter(Repository.id == repo_id).first()
                )
                if repo:
                    repo.last_updated = func.now()
                    session.commit()
            except Exception as e:
                session.rollback()
                raise e

    def update_podcast_script(self, repo_id: int, script: str):
        with self.get_session() as session:
            try:
                repo = (
                    session.query(Repository).filter(Repository.id == repo_id).first()
                )
                if repo:
                    repo.podcast_script = script
                    session.commit()
            except Exception as e:
                session.rollback()
                raise e

    def update_diagram_script(self, repo_id: int, script: str):
        with self.get_session() as session:
            try:
                repo = (
                    session.query(Repository).filter(Repository.id == repo_id).first()
                )
                if repo:
                    repo.diagram_script = script
                    session.commit()
            except Exception as e:
                session.rollback()
                raise e

    def update_repository_metadata(self, repo_id: int, metadata: dict):
        with self.get_session() as session:
            try:
                repo = (
                    session.query(Repository).filter(Repository.id == repo_id).first()
                )
                if repo:
                    for key, value in metadata.items():
                        if hasattr(repo, key):
                            setattr(repo, key, value)
                    session.commit()
            except Exception as e:
                session.rollback()
                raise e

    def delete_repository(self, repo_id: int) -> bool:
        with self.get_session() as session:
            try:
                repo = (
                    session.query(Repository).filter(Repository.id == repo_id).first()
                )
                if repo:
                    session.delete(repo)
                    session.commit()
                    return True
                return False
            except Exception as e:
                session.rollback()
                raise e
