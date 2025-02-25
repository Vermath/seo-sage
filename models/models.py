from sqlalchemy import Column, Integer, String, Float, DateTime, Text, JSON, ForeignKey, Boolean, Table
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from datetime import datetime

Base = declarative_base()

class User(Base):
    """User model for authentication and account management"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True)
    uuid = Column(String, unique=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    first_name = Column(String)
    last_name = Column(String)
    company_name = Column(String)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    subscription_tier = Column(String, default="free")
    
    websites = relationship("Website", back_populates="user")
    
    def __repr__(self):
        return f"User(id={self.id}, email={self.email})"

class Website(Base):
    """Website model for tracking websites added by users"""
    __tablename__ = "websites"
    
    id = Column(Integer, primary_key=True)
    uuid = Column(String, unique=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(Integer, ForeignKey("users.id"))
    url = Column(String, nullable=False)
    name = Column(String)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    last_crawled_at = Column(DateTime)
    crawl_frequency = Column(String, default="weekly")
    status = Column(String, default="active")
    
    user = relationship("User", back_populates="websites")
    pages = relationship("Page", back_populates="website")
    competitors = relationship("Competitor", back_populates="website")
    topic_analyses = relationship("TopicAnalysis", back_populates="website")
    
    def __repr__(self):
        return f"Website(id={self.id}, url={self.url})"

class Page(Base):
    """Page model for storing crawled pages and their analysis"""
    __tablename__ = "pages"
    
    id = Column(Integer, primary_key=True)
    uuid = Column(String, unique=True, default=lambda: str(uuid.uuid4()))
    website_id = Column(Integer, ForeignKey("websites.id"))
    url = Column(String, nullable=False)
    title = Column(String)
    meta_description = Column(Text)
    meta_keywords = Column(Text)
    h1 = Column(JSON)  # Array of H1 headings
    h2 = Column(JSON)  # Array of H2 headings
    content = Column(Text)
    html = Column(Text)
    word_count = Column(Integer)
    status_code = Column(Integer)
    found_at = Column(DateTime, default=func.now())
    last_crawled_at = Column(DateTime, default=func.now())
    load_time_ms = Column(Integer)
    internal_links = Column(JSON)  # Array of internal links
    external_links = Column(JSON)  # Array of external links
    images = Column(JSON)  # Array of image objects
    is_indexed = Column(Boolean, default=True)
    schema_markup = Column(JSON)  # Schema.org markup found on the page
    
    website = relationship("Website", back_populates="pages")
    content_analyses = relationship("ContentAnalysis", back_populates="page")
    
    def __repr__(self):
        return f"Page(id={self.id}, url={self.url})"

class ContentAnalysis(Base):
    """Content analysis model for storing EEAT evaluations"""
    __tablename__ = "content_analyses"
    
    id = Column(Integer, primary_key=True)
    uuid = Column(String, unique=True, default=lambda: str(uuid.uuid4()))
    page_id = Column(Integer, ForeignKey("pages.id"))
    created_at = Column(DateTime, default=func.now())
    
    # EEAT scores
    experience_score = Column(Float)
    expertise_score = Column(Float)
    authoritativeness_score = Column(Float)
    trustworthiness_score = Column(Float)
    overall_score = Column(Float)
    grade = Column(String)
    
    # Analysis details
    category_assessments = Column(JSON)  # Dict of category assessments
    recommendations = Column(JSON)  # Array of recommendations
    improvement_opportunities = Column(JSON)  # Array of improvement opportunities
    raw_analysis = Column(Text)  # Raw analysis from AI
    
    page = relationship("Page", back_populates="content_analyses")
    
    def __repr__(self):
        return f"ContentAnalysis(id={self.id}, page_id={self.page_id}, score={self.overall_score})"

class Competitor(Base):
    """Competitor model for storing competitor websites and their analysis"""
    __tablename__ = "competitors"
    
    id = Column(Integer, primary_key=True)
    uuid = Column(String, unique=True, default=lambda: str(uuid.uuid4()))
    website_id = Column(Integer, ForeignKey("websites.id"))
    url = Column(String, nullable=False)
    name = Column(String)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    last_crawled_at = Column(DateTime)
    
    website = relationship("Website", back_populates="competitors")
    competitor_pages = relationship("CompetitorPage", back_populates="competitor")
    
    def __repr__(self):
        return f"Competitor(id={self.id}, url={self.url})"

class CompetitorPage(Base):
    """Competitor page model for storing crawled competitor pages"""
    __tablename__ = "competitor_pages"
    
    id = Column(Integer, primary_key=True)
    uuid = Column(String, unique=True, default=lambda: str(uuid.uuid4()))
    competitor_id = Column(Integer, ForeignKey("competitors.id"))
    url = Column(String, nullable=False)
    title = Column(String)
    meta_description = Column(Text)
    meta_keywords = Column(Text)
    h1 = Column(JSON)  # Array of H1 headings
    h2 = Column(JSON)  # Array of H2 headings
    content = Column(Text)
    html = Column(Text)
    word_count = Column(Integer)
    status_code = Column(Integer)
    found_at = Column(DateTime, default=func.now())
    last_crawled_at = Column(DateTime, default=func.now())
    
    competitor = relationship("Competitor", back_populates="competitor_pages")
    
    def __repr__(self):
        return f"CompetitorPage(id={self.id}, url={self.url})"

class TopicAnalysis(Base):
    """Topic analysis model for storing topic analyses"""
    __tablename__ = "topic_analyses"
    
    id = Column(Integer, primary_key=True)
    uuid = Column(String, unique=True, default=lambda: str(uuid.uuid4()))
    website_id = Column(Integer, ForeignKey("websites.id"))
    created_at = Column(DateTime, default=func.now())
    analysis_date = Column(DateTime, default=func.now())
    
    # Analysis data
    topic_clusters = Column(JSON)  # Array of topic clusters
    topic_gaps = Column(JSON)  # Array of topic gaps
    intent_gaps = Column(JSON)  # Array of intent gaps
    recommendations = Column(JSON)  # Array of recommendations
    raw_analysis = Column(Text)  # Raw analysis data
    
    website = relationship("Website", back_populates="topic_analyses")
    
    def __repr__(self):
        return f"TopicAnalysis(id={self.id}, website_id={self.website_id})"

class KeywordRanking(Base):
    """Keyword ranking model for storing SERP positions"""
    __tablename__ = "keyword_rankings"
    
    id = Column(Integer, primary_key=True)
    uuid = Column(String, unique=True, default=lambda: str(uuid.uuid4()))
    website_id = Column(Integer, ForeignKey("websites.id"))
    keyword = Column(String, nullable=False)
    position = Column(Integer)
    previous_position = Column(Integer)
    url = Column(String)  # URL ranking for this keyword
    search_volume = Column(Integer)
    competition = Column(Float)
    check_date = Column(DateTime, default=func.now())
    
    def __repr__(self):
        return f"KeywordRanking(id={self.id}, keyword={self.keyword}, position={self.position})"

class ContentBrief(Base):
    """Content brief model for storing AI-generated content briefs"""
    __tablename__ = "content_briefs"
    
    id = Column(Integer, primary_key=True)
    uuid = Column(String, unique=True, default=lambda: str(uuid.uuid4()))
    website_id = Column(Integer, ForeignKey("websites.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    topic = Column(String, nullable=False)
    status = Column(String, default="draft")
    
    # Brief content
    target_audience = Column(JSON)  # Array of target audience details
    key_topics = Column(JSON)  # Array of key topics to cover
    outline = Column(JSON)  # Suggested content outline
    keywords = Column(JSON)  # Primary and secondary keywords
    competitors = Column(JSON)  # Competitor content analysis
    user_intents = Column(JSON)  # User intents to address
    eeat_recommendations = Column(JSON)  # EEAT recommendations
    content_length = Column(Integer)  # Recommended content length
    
    def __repr__(self):
        return f"ContentBrief(id={self.id}, topic={self.topic})"

class UserActivity(Base):
    """User activity model for tracking usage and actions"""
    __tablename__ = "user_activities"
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    action = Column(String, nullable=False)
    resource_type = Column(String)  # e.g., "website", "page", "analysis"
    resource_id = Column(Integer)
    created_at = Column(DateTime, default=func.now())
    ip_address = Column(String)
    user_agent = Column(String)
    
    def __repr__(self):
        return f"UserActivity(id={self.id}, user_id={self.user_id}, action={self.action})"