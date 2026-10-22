import React, { useState } from 'react';
import {
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  TrendingUp,
  FileSpreadsheet,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  ExternalLink,
  BookmarkPlus,
  HelpCircle,
  Building,
  Calendar,
  Check,
  ShieldCheck,
  Award
} from 'lucide-react';
import { EvaluationResult, ScoringWeights, StudentProfile, ApplicationTrackerItem } from '../types/scholarship';
import { exportRecommendationsToCSV } from '../utils/csvExport';

interface RecommendationsViewProps {
  recommendations: EvaluationResult[];
  studentProfile: StudentProfile;
  weights: ScoringWeights;
  onUpdateWeights: (newWeights: ScoringWeights) => void;
  onResetWeights: () => void;
  onViewScholarship: (result: EvaluationResult) => void;
  onAddToTracker: (scholarshipId: string) => void;
  trackerItems: ApplicationTrackerItem[];
}

export const RecommendationsView: React.FC<RecommendationsViewProps> = ({
  recommendations,
  studentProfile,
  weights,
  onUpdateWeights,
  onResetWeights,
  onViewScholarship,
  onAddToTracker,
  trackerItems
}) => {
  const [activeFilter, setActiveFilter] = useState<'All' | 'Eligible' | 'Potentially Eligible' | 'Ineligible'>('All');
  const [showWeightSettings, setShowWeightSettings] = useState(false);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  // Filter recommendations
  const filteredList = recommendations.filter(r => {
    if (activeFilter === 'All') return true;
    return r.eligibility_status === activeFilter;
  });

  const eligibleCount = recommendations.filter(r => r.eligibility_status === 'Eligible').length;
  const potentialCount = recommendations.filter(r => r.eligibility_status === 'Potentially Eligible').length;
  const ineligibleCount = recommendations.filter(r => r.eligibility_status === 'Ineligible').length;

  const isAlreadyTracked = (id: string) => trackerItems.some(t => t.scholarship_id === id);

  return (
    <div className="space-y-6">
      {/* Top Header & Weights Controller Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                <Sparkles className="w-5 h-5" />
              </span>
              <h1 className="text-xl font-bold text-slate-900">
                AI Scholarship Recommendation Engine
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Calculates ranking match scores across 5 core factors for <strong>{studentProfile.full_name}</strong>.
              All non-qualifying mandatory conditions are explicitly separated.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowWeightSettings(!showWeightSettings)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                showWeightSettings
                  ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Sliders className="w-4 h-4 text-blue-600" />
              Tune Scoring Weights
              {showWeightSettings ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => exportRecommendationsToCSV(recommendations, studentProfile.full_name)}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs transition"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Download CSV Report
            </button>
          </div>
        </div>

        {/* Collapsible Tuning Panel for Scoring Weights */}
        {showWeightSettings && (
          <div className="mt-5 pt-4 border-t border-slate-200 bg-slate-50 p-4 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Configurable Recommendation Weights
                </h3>
                <p className="text-[11px] text-slate-500">
                  Default standard model: 30% Academic, 25% Family Income, 20% Course/Level, 15% State, 10% Other criteria.
                </p>
              </div>
              <button
                onClick={onResetWeights}
                className="flex items-center gap-1 text-[11px] font-medium text-slate-600 hover:text-blue-600"
              >
                <RotateCcw className="w-3 h-3" />
                Reset Defaults
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                  <span>Academic Merit</span>
                  <span className="font-bold text-blue-600">{Math.round(weights.academic * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.60"
                  step="0.05"
                  value={weights.academic}
                  onChange={(e) => onUpdateWeights({ ...weights, academic: parseFloat(e.target.value) })}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                  <span>Family Income / Need</span>
                  <span className="font-bold text-blue-600">{Math.round(weights.income * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.60"
                  step="0.05"
                  value={weights.income}
                  onChange={(e) => onUpdateWeights({ ...weights, income: parseFloat(e.target.value) })}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                  <span>Course / Discipline</span>
                  <span className="font-bold text-blue-600">{Math.round(weights.course * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.50"
                  step="0.05"
                  value={weights.course}
                  onChange={(e) => onUpdateWeights({ ...weights, course: parseFloat(e.target.value) })}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                  <span>State & Residency</span>
                  <span className="font-bold text-blue-600">{Math.round(weights.state * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.40"
                  step="0.05"
                  value={weights.state}
                  onChange={(e) => onUpdateWeights({ ...weights, state: parseFloat(e.target.value) })}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                  <span>Category / Inclusivity</span>
                  <span className="font-bold text-blue-600">{Math.round(weights.other * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.30"
                  step="0.05"
                  value={weights.other}
                  onChange={(e) => onUpdateWeights({ ...weights, other: parseFloat(e.target.value) })}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* Filter Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-slate-100">
          <button
            onClick={() => setActiveFilter('All')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeFilter === 'All'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Results ({recommendations.length})
          </button>

          <button
            onClick={() => setActiveFilter('Eligible')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeFilter === 'Eligible'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Eligible ({eligibleCount})
          </button>

          <button
            onClick={() => setActiveFilter('Potentially Eligible')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeFilter === 'Potentially Eligible'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Potentially Eligible ({potentialCount})
          </button>

          <button
            onClick={() => setActiveFilter('Ineligible')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeFilter === 'Ineligible'
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-red-50 text-red-700 hover:bg-red-100'
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            Ineligible ({ineligibleCount})
          </button>
        </div>
      </div>

      {/* Recommendations Cards List */}
      <div className="space-y-4">
        {filteredList.map((res) => {
          const isExpanded = expandedCardId === res.scholarship.id;
          const tracked = isAlreadyTracked(res.scholarship.id);

          return (
            <div
              key={res.scholarship.id}
              className={`bg-white rounded-xl border transition-all duration-200 shadow-xs hover:shadow-md ${
                res.eligibility_status === 'Eligible'
                  ? 'border-emerald-200/90'
                  : res.eligibility_status === 'Potentially Eligible'
                  ? 'border-amber-200/90'
                  : 'border-slate-200 opacity-90'
              }`}
            >
              <div className="p-5">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  {/* Left Column: Title, Provider, Badges */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {/* Eligibility Badge */}
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                          res.eligibility_status === 'Eligible'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : res.eligibility_status === 'Potentially Eligible'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-red-100 text-red-800 border border-red-300'
                        }`}
                      >
                        {res.eligibility_status === 'Eligible' && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {res.eligibility_status === 'Potentially Eligible' && <AlertTriangle className="w-3.5 h-3.5" />}
                        {res.eligibility_status === 'Ineligible' && <XCircle className="w-3.5 h-3.5" />}
                        {res.eligibility_status}
                      </span>

                      {/* Verified vs Demonstration Badge */}
                      {res.scholarship.is_sample ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                          Sample Demo Record
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          <ShieldCheck className="w-3 h-3 text-blue-600" />
                          Verified Official Scheme
                        </span>
                      )}

                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-500 font-medium">
                        Min Marks: {res.scholarship.min_marks}%
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-500 font-medium">
                        Max Income: {res.scholarship.max_family_income ? `₹${(res.scholarship.max_family_income / 100000).toFixed(1)}L` : 'None'}
                      </span>
                    </div>

                    <h2 className="text-base sm:text-lg font-bold text-slate-900 hover:text-blue-600 cursor-pointer transition"
                      onClick={() => onViewScholarship(res)}>
                      {res.scholarship.name}
                    </h2>

                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                      <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{res.scholarship.provider}</span>
                    </p>

                    <p className="text-xs text-slate-600 mt-2 line-clamp-2">
                      {res.scholarship.description}
                    </p>
                  </div>

                  {/* Right Column: Match Score Circle, Award Amount, Deadline */}
                  <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center shrink-0 border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-5 gap-3">
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="text-[11px] text-slate-500 font-medium">Match Index</div>
                        <div className="text-2xl font-extrabold text-blue-700 tracking-tight">
                          {res.match_score}%
                        </div>
                      </div>
                      <div className="w-12 h-12 rounded-full border-4 border-blue-600 flex items-center justify-center font-bold text-xs text-blue-800 bg-blue-50">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-bold text-emerald-700">{res.scholarship.award_amount}</div>
                      <div className="text-[11px] text-slate-500 flex items-center justify-end gap-1 mt-0.5">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>Deadline: {res.scholarship.application_deadline}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Unmet Conditions Warning Banner (if Ineligible) */}
                {res.unmet_conditions.length > 0 && (
                  <div className="mt-4 p-3 rounded-lg bg-red-50/80 border border-red-200 text-xs text-red-800">
                    <div className="font-bold flex items-center gap-1.5 mb-1 text-red-900">
                      <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                      Unmet Mandatory Condition(s):
                    </div>
                    <ul className="list-disc pl-5 space-y-0.5">
                      {res.unmet_conditions.map((cond, i) => (
                        <li key={i}>{cond}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Missing Info Warning Banner (if Potentially Eligible) */}
                {res.missing_info.length > 0 && (
                  <div className="mt-4 p-3 rounded-lg bg-amber-50/80 border border-amber-200 text-xs text-amber-800">
                    <div className="font-bold flex items-center gap-1.5 mb-1 text-amber-900">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      Information Required to Confirm Full Eligibility:
                    </div>
                    <p className="mb-1">
                      Complete these fields in your student profile: <strong>{res.missing_info.join(', ')}</strong>.
                    </p>
                  </div>
                )}

                {/* Transparent Match Explanations */}
                <div className="mt-4 bg-slate-50 rounded-lg p-3 border border-slate-100">
                  <div className="text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                    Transparent AI Score Explanation:
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-xs text-slate-600">
                    {res.reasons.map((reason, idx) => (
                      <div key={idx} className="flex items-start gap-1.5">
                        <span className="text-blue-500 font-bold">•</span>
                        <span>{reason}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Expandable Component Breakdown Bars */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                      Factor-by-Factor Evaluation Breakdown
                    </h4>

                    <div className="space-y-2.5">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-600">
                            Academic Criteria (Weight: {Math.round(weights.academic * 100)}%)
                          </span>
                          <span className="font-semibold text-slate-800">
                            {res.component_scores.academic}/100
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${res.component_scores.academic}%` }}
                          ></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-600">
                            Family Income / Need (Weight: {Math.round(weights.income * 100)}%)
                          </span>
                          <span className="font-semibold text-slate-800">
                            {res.component_scores.income}/100
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${res.component_scores.income}%` }}
                          ></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-600">
                            Course & Education Level (Weight: {Math.round(weights.course * 100)}%)
                          </span>
                          <span className="font-semibold text-slate-800">
                            {res.component_scores.course}/100
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${res.component_scores.course}%` }}
                          ></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-600">
                            State & Domicile (Weight: {Math.round(weights.state * 100)}%)
                          </span>
                          <span className="font-semibold text-slate-800">
                            {res.component_scores.state}/100
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${res.component_scores.state}%` }}
                          ></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-600">
                            Category / Inclusivity (Weight: {Math.round(weights.other * 100)}%)
                          </span>
                          <span className="font-semibold text-slate-800">
                            {res.component_scores.other}/100
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-cyan-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${res.component_scores.other}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons Row */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <button
                    onClick={() => setExpandedCardId(isExpanded ? null : res.scholarship.id)}
                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="w-3.5 h-3.5" /> Hide Scoring Breakdown
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-3.5 h-3.5" /> Show Scoring Breakdown
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onAddToTracker(res.scholarship.id)}
                      disabled={tracked}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        tracked
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 cursor-default'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {tracked ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          Tracked in Pipeline
                        </>
                      ) : (
                        <>
                          <BookmarkPlus className="w-3.5 h-3.5 text-slate-500" />
                          Save / Track
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => onViewScholarship(res)}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition shadow-xs"
                    >
                      View Details & Checklist
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
