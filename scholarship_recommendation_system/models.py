"""
Database Models for AI-Based Scholarship Recommendation System.
Using SQLAlchemy ORM with SQLite backend.
"""

from datetime import datetime
import json
import hashlib
import secrets

try:
    from werkzeug.security import generate_password_hash, check_password_hash
    HAS_WERKZEUG = True
except ImportError:
    HAS_WERKZEUG = False

def secure_hash_password(password: str) -> str:
    if HAS_WERKZEUG:
        return generate_password_hash(password)
    salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000)
    return f"pbkdf2:sha256:100000${salt}${key.hex()}"

def verify_password_hash(stored_hash: str, password: str) -> bool:
    if HAS_WERKZEUG and not stored_hash.startswith("pbkdf2:sha256:100000$"):
        try:
            return check_password_hash(stored_hash, password)
        except Exception:
            pass
    if stored_hash.startswith("pbkdf2:sha256:100000$"):
        try:
            parts = stored_hash.split('$')
            salt = parts[1]
            original_key = parts[2]
            key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000)
            return secrets.compare_digest(key.hex(), original_key)
        except Exception:
            return False
    return False

# Try importing from flask_sqlalchemy, or define standalone if run outside Flask app context
try:
    from flask_sqlalchemy import SQLAlchemy
    db = SQLAlchemy()
except ImportError:
    db = None

class User:
    """User representation for authentication and role-based access control."""
    def __init__(self, id, email, password_hash, full_name, role='student', created_at=None):
        self.id = id
        self.email = email
        self.password_hash = password_hash
        self.full_name = full_name
        self.role = role
        self.created_at = created_at or datetime.utcnow().isoformat()

    @staticmethod
    def hash_password(password: str) -> str:
        return secure_hash_password(password)

    def check_password(self, password: str) -> bool:
        return verify_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'full_name': self.full_name,
            'role': self.role,
            'created_at': self.created_at
        }

class StudentProfile:
    """Student profile attributes utilized for recommendation scoring."""
    def __init__(self, id, user_id, full_name="", dob="", age=None, gender="All", state="",
                 education_level="", course="", institution="", marks=0.0,
                 family_income=0.0, category="General", disability_status=False,
                 achievements="", updated_at=None):
        self.id = id
        self.user_id = user_id
        self.full_name = full_name
        self.dob = dob
        self.age = age
        self.gender = gender
        self.state = state
        self.education_level = education_level
        self.course = course
        self.institution = institution
        self.marks = marks
        self.family_income = family_income
        self.category = category
        self.disability_status = disability_status
        self.achievements = achievements
        self.updated_at = updated_at or datetime.utcnow().isoformat()

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'full_name': self.full_name,
            'dob': self.dob,
            'age': self.age,
            'gender': self.gender,
            'state': self.state,
            'education_level': self.education_level,
            'course': self.course,
            'institution': self.institution,
            'marks': self.marks,
            'family_income': self.family_income,
            'category': self.category,
            'disability_status': self.disability_status,
            'achievements': self.achievements,
            'updated_at': self.updated_at
        }

class ScholarshipItem:
    """Structured scholarship entity with all eligibility criteria."""
    def __init__(self, id, name, provider, description, eligible_courses=None,
                 education_level=None, min_marks=0.0, max_family_income=None,
                 eligible_states=None, applicable_categories=None, gender_preference="All",
                 disability_friendly=True, award_amount="₹0", award_amount_val=0,
                 application_deadline="", required_documents=None, official_url="",
                 eligibility_conditions=None, is_sample=False, verification_status="Verified Official Scheme",
                 created_at=None):
        self.id = id
        self.name = name
        self.provider = provider
        self.description = description
        self.eligible_courses = eligible_courses or []
        self.education_level = education_level or []
        self.min_marks = float(min_marks)
        self.max_family_income = float(max_family_income) if max_family_income is not None else None
        self.eligible_states = eligible_states or ["All India"]
        self.applicable_categories = applicable_categories or ["All"]
        self.gender_preference = gender_preference
        self.disability_friendly = bool(disability_friendly)
        self.award_amount = award_amount
        self.award_amount_val = int(award_amount_val)
        self.application_deadline = application_deadline
        self.required_documents = required_documents or []
        self.official_url = official_url
        self.eligibility_conditions = eligibility_conditions or []
        self.is_sample = bool(is_sample)
        self.verification_status = verification_status
        self.created_at = created_at or datetime.utcnow().isoformat()

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'provider': self.provider,
            'description': self.description,
            'eligible_courses': self.eligible_courses,
            'education_level': self.education_level,
            'min_marks': self.min_marks,
            'max_family_income': self.max_family_income,
            'eligible_states': self.eligible_states,
            'applicable_categories': self.applicable_categories,
            'gender_preference': self.gender_preference,
            'disability_friendly': self.disability_friendly,
            'award_amount': self.award_amount,
            'award_amount_val': self.award_amount_val,
            'application_deadline': self.application_deadline,
            'required_documents': self.required_documents,
            'official_url': self.official_url,
            'eligibility_conditions': self.eligibility_conditions,
            'is_sample': self.is_sample,
            'verification_status': self.verification_status,
            'created_at': self.created_at
        }

class ApplicationTrackerItem:
    """Student application status pipeline item."""
    def __init__(self, id, user_id, scholarship_id, status='Interested', notes='', application_ref='', applied_date='', updated_at=None):
        self.id = id
        self.user_id = user_id
        self.scholarship_id = scholarship_id
        self.status = status # 'Interested', 'Preparing Documents', 'Applied', 'Result Awaited', 'Awarded', 'Not Awarded'
        self.notes = notes
        self.application_ref = application_ref
        self.applied_date = applied_date
        self.updated_at = updated_at or datetime.utcnow().isoformat()

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'scholarship_id': self.scholarship_id,
            'status': self.status,
            'notes': self.notes,
            'application_ref': self.application_ref,
            'applied_date': self.applied_date,
            'updated_at': self.updated_at
        }
