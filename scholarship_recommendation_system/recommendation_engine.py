"""
AI-Based Scholarship Recommendation Engine.
Implements multi-stage eligibility evaluation:
  Stage 1: Mandatory Eligibility Condition Checks
  Stage 2: Weighted Multi-Factor Scoring (Configurable weights: 30% Academic, 25% Income, 20% Course/Level, 15% State, 10% Other)
  Stage 3: Categorization into Eligible, Potentially Eligible, and Ineligible
  Stage 4: Transparent Explanations & Missing Information Identification
"""

from typing import Dict, List, Any, Tuple

DEFAULT_WEIGHTS = {
    'academic': 0.30,
    'income': 0.25,
    'course': 0.20,
    'state': 0.15,
    'other': 0.10
}

class ScholarshipRecommendationEngine:
    def __init__(self, weights: Dict[str, float] = None):
        self.weights = weights or DEFAULT_WEIGHTS.copy()
        # Normalize weights to ensure sum is 1.0
        total = sum(self.weights.values())
        if total > 0:
            self.weights = {k: v / total for k, v in self.weights.items()}

    def evaluate_scholarship(self, student_profile: Dict[str, Any], scholarship: Dict[str, Any]) -> Dict[str, Any]:
        """
        Evaluate single scholarship against student profile.
        Returns a detailed evaluation object with score, status, breakdown, and explanations.
        """
        missing_info: List[str] = []
        unmet_conditions: List[str] = []
        reasons: List[str] = []
        component_scores = {
            'academic': 0.0,
            'income': 0.0,
            'course': 0.0,
            'state': 0.0,
            'other': 0.0
        }

        # ----------------------------------------------------
        # 1. ACADEMIC EVALUATION (Weight: 30%)
        # ----------------------------------------------------
        min_marks = float(scholarship.get('min_marks', 0.0))
        student_marks = student_profile.get('marks')
        
        if student_marks is None:
            missing_info.append("Academic Marks/Percentage")
            reasons.append("Marks not provided in profile; potential eligibility depends on meeting min requirement.")
            # Partial score if unknown
            component_scores['academic'] = 50.0
        else:
            student_marks = float(student_marks)
            if student_marks < min_marks:
                unmet_conditions.append(f"Academic marks ({student_marks:.1f}%) is below minimum required ({min_marks:.1f}%)")
                reasons.append(f"Requires minimum {min_marks:.1f}% marks; current profile shows {student_marks:.1f}%.")
                component_scores['academic'] = max(0.0, (student_marks / min_marks) * 50.0)
            else:
                # Full base score, plus bonus for exceeding threshold up to 100
                surplus = min(15.0, student_marks - min_marks)
                academic_score = 85.0 + (surplus / 15.0) * 15.0
                component_scores['academic'] = min(100.0, academic_score)
                reasons.append(f"Academic criteria met ({student_marks:.1f}% >= {min_marks:.1f}%).")

        # ----------------------------------------------------
        # 2. FAMILY INCOME EVALUATION (Weight: 25%)
        # ----------------------------------------------------
        max_income = scholarship.get('max_family_income')
        student_income = student_profile.get('family_income')

        if max_income is None or max_income <= 0:
            # Merit only, no income ceiling
            component_scores['income'] = 100.0
            reasons.append("Open to all income brackets (pure merit/diversity scheme).")
        elif student_income is None:
            missing_info.append("Annual Family Income")
            reasons.append(f"Income cap is ₹{max_income:,.0f}; student income not specified in profile.")
            component_scores['income'] = 50.0
        else:
            student_income = float(student_income)
            if student_income > max_income:
                unmet_conditions.append(f"Annual family income (₹{student_income:,.0f}) exceeds ceiling (₹{max_income:,.0f})")
                reasons.append(f"Income exceeds limit of ₹{max_income:,.0f}.")
                component_scores['income'] = 0.0
            else:
                # Lower income gets higher need-based score
                ratio = student_income / max_income
                # Invert ratio: if income is 10% of max, score is ~95. If 90%, score is ~75.
                income_score = 70.0 + (1.0 - ratio) * 30.0
                component_scores['income'] = min(100.0, max(60.0, income_score))
                reasons.append(f"Income criteria met (₹{student_income:,.0f} within ₹{max_income:,.0f} limit).")

        # ----------------------------------------------------
        # 3. COURSE & EDUCATION LEVEL EVALUATION (Weight: 20%)
        # ----------------------------------------------------
        eligible_courses = scholarship.get('eligible_courses', [])
        eligible_levels = scholarship.get('education_level', [])
        student_course = (student_profile.get('course') or '').strip().lower()
        student_level = (student_profile.get('education_level') or '').strip().lower()

        course_match = False
        level_match = False

        if not student_course:
            missing_info.append("Course / Degree Major")
        else:
            if not eligible_courses or any(c.lower() in ['all', 'any'] for c in eligible_courses):
                course_match = True
            else:
                course_match = any(
                    c.lower() in student_course or student_course in c.lower()
                    for c in eligible_courses
                )

        if not student_level:
            missing_info.append("Education Level")
        else:
            if not eligible_levels or any(l.lower() in ['all', 'any'] for l in eligible_levels):
                level_match = True
            else:
                level_match = any(
                    l.lower() in student_level or student_level in l.lower()
                    for l in eligible_levels
                )

        if not student_course and not student_level:
            component_scores['course'] = 40.0
        elif not course_match and student_course:
            unmet_conditions.append(f"Course '{student_profile.get('course')}' is not among eligible programs: {', '.join(eligible_courses)}")
            component_scores['course'] = 20.0
        elif not level_match and student_level:
            unmet_conditions.append(f"Education level '{student_profile.get('education_level')}' not eligible: {', '.join(eligible_levels)}")
            component_scores['course'] = 30.0
        else:
            component_scores['course'] = 100.0
            reasons.append("Course stream and education level align with scholarship requirements.")

        # ----------------------------------------------------
        # 4. STATE & RESIDENCY EVALUATION (Weight: 15%)
        # ----------------------------------------------------
        eligible_states = scholarship.get('eligible_states', [])
        student_state = (student_profile.get('state') or '').strip()

        if not student_state:
            missing_info.append("State of Domicile")
            component_scores['state'] = 50.0
        elif not eligible_states or any(s.lower() in ['all india', 'all', 'any', 'pan-india'] for s in eligible_states):
            component_scores['state'] = 100.0
            reasons.append("All-India eligibility; residency criteria satisfied.")
        else:
            state_match = any(s.lower() == student_state.lower() for s in eligible_states)
            if state_match:
                component_scores['state'] = 100.0
                reasons.append(f"Residency criteria met for state '{student_state}'.")
            else:
                unmet_conditions.append(f"Student state '{student_state}' is not among eligible states: {', '.join(eligible_states)}")
                component_scores['state'] = 0.0

        # ----------------------------------------------------
        # 5. OTHER CRITERIA: GENDER, CATEGORY, DISABILITY (Weight: 10%)
        # ----------------------------------------------------
        other_score = 75.0 # baseline
        
        # Gender
        gender_pref = scholarship.get('gender_preference', 'All')
        student_gender = (student_profile.get('gender') or '').strip().lower()
        if gender_pref.lower() not in ['all', 'any']:
            if student_gender:
                if student_gender == gender_pref.lower() or (gender_pref.lower() == 'female' and student_gender in ['female', 'girl', 'woman']):
                    other_score += 15.0
                    reasons.append(f"Targeted gender criteria met ({gender_pref}).")
                else:
                    unmet_conditions.append(f"Scholarship specifically reserved for {gender_pref} applicants.")
                    other_score = 0.0
            else:
                missing_info.append("Gender")

        # Category
        applicable_categories = scholarship.get('applicable_categories', [])
        student_cat = (student_profile.get('category') or '').strip().lower()
        if applicable_categories and not any(c.lower() in ['all', 'any'] for c in applicable_categories):
            if student_cat:
                if any(c.lower() == student_cat for c in applicable_categories):
                    other_score += 10.0
                    reasons.append(f"Reservation category criteria matched ({student_profile.get('category')}).")
                else:
                    unmet_conditions.append(f"Category '{student_profile.get('category')}' is not among applicable categories: {', '.join(applicable_categories)}")
                    other_score = 0.0
            else:
                missing_info.append("Social Category (General/OBC/SC/ST/EWS)")

        # Disability
        if scholarship.get('disability_friendly') or 'disabilit' in scholarship.get('name', '').lower():
            if student_profile.get('disability_status') in [True, 'Yes', 'yes', 'true']:
                other_score += 15.0
                reasons.append("Disability inclusion priority applied.")

        component_scores['other'] = min(100.0, max(0.0, other_score))

        # ----------------------------------------------------
        # CALCULATE WEIGHTED MATCH SCORE
        # ----------------------------------------------------
        total_score = (
            component_scores['academic'] * self.weights['academic'] +
            component_scores['income'] * self.weights['income'] +
            component_scores['course'] * self.weights['course'] +
            component_scores['state'] * self.weights['state'] +
            component_scores['other'] * self.weights['other']
        )
        total_score = round(total_score, 1)

        # ----------------------------------------------------
        # DETERMINE ELIGIBILITY CLASSIFICATION
        # ----------------------------------------------------
        # Rules:
        # - Ineligible: Any mandatory condition is explicitly unmet (e.g. marks strictly too low, income strictly too high, state disqualified, category restricted).
        # - Potentially Eligible: No unmet mandatory conditions, BUT has missing critical profile fields or borderline score (score between 50 and 70).
        # - Eligible: All mandatory conditions strictly satisfied, no critical missing info, score >= 65.
        if len(unmet_conditions) > 0:
            status = 'Ineligible'
            badge_color = 'red'
        elif len(missing_info) > 0:
            status = 'Potentially Eligible'
            badge_color = 'amber'
            reasons.append(f"Potentially eligible pending completion of: {', '.join(missing_info)}.")
        elif total_score >= 65.0:
            status = 'Eligible'
            badge_color = 'green'
            reasons.insert(0, "All mandatory eligibility criteria are fully satisfied.")
        else:
            status = 'Potentially Eligible'
            badge_color = 'amber'
            reasons.append("Meets minimum conditions but relative match index is moderate.")

        return {
            'scholarship_id': scholarship.get('id'),
            'scholarship': scholarship,
            'match_score': total_score,
            'eligibility_status': status,
            'badge_color': badge_color,
            'component_scores': {k: round(v, 1) for k, v in component_scores.items()},
            'weights_used': self.weights,
            'missing_info': missing_info,
            'unmet_conditions': unmet_conditions,
            'reasons': reasons
        }

    def recommend_scholarships(self, student_profile: Dict[str, Any], scholarships: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Rank scholarships for a given student profile from highest to lowest match.
        Sort primary: 'Eligible' > 'Potentially Eligible' > 'Ineligible'
        Sort secondary: match_score descending
        """
        status_priority = {
            'Eligible': 3,
            'Potentially Eligible': 2,
            'Ineligible': 1
        }
        
        evaluated = [self.evaluate_scholarship(student_profile, s) for s in scholarships]
        
        ranked = sorted(
            evaluated,
            key=lambda x: (status_priority.get(x['eligibility_status'], 0), x['match_score']),
            reverse=True
        )
        return ranked
