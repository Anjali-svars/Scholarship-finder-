"""
Configuration settings for the AI-Based Scholarship Recommendation System.
"""
import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'scholarship-secret-key-2026-prod-rnd')
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URL', f"sqlite:///{os.path.join(BASE_DIR, 'instance', 'scholarships.db')}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Recommendation Engine Default Weights (Sum = 1.0)
    WEIGHT_ACADEMIC = 0.30
    WEIGHT_INCOME = 0.25
    WEIGHT_COURSE = 0.20
    WEIGHT_STATE = 0.15
    WEIGHT_OTHER = 0.10

class TestConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    WTF_CSRF_ENABLED = False
