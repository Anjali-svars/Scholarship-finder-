import {
  Scholarship,
  StudentProfile,
  EvaluationResult,
  ComponentScores,
  ScoringWeights,
  EligibilityStatus
} from '../types/scholarship';

export const DEFAULT_WEIGHTS: ScoringWeights = {
  academic: 0.30,
  income: 0.25,
  course: 0.20,
  state: 0.15,
  other: 0.10
};

export function evaluateScholarship(
  profile: Partial<StudentProfile>,
  scholarship: Scholarship,
  customWeights: ScoringWeights = DEFAULT_WEIGHTS
): EvaluationResult {
  // Normalize weights
  const totalWeight =
    customWeights.academic +
    customWeights.income +
    customWeights.course +
    customWeights.state +
    customWeights.other;

  const weights: ScoringWeights = totalWeight > 0 ? {
    academic: customWeights.academic / totalWeight,
    income: customWeights.income / totalWeight,
    course: customWeights.course / totalWeight,
    state: customWeights.state / totalWeight,
    other: customWeights.other / totalWeight
  } : DEFAULT_WEIGHTS;

  const missingInfo: string[] = [];
  const unmetConditions: string[] = [];
  const reasons: string[] = [];

  const scores: ComponentScores = {
    academic: 0,
    income: 0,
    course: 0,
    state: 0,
    other: 0
  };

  // 1. ACADEMIC EVALUATION (30%)
  const minMarks = scholarship.min_marks ?? 0;
  if (profile.marks === undefined || profile.marks === null || isNaN(profile.marks)) {
    missingInfo.push('Academic Marks/Percentage');
    reasons.push('Academic marks not specified in profile; potential eligibility depends on meeting cut-off.');
    scores.academic = 50;
  } else {
    const marks = Number(profile.marks);
    if (marks < minMarks) {
      unmetConditions.push(`Current marks (${marks.toFixed(1)}%) is below minimum required (${minMarks.toFixed(1)}%)`);
      reasons.push(`Requires minimum ${minMarks.toFixed(1)}% marks; current profile shows ${marks.toFixed(1)}%.`);
      scores.academic = Math.max(0, Math.round((marks / minMarks) * 50));
    } else {
      const surplus = Math.min(15, marks - minMarks);
      scores.academic = Math.min(100, Math.round(85 + (surplus / 15) * 15));
      reasons.push(`Academic criteria satisfied (${marks.toFixed(1)}% >= ${minMarks.toFixed(1)}% cut-off).`);
    }
  }

  // 2. FAMILY INCOME EVALUATION (25%)
  const maxIncome = scholarship.max_family_income;
  if (maxIncome === null || maxIncome === undefined || maxIncome <= 0) {
    // Open to all income brackets
    scores.income = 100;
    reasons.push('Open to all income brackets (pure merit/talent scheme).');
  } else if (profile.family_income === undefined || profile.family_income === null || isNaN(profile.family_income)) {
    missingInfo.push('Annual Family Income');
    reasons.push(`Maximum income ceiling is ₹${maxIncome.toLocaleString('en-IN')}; family income not specified.`);
    scores.income = 50;
  } else {
    const income = Number(profile.family_income);
    if (income > maxIncome) {
      unmetConditions.push(`Annual family income (₹${income.toLocaleString('en-IN')}) exceeds max ceiling (₹${maxIncome.toLocaleString('en-IN')})`);
      reasons.push(`Income exceeds maximum permissible ceiling of ₹${maxIncome.toLocaleString('en-IN')}.`);
      scores.income = 0;
    } else {
      // Lower income gets higher need score
      const ratio = income / maxIncome;
      const needScore = 70 + (1 - ratio) * 30;
      scores.income = Math.min(100, Math.max(60, Math.round(needScore)));
      reasons.push(`Income criteria satisfied (₹${income.toLocaleString('en-IN')} within ₹${maxIncome.toLocaleString('en-IN')} limit).`);
    }
  }

  // 3. COURSE & EDUCATION LEVEL (20%)
  const eligibleCourses = scholarship.eligible_courses || [];
  const eligibleLevels = scholarship.education_level || [];
  const studentCourse = (profile.course || '').trim().toLowerCase();
  const studentLevel = (profile.education_level || '').trim().toLowerCase();

  let courseMatch = false;
  let levelMatch = false;

  if (!studentCourse) {
    missingInfo.push('Course / Discipline');
  } else {
    courseMatch = eligibleCourses.length === 0 ||
      eligibleCourses.some(c => c.toLowerCase() === 'all' || c.toLowerCase() === 'any') ||
      eligibleCourses.some(c => studentCourse.includes(c.toLowerCase()) || c.toLowerCase().includes(studentCourse));
  }

  if (!studentLevel) {
    missingInfo.push('Education Level');
  } else {
    levelMatch = eligibleLevels.length === 0 ||
      eligibleLevels.some(l => l.toLowerCase() === 'all' || l.toLowerCase() === 'any') ||
      eligibleLevels.some(l => studentLevel.includes(l.toLowerCase()) || l.toLowerCase().includes(studentLevel));
  }

  if (!studentCourse && !studentLevel) {
    scores.course = 40;
  } else if (!courseMatch && studentCourse) {
    unmetConditions.push(`Course '${profile.course}' not among eligible streams: ${eligibleCourses.join(', ')}`);
    scores.course = 25;
  } else if (!levelMatch && studentLevel) {
    unmetConditions.push(`Education level '${profile.education_level}' not eligible: ${eligibleLevels.join(', ')}`);
    scores.course = 35;
  } else {
    scores.course = 100;
    reasons.push('Course discipline and education level match eligibility specifications.');
  }

  // 4. STATE & RESIDENCY (15%)
  const eligibleStates = scholarship.eligible_states || [];
  const studentState = (profile.state || '').trim();

  if (!studentState) {
    missingInfo.push('State of Domicile');
    scores.state = 50;
  } else if (
    eligibleStates.length === 0 ||
    eligibleStates.some(s => ['all india', 'all', 'any', 'pan-india'].includes(s.toLowerCase()))
  ) {
    scores.state = 100;
    reasons.push('Pan-India eligibility; residency criteria satisfied.');
  } else {
    const stateMatch = eligibleStates.some(s => s.toLowerCase() === studentState.toLowerCase());
    if (stateMatch) {
      scores.state = 100;
      reasons.push(`State residency criteria satisfied for '${studentState}'.`);
    } else {
      unmetConditions.push(`State '${studentState}' not eligible (scholarship restricted to: ${eligibleStates.join(', ')})`);
      scores.state = 0;
    }
  }

  // 5. OTHER CRITERIA: GENDER, CATEGORY, DISABILITY (10%)
  let otherScore = 75;
  const genderPref = scholarship.gender_preference || 'All';
  const studentGender = (profile.gender || '').trim().toLowerCase();

  if (genderPref.toLowerCase() !== 'all') {
    if (studentGender) {
      if (
        studentGender === genderPref.toLowerCase() ||
        (genderPref.toLowerCase() === 'female' && ['female', 'girl', 'woman'].includes(studentGender))
      ) {
        otherScore += 15;
        reasons.push(`Targeted gender preference criteria met (${genderPref}).`);
      } else {
        unmetConditions.push(`Scholarship specifically designated for ${genderPref} candidates only.`);
        otherScore = 0;
      }
    } else {
      missingInfo.push('Gender');
    }
  }

  const applicableCategories = scholarship.applicable_categories || [];
  const studentCategory = (profile.category || '').trim().toLowerCase();

  if (
    applicableCategories.length > 0 &&
    !applicableCategories.some(c => ['all', 'any'].includes(c.toLowerCase()))
  ) {
    if (studentCategory) {
      const catMatch = applicableCategories.some(c => c.toLowerCase() === studentCategory);
      if (catMatch) {
        otherScore += 10;
        reasons.push(`Affirmative action / category reservation matched (${profile.category}).`);
      } else {
        unmetConditions.push(`Category '${profile.category}' not eligible (requires: ${applicableCategories.join(', ')})`);
        otherScore = 0;
      }
    } else {
      missingInfo.push('Social Category');
    }
  }

  if (scholarship.disability_friendly && profile.disability_status) {
    otherScore += 15;
    reasons.push('Disability inclusion preference granted.');
  }

  scores.other = Math.min(100, Math.max(0, otherScore));

  // Compute final weighted score
  const matchScore = Math.round(
    (scores.academic * weights.academic +
      scores.income * weights.income +
      scores.course * weights.course +
      scores.state * weights.state +
      scores.other * weights.other) * 10
  ) / 10;

  // Determine classification
  let eligibilityStatus: EligibilityStatus = 'Ineligible';
  let badgeColor: 'green' | 'amber' | 'red' = 'red';

  if (unmetConditions.length > 0) {
    eligibilityStatus = 'Ineligible';
    badgeColor = 'red';
  } else if (missingInfo.length > 0) {
    eligibilityStatus = 'Potentially Eligible';
    badgeColor = 'amber';
    reasons.push(`Potentially eligible subject to providing: ${missingInfo.join(', ')}.`);
  } else if (matchScore >= 65) {
    eligibilityStatus = 'Eligible';
    badgeColor = 'green';
    reasons.unshift('All mandatory eligibility conditions are satisfied.');
  } else {
    eligibilityStatus = 'Potentially Eligible';
    badgeColor = 'amber';
    reasons.push('Meets mandatory baseline, but match index is competitive.');
  }

  return {
    scholarship_id: scholarship.id,
    scholarship,
    match_score: matchScore,
    eligibility_status: eligibilityStatus,
    badge_color: badgeColor,
    component_scores: scores,
    weights_used: weights,
    missing_info: missingInfo,
    unmet_conditions: unmetConditions,
    reasons
  };
}

export function rankScholarships(
  profile: Partial<StudentProfile>,
  scholarships: Scholarship[],
  weights: ScoringWeights = DEFAULT_WEIGHTS
): EvaluationResult[] {
  const statusRank: Record<EligibilityStatus, number> = {
    Eligible: 3,
    'Potentially Eligible': 2,
    Ineligible: 1
  };

  const results = scholarships.map(sch => evaluateScholarship(profile, sch, weights));

  return results.sort((a, b) => {
    const priorityDiff = statusRank[b.eligibility_status] - statusRank[a.eligibility_status];
    if (priorityDiff !== 0) return priorityDiff;
    return b.match_score - a.match_score;
  });
}
