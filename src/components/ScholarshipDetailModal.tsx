import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  Calendar,
  Building,
  GraduationCap,
  IndianRupee,
  BookmarkPlus,
  Check,
  Compass,
  ArrowRight
} from 'lucide-react';
import { EvaluationResult, ApplicationTrackerItem } from '../types/scholarship';

interface ScholarshipDetailModalProps {
  result: EvaluationResult | null;
  onClose: () => void;
  onAddToTracker: (scholarshipId: string) => void;
  trackerItems: ApplicationTrackerItem[];
}

export const ScholarshipDetailModal: React.FC<ScholarshipDetailModalProps> = ({
  result,
  onClose,
  onAddToTracker,
  trackerItems
}) => {
  if (!result) return null;

  const { scholarship, match_score, eligibility_status, component_scores, weights_used, reasons, unmet_conditions, missing_info } = result;
  const isTracked = trackerItems.some(t => t.scholarship_id === scholarship.id);

  // Local checklist state for student document gathering
  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({});

  const toggleDoc = (doc: string) => {
    setCheckedDocs(prev => ({ ...prev, [doc]: !prev[doc] }));
  };

  const completedDocsCount = scholarship.required_documents.filter(d => checkedDocs[d]).length;
  const totalDocsCount = scholarship.required_documents.length;
  const docProgressPct = totalDocsCount > 0 ? Math.round((completedDocsCount / totalDocsCount) * 100) : 100;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex items-start justify-between gap-4 shrink-0">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                  eligibility_status === 'Eligible'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : eligibility_status === 'Potentially Eligible'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-red-500/20 text-red-300 border border-red-500/30'
                }`}
              >
                {eligibility_status} ({match_score}% Match)
              </span>

              {scholarship.is_sample ? (
                <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 border border-slate-700">
                  Demonstration Record
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-blue-500/20 text-cyan-300 border border-blue-500/30">
                  <ShieldCheck className="w-3 h-3 text-cyan-400" />
                  Verified Scheme
                </span>
              )}
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-white leading-tight">
              {scholarship.name}
            </h2>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5" />
              {scholarship.provider}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-700">
          {/* Key Metrics Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-[11px] text-slate-500 block">Award Benefit</span>
              <strong className="text-emerald-700 font-bold text-sm block mt-0.5">
                {scholarship.award_amount}
              </strong>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block">Application Deadline</span>
              <strong className="text-slate-900 font-semibold block mt-0.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {scholarship.application_deadline}
              </strong>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block">Min Academic Cutoff</span>
              <strong className="text-slate-900 font-semibold block mt-0.5">
                {scholarship.min_marks}% Marks
              </strong>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block">Max Income Limit</span>
              <strong className="text-slate-900 font-semibold block mt-0.5">
                {scholarship.max_family_income ? `₹${scholarship.max_family_income.toLocaleString('en-IN')}` : 'No Ceiling'}
              </strong>
            </div>
          </div>

          {/* Unmet Conditions or Missing Info Callout */}
          {unmet_conditions.length > 0 && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-sm">
                <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                Unmet Mandatory Eligibility Criteria
              </div>
              <ul className="list-disc pl-5 space-y-1 mt-1 text-red-800">
                {unmet_conditions.map((cond, i) => (
                  <li key={i}>{cond}</li>
                ))}
              </ul>
            </div>
          )}

          {missing_info.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                Missing Profile Information
              </div>
              <p>
                To confirm full eligibility, update the following fields in your profile: <strong>{missing_info.join(', ')}</strong>.
              </p>
            </div>
          )}

          {/* Description & Overview */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Scheme Description & Objective
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {scholarship.description}
            </p>
          </div>

          {/* Eligibility Rules Checklist */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Mandatory Eligibility Requirements
            </h3>
            <div className="space-y-1.5 text-xs text-slate-700">
              {scholarship.eligibility_conditions.map((cond, i) => (
                <div key={i} className="flex items-start gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{cond}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Document Readiness Checklist */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Interactive Document Readiness Checklist
                </h3>
                <p className="text-[11px] text-slate-500">
                  Gather these required verification documents prior to official portal application
                </p>
              </div>
              <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                {completedDocsCount}/{totalDocsCount} Ready ({docProgressPct}%)
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-200 rounded-full h-1.5 mb-3 overflow-hidden">
              <div
                className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${docProgressPct}%` }}
              ></div>
            </div>

            <div className="space-y-2">
              {scholarship.required_documents.map((doc, idx) => {
                const isChecked = !!checkedDocs[doc];
                return (
                  <label
                    key={idx}
                    className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition ${
                      isChecked
                        ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100/50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleDoc(doc)}
                      className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span className={isChecked ? 'line-through opacity-80' : 'font-medium'}>{doc}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Step-by-Step Application Roadmap */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-blue-600" />
              Step-by-Step Application Roadmap
            </h3>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  1
                </div>
                <div className="text-xs">
                  <strong className="text-slate-900 block font-semibold">Verify Documents & Eligibility</strong>
                  <span className="text-slate-500">Ensure all marksheets, income certificates, and bank account Aadhaar seeding are in place.</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  2
                </div>
                <div className="text-xs">
                  <strong className="text-slate-900 block font-semibold">Visit Official Government / Provider Portal</strong>
                  <span className="text-slate-500">Click the verified external application link below to proceed to the genuine portal.</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  3
                </div>
                <div className="text-xs">
                  <strong className="text-slate-900 block font-semibold">Register & Save Application Reference ID</strong>
                  <span className="text-slate-500">Complete portal registration and copy your Application Registration Number back into your ScholarAI Tracker.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer with Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onAddToTracker(scholarship.id)}
              disabled={isTracked}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                isTracked
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 shadow-xs'
              }`}
            >
              {isTracked ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  Saved in Pipeline
                </>
              ) : (
                <>
                  <BookmarkPlus className="w-4 h-4 text-slate-500" />
                  Add to Application Tracker
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-medium transition"
            >
              Close
            </button>

            <a
              href={scholarship.official_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 transition"
            >
              <span>Visit Official Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
