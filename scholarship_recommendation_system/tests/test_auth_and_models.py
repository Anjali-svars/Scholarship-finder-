"""
Unit tests for Auth, Profile, and Scholarship Data Models.
Tests password hashing security, JSON serialization, and edge cases.
"""
import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from models import User, StudentProfile, ScholarshipItem, ApplicationTrackerItem

class TestAuthAndModels(unittest.TestCase):
    def test_password_hashing_security(self):
        raw_password = "SecurePassword2026!"
        hashed = User.hash_password(raw_password)
        
        # Verify hash is not equal to raw password
        self.assertNotEqual(raw_password, hashed)
        
        user = User(
            id="u1",
            email="student@univ.edu",
            password_hash=hashed,
            full_name="Aarav Sharma",
            role="student"
        )
        # Correct password verification
        self.assertTrue(user.check_password("SecurePassword2026!"))
        # Incorrect password verification
        self.assertFalse(user.check_password("WrongPassword!"))

    def test_student_profile_serialization(self):
        profile = StudentProfile(
            id="p1",
            user_id="u1",
            full_name="Priya Patel",
            state="Gujarat",
            education_level="Undergraduate",
            course="Medicine",
            institution="Government Medical College",
            marks=84.5,
            family_income=320000,
            category="OBC"
        )
        data = profile.to_dict()
        self.assertEqual(data['full_name'], "Priya Patel")
        self.assertEqual(data['marks'], 84.5)
        self.assertEqual(data['family_income'], 320000)
        self.assertEqual(data['category'], "OBC")

    def test_scholarship_item_defaults_and_validation(self):
        sch = ScholarshipItem(
            id="s1",
            name="STEM Innovation Fellowship",
            provider="National Science Council",
            description="Excellence in science and research",
            eligible_courses=["Pure Sciences", "Engineering"],
            education_level=["Undergraduate", "Postgraduate"],
            min_marks=75.0,
            max_family_income=600000,
            award_amount="₹60,000 / year",
            award_amount_val=60000
        )
        d = sch.to_dict()
        self.assertEqual(d['min_marks'], 75.0)
        self.assertEqual(d['max_family_income'], 600000)
        self.assertEqual(d['eligible_states'], ["All India"])
        self.assertEqual(d['is_sample'], False)

    def test_application_tracker_lifecycle(self):
        tracker = ApplicationTrackerItem(
            id="t1",
            user_id="u1",
            scholarship_id="s1",
            status="Interested"
        )
        self.assertEqual(tracker.status, "Interested")
        
        # Transition to Applied
        tracker.status = "Applied"
        tracker.application_ref = "APP-2026-7890"
        d = tracker.to_dict()
        self.assertEqual(d['status'], "Applied")
        self.assertEqual(d['application_ref'], "APP-2026-7890")

if __name__ == '__main__':
    unittest.main()
