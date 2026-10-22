import { EvaluationResult, ApplicationTrackerItem, Scholarship } from '../types/scholarship';

export function exportRecommendationsToCSV(recommendations: EvaluationResult[], studentName: string) {
  const headers = [
    'Scholarship Name',
    'Provider',
    'Eligibility Status',
    'Match Score (%)',
    'Award Amount',
    'Application Deadline',
    'Academic Match',
    'Income Match',
    'Course Match',
    'State Match',
    'Other Match',
    'Missing Info',
    'Unmet Conditions',
    'Official Portal URL'
  ];

  const rows = recommendations.map(r => [
    `"${r.scholarship.name.replace(/"/g, '""')}"`,
    `"${r.scholarship.provider.replace(/"/g, '""')}"`,
    `"${r.eligibility_status}"`,
    r.match_score,
    `"${r.scholarship.award_amount}"`,
    `"${r.scholarship.application_deadline}"`,
    r.component_scores.academic,
    r.component_scores.income,
    r.component_scores.course,
    r.component_scores.state,
    r.component_scores.other,
    `"${(r.missing_info || []).join('; ')}"`,
    `"${(r.unmet_conditions || []).join('; ')}"`,
    `"${r.scholarship.official_url}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  downloadBlob(csvContent, `scholarship_recommendations_${studentName.toLowerCase().replace(/\s+/g, '_')}.csv`, 'text/csv;charset=utf-8;');
}

export function exportTrackerToCSV(trackerItems: ApplicationTrackerItem[], studentName: string) {
  const headers = [
    'Scholarship Name',
    'Provider',
    'Award Amount',
    'Deadline',
    'Application Status',
    'Application Reference No',
    'Applied Date',
    'Notes',
    'Last Updated'
  ];

  const rows = trackerItems.map(item => [
    `"${item.scholarship_name.replace(/"/g, '""')}"`,
    `"${item.provider.replace(/"/g, '""')}"`,
    `"${item.award_amount}"`,
    `"${item.deadline}"`,
    `"${item.status}"`,
    `"${item.application_ref || 'N/A'}"`,
    `"${item.applied_date || 'N/A'}"`,
    `"${(item.notes || '').replace(/"/g, '""')}"`,
    `"${item.updated_at}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  downloadBlob(csvContent, `application_tracker_${studentName.toLowerCase().replace(/\s+/g, '_')}.csv`, 'text/csv;charset=utf-8;');
}

export function exportScholarshipDatasetToCSV(scholarships: Scholarship[]) {
  const headers = [
    'ID',
    'Name',
    'Provider',
    'Eligible Courses',
    'Education Level',
    'Min Marks (%)',
    'Max Family Income (INR)',
    'Eligible States',
    'Applicable Categories',
    'Award Amount',
    'Deadline',
    'Verification Status',
    'Official URL'
  ];

  const rows = scholarships.map(s => [
    `"${s.id}"`,
    `"${s.name.replace(/"/g, '""')}"`,
    `"${s.provider.replace(/"/g, '""')}"`,
    `"${s.eligible_courses.join('; ')}"`,
    `"${s.education_level.join('; ')}"`,
    s.min_marks,
    s.max_family_income || 'No Limit',
    `"${s.eligible_states.join('; ')}"`,
    `"${s.applicable_categories.join('; ')}"`,
    `"${s.award_amount}"`,
    `"${s.application_deadline}"`,
    `"${s.verification_status}"`,
    `"${s.official_url}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  downloadBlob(csvContent, `master_scholarship_dataset.csv`, 'text/csv;charset=utf-8;');
}

function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
