"""
Unit tests for Scholarship Recommendation Engine.
Tests mandatory conditions, weighted scoring, missing info detection, and boundary conditions.
"""
import unittest
import sys
import os

# Add parent directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from recommendation_engine import ScholarshipRecommendationEngine

class TestRecommendationEngine(unittest.TestCase):
    def setUp(self):
        self.engine = ScholarshipRecommendationEngine()
        self.sample_scholarship = {
            "id": "test-sch-1",
            "name": "Merit Engineering Grant",
            "provider": "Tech Foundation",
            "eligible_courses": ["Engineering", "Computer Science"],
            "education_level": ["Undergraduate"],
            "min_marks": 75.0,
            "max_family_income": 500000,
            "eligible_states": ["All India"],
            "applicable_categories": ["General", "OBC", "SC", "ST", "EWS"],
            "gender_preference": "All",
            "disability_friendly": True
        }

    def test_fully_eligible_student(self):
        """Student meeting all criteria with high marks should be classified as Eligible."""
        profile = {
            "marks": 88.0,
            "family_income": 300000,
            "course": "Computer Science & Engineering",
            "education_level": "Undergraduate",
            "state": "Maharashtra",
            "category": "OBC",
            "gender": "Female"
        }
        res = self.engine.evaluate_scholarship(profile, self.sample_scholarship)
        self.assertEqual(res['eligibility_status'], 'Eligible')
        self.assertGreaterEqual(res['match_score'], 75.0)
        self.assertEqual(len(res['unmet_conditions']), 0)
        self.assertEqual(len(res['missing_info']), 0)

    def test_ineligible_due_to_marks(self):
        """Student with marks below threshold must be marked Ineligible."""
        profile = {
            "marks": 62.0, # Below 75.0 min_marks
            "family_income": 300000,
            "course": "Computer Science",
            "education_level": "Undergraduate",
            "state": "Karnataka",
            "category": "General",
            "gender": "Male"
        }
        res = self.engine.evaluate_scholarship(profile, self.sample_scholarship)
        self.assertEqual(res['eligibility_status'], 'Ineligible')
        self.assertTrue(any('marks' in cond.lower() for cond in res['unmet_conditions']))

    def test_ineligible_due_to_income(self):
        """Student exceeding family income limit must be marked Ineligible."""
        profile = {
            "marks": 90.0,
            "family_income": 850000, # Exceeds 500,000 max
            "course": "Engineering",
            "education_level": "Undergraduate",
            "state": "Delhi",
            "category": "General",
            "gender": "Male"
        }
        res = self.engine.evaluate_scholarship(profile, self.sample_scholarship)
        self.assertEqual(res['eligibility_status'], 'Ineligible')
        self.assertTrue(any('income' in cond.lower() for cond in res['unmet_conditions']))

    def test_potentially_eligible_missing_income(self):
        """When mandatory income is missing from profile, mark Potentially Eligible."""
        profile = {
            "marks": 85.0,
            "family_income": None, # Missing income
            "course": "Computer Science",
            "education_level": "Undergraduate",
            "state": "Tamil Nadu",
            "category": "General",
            "gender": "Female"
        }
        res = self.engine.evaluate_scholarship(profile, self.sample_scholarship)
        self.assertEqual(res['eligibility_status'], 'Potentially Eligible')
        self.assertIn("Annual Family Income", res['missing_info'])

    def test_state_specific_restriction(self):
        """Scholarship restricted to specific state should reject out-of-state students."""
        state_sch = self.sample_scholarship.copy()
        state_sch['eligible_states'] = ["Kerala"]
        
        profile = {
            "marks": 85.0,
            "family_income": 200000,
            "course": "Engineering",
            "education_level": "Undergraduate",
            "state": "Punjab", # Ineligible state
            "category": "General",
            "gender": "Male"
        }
        res = self.engine.evaluate_scholarship(profile, state_sch)
        self.assertEqual(res['eligibility_status'], 'Ineligible')
        self.assertTrue(any('state' in cond.lower() for cond in res['unmet_conditions']))

    def test_gender_restriction(self):
        """Scholarship restricted to female students should reject male applicants."""
        girl_sch = self.sample_scholarship.copy()
        girl_sch['gender_preference'] = "Female"

        profile = {
            "marks": 85.0,
            "family_income": 200000,
            "course": "Engineering",
            "education_level": "Undergraduate",
            "state": "Maharashtra",
            "category": "General",
            "gender": "Male"
        }
        res = self.engine.evaluate_scholarship(profile, girl_sch)
        self.assertEqual(res['eligibility_status'], 'Ineligible')
        self.assertTrue(any('female' in cond.lower() for cond in res['unmet_conditions']))

    def test_ranking_sort_order(self):
        """Ranking must prioritize Eligible over Potentially Eligible over Ineligible."""
        sch_list = [
            self.sample_scholarship,
            {**self.sample_scholarship, "id": "test-sch-2", "min_marks": 95.0}, # Student will be ineligible
            {**self.sample_scholarship, "id": "test-sch-3", "min_marks": 80.0} # Student eligible
        ]
        profile = {
            "marks": 85.0,
            "family_income": 250000,
            "course": "Computer Science",
            "education_level": "Undergraduate",
            "state": "Maharashtra",
            "category": "General",
            "gender": "Female"
        }
        ranked = self.engine.recommend_scholarships(profile, sch_list)
        self.assertEqual(len(ranked), 3)
        self.assertEqual(ranked[0]['eligibility_status'], 'Eligible')
        self.assertEqual(ranked[-1]['eligibility_status'], 'Ineligible')

if __name__ == '__main__':
    unittest.main()
