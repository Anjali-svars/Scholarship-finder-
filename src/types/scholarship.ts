export type EducationLevel = 'High School' | 'Diploma' | 'Undergraduate' | 'Postgraduate' | 'Doctoral';

export type Category = 'General' | 'OBC' | 'SC' | 'ST' | 'EWS' | 'Minority';

export type ApplicationStatus = 'Interested' | 'Preparing Documents' | 'Applied' | 'Result Awaited' | 'Awarded' | 'Not Awarded';

export type EligibilityStatus = 'Eligible' | 'Potentially Eligible' | 'Ineligible';

export interface Scholarship {
  id: string;
  name: string;
  provider: string;
  description: string;
  eligible_courses: string[];
  education_level: EducationLevel[];
  min_marks: number;
  max_family_income: number | null;
  eligible_states: string[];
  applicable_categories: string[];
  gender_preference: 'All' | 'Female' | 'Male';
  disability_friendly: boolean;
  award_amount: string;
  award_amount_val: number;
  application_deadline: string;
  required_documents: string[];
  official_url: string;
  eligibility_conditions: string[];
  is_sample: boolean;
  verification_status: string;
}

export interface StudentProfile {
  id: string;
  user_id: string;
  full_name: string;
  dob: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  state: string;
  education_level: EducationLevel;
  course: string;
  institution: string;
  marks: number;
  family_income: number;
  category: Category;
  disability_status: boolean;
  achievements: string;
}

export interface ComponentScores {
  academic: number;
  income: number;
  course: number;
  state: number;
  other: number;
}

export interface ScoringWeights {
  academic: number;
  income: number;
  course: number;
  state: number;
  other: number;
}

export interface EvaluationResult {
  scholarship_id: string;
  scholarship: Scholarship;
  match_score: number;
  eligibility_status: EligibilityStatus;
  badge_color: 'green' | 'amber' | 'red';
  component_scores: ComponentScores;
  weights_used: ScoringWeights;
  missing_info: string[];
  unmet_conditions: string[];
  reasons: string[];
}

export interface ApplicationTrackerItem {
  id: string;
  scholarship_id: string;
  scholarship_name: string;
  provider: string;
  award_amount: string;
  deadline: string;
  status: ApplicationStatus;
  notes: string;
  application_ref: string;
  applied_date: string;
  checked_documents: string[];
  updated_at: string;
}

export interface UserAccount {
  id: string;
  email: string;
  full_name: string;
  role: 'student' | 'admin';
}
