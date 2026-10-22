import React from 'react';
import {
  GraduationCap,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  IndianRupee,
  FileSpreadsheet,
  ArrowRight,
  TrendingUp,
  Award,
  BookOpen,
  Calendar,
  ExternalLink
} from 'lucide-react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import { Doughnut, Bar, Radar } from 'react-chartjs-2';
import { EvaluationResult, StudentProfile, ApplicationTrackerItem } from '../types/scholarship';
import { exportRecommendationsToCSV, exportTrackerToCSV } from '../utils/csvExport';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler
);

interface DashboardViewProps {
  studentProfile: StudentProfile;
  recommendations: EvaluationResult[];
  trackerItems: ApplicationTrackerItem[];
  onViewScholarship: (result: EvaluationResult) => void;
  onNavigateTab: (tab: string) => void;
  onOpenProfile: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  studentProfile,
  recommendations,
  trackerItems,
  onViewScholarship,
  onNavigateTab,
  onOpenProfile
}) => {
  // Statistics
  const totalInDb = recommendations.length;
  const eligibleCount = recommendations.filter(r => r.eligibility_status === 'Eligible').length;
  const potentiallyEligibleCount = recommendations.filter(r => r.eligibility_status === 'Potentially Eligible').length;
  const ineligibleCount = recommendations.filter(r => r.eligibility_status === 'Ineligible').length;

  const eligibleSum = recommendations
    .filter(r => r.eligibility_status === 'Eligible')
    .reduce((acc, r) => acc + (r.scholarship.award_amount_val || 0), 0);

  // Check upcoming deadlines (e.g., within 45 days)
  const now = new Date('2026-10-22');
  const urgentScholarships = recommendations
    .filter(r => {
      if (!r.scholarship.application_deadline) return false;
      const d = new Date(r.scholarship.application_deadline);
      const diffDays = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 45;
    })
    .sort((a, b) => new Date(a.scholarship.application_deadline).getTime() - new Date(b.scholarship.application_deadline).getTime());

  // Doughnut Chart Data: Eligibility Breakdown
  const doughnutData = {
    labels: ['Eligible', 'Potentially Eligible', 'Ineligible'],
    datasets: [
      {
        data: [eligibleCount, potentiallyEligibleCount, ineligibleCount],
        backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
        hoverBackgroundColor: ['#059669', '#d97706', '#dc2626'],
        borderWidth: 2,
        borderColor: '#ffffff'
      }
    ]
  };

  // Bar Chart Data: Stream Breakdown
  const streamMap: Record<string, { count: number; totalAmt: number }> = {};
  recommendations.forEach(r => {
    const primaryStream = r.scholarship.eligible_courses[0] || 'General';
    if (!streamMap[primaryStream]) {
      streamMap[primaryStream] = { count: 0, totalAmt: 0 };
    }
    streamMap[primaryStream].count += 1;
    streamMap[primaryStream].totalAmt += Math.round((r.scholarship.award_amount_val || 0) / 1000);
  });

  const streamLabels = Object.keys(streamMap).slice(0, 6);
  const barData = {
    labels: streamLabels,
    datasets: [
      {
        label: 'Total Scholarships',
        data: streamLabels.map(k => streamMap[k].count),
        backgroundColor: '#3b82f6',
        borderRadius: 6
      },
      {
        label: 'Funding Value (in ₹ Thousands)',
        data: streamLabels.map(k => streamMap[k].totalAmt),
        backgroundColor: '#8b5cf6',
        borderRadius: 6
      }
    ]
  };

  // Radar Chart: Student Profile Strengths vs Criteria
  const avgScores = {
    academic: Math.round(recommendations.reduce((acc, r) => acc + r.component_scores.academic, 0) / (totalInDb || 1)),
    income: Math.round(recommendations.reduce((acc, r) => acc + r.component_scores.income, 0) / (totalInDb || 1)),
    course: Math.round(recommendations.reduce((acc, r) => acc + r.component_scores.course, 0) / (totalInDb || 1)),
    state: Math.round(recommendations.reduce((acc, r) => acc + r.component_scores.state, 0) / (totalInDb || 1)),
    other: Math.round(recommendations.reduce((acc, r) => acc + r.component_scores.other, 0) / (totalInDb || 1))
  };

  const radarData = {
    labels: [
      'Academic (30%)',
      'Need / Income (25%)',
      'Course Match (20%)',
      'State Residency (15%)',
      'Inclusivity (10%)'
    ],
    datasets: [
      {
        label: 'Student Profile Match Index',
        data: [avgScores.academic, avgScores.income, avgScores.course, avgScores.state, avgScores.other],
        backgroundColor: 'rgba(59, 130, 246, 0.25)',
        borderColor: '#2563eb',
        pointBackgroundColor: '#1d4ed8',
        pointBorderColor: '#ffffff',
        pointHoverBackgroundColor: '#ffffff',
        pointHoverBorderColor: '#1d4ed8',
        borderWidth: 2
      }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner & Student Status */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white rounded-2xl p-6 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-cyan-300 text-xs font-semibold border border-blue-400/30 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              AI Recommendation Model Active
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Welcome back, <span className="text-cyan-400">{studentProfile.full_name}</span>
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Currently analyzing eligibility for <strong className="text-white">{studentProfile.course}</strong> at {studentProfile.institution}.
              Based on your marks ({studentProfile.marks}%) and annual family income (₹{studentProfile.family_income.toLocaleString('en-IN')}), we have identified matching grants below.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => exportRecommendationsToCSV(recommendations, studentProfile.full_name)}
              className="flex items-center gap-2 px-3.5 py-2 bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium transition shadow-sm"
              title="Download all matching recommendations as CSV"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              Export CSV Report
            </button>
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition shadow-md shadow-blue-500/20"
            >
              Update Profile Info
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total in DB */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Opportunities
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{totalInDb}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Verified & demo catalog</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        {/* Fully Eligible */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Eligible Scholarships
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{eligibleCount}</p>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
              100% mandatory conditions met
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Potential Funding */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Potential Grant Value
            </p>
            <p className="text-2xl font-bold text-indigo-700 mt-1">
              ₹{(eligibleSum / 1000).toFixed(0)}k+
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">From eligible programs</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <IndianRupee className="w-6 h-6" />
          </div>
        </div>

        {/* Application Tracker Count */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Application Pipeline
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{trackerItems.length}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Active applications</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Visual Analytics Grid: 3 Interactive Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Doughnut - Eligibility Distribution */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Eligibility Distribution</h3>
              <p className="text-xs text-slate-500">Classification of all {totalInDb} scholarships</p>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-600 rounded">
              Rule-Based
            </span>
          </div>

          <div className="h-56 relative flex items-center justify-center my-2">
            <Doughnut
              data={doughnutData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: { boxWidth: 12, font: { size: 11 } }
                  }
                },
                cutout: '70%'
              }}
            />
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center text-xs">
            <div>
              <span className="block font-bold text-emerald-600">{eligibleCount}</span>
              <span className="text-[10px] text-slate-500">Eligible</span>
            </div>
            <div>
              <span className="block font-bold text-amber-600">{potentiallyEligibleCount}</span>
              <span className="text-[10px] text-slate-500">Potential</span>
            </div>
            <div>
              <span className="block font-bold text-red-600">{ineligibleCount}</span>
              <span className="text-[10px] text-slate-500">Ineligible</span>
            </div>
          </div>
        </div>

        {/* Chart 2: Radar - Match Criteria Alignment */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Criteria Alignment Index</h3>
              <p className="text-xs text-slate-500">Scores across 5 weighted dimensions</p>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-blue-50 text-blue-700 rounded">
              Weighted 100%
            </span>
          </div>

          <div className="h-56 relative flex items-center justify-center my-2">
            <Radar
              data={radarData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  r: {
                    suggestedMin: 0,
                    suggestedMax: 100,
                    ticks: { display: false, stepSize: 20 },
                    pointLabels: { font: { size: 9 } }
                  }
                },
                plugins: {
                  legend: { display: false }
                }
              }}
            />
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 text-center">
            Weighted model: Academic (30%), Income (25%), Course (20%), State (15%), Inclusivity (10%)
          </div>
        </div>

        {/* Chart 3: Bar - Stream & Discipline Distribution */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Discipline Opportunities</h3>
              <p className="text-xs text-slate-500">Count & funding by study stream</p>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-50 text-indigo-700 rounded">
              Discipline
            </span>
          </div>

          <div className="h-56 relative my-2">
            <Bar
              data={barData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: { beginAtZero: true, ticks: { font: { size: 10 } } },
                  x: { ticks: { font: { size: 10 } } }
                },
                plugins: {
                  legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } }
                }
              }}
            />
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 text-center">
            Shows available opportunities mapped to academic disciplines
          </div>
        </div>
      </div>

      {/* Urgent Upcoming Deadlines Alert Banner */}
      {urgentScholarships.length > 0 && (
        <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Upcoming Application Deadlines (Next 45 Days)</span>
            </div>
            <button
              onClick={() => onNavigateTab('recommendations')}
              className="text-xs text-amber-800 hover:text-amber-950 font-semibold flex items-center gap-1"
            >
              View all recommendations <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {urgentScholarships.slice(0, 3).map(r => (
              <div
                key={r.scholarship.id}
                onClick={() => onViewScholarship(r)}
                className="bg-white p-3 rounded-lg border border-amber-200/80 shadow-xs hover:border-amber-400 cursor-pointer transition flex items-start justify-between gap-2"
              >
                <div className="min-w-0">
                  <h4 className="text-xs font-semibold text-slate-900 truncate">
                    {r.scholarship.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                    <span className="font-medium text-emerald-600">{r.scholarship.award_amount}</span>
                    <span>•</span>
                    <span className="text-amber-700 font-medium flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {r.scholarship.application_deadline}
                    </span>
                  </div>
                </div>
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-blue-50 text-blue-700 border border-blue-200">
                  {r.match_score}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top 3 High-Match Recommendations Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Top Recommended Opportunities for You
            </h2>
            <p className="text-xs text-slate-500">
              Ranked highest based on academic merit, financial eligibility, and course compatibility
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('recommendations')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            See All ({recommendations.length}) <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendations.slice(0, 3).map(res => (
            <div
              key={res.scholarship.id}
              className="border border-slate-200 rounded-xl p-4 flex flex-col justify-between hover:border-blue-400 hover:shadow-md transition bg-gradient-to-b from-white to-slate-50/50"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      res.eligibility_status === 'Eligible'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : res.eligibility_status === 'Potentially Eligible'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-red-100 text-red-800 border border-red-300'
                    }`}
                  >
                    {res.eligibility_status}
                  </span>

                  <div className="flex items-center gap-1 font-bold text-sm text-blue-700">
                    <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
                    <span>{res.match_score}% Match</span>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                  {res.scholarship.name}
                </h3>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                  {res.scholarship.provider}
                </p>

                <div className="mt-3 p-2.5 rounded-lg bg-slate-100/70 border border-slate-200 text-xs space-y-1">
                  <div className="flex justify-between text-slate-700">
                    <span className="text-slate-500 text-[11px]">Grant Value:</span>
                    <strong className="text-emerald-700 font-semibold">{res.scholarship.award_amount}</strong>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span className="text-slate-500 text-[11px]">Deadline:</span>
                    <span className="font-medium text-slate-800">{res.scholarship.application_deadline}</span>
                  </div>
                </div>

                {/* Score Explanations Preview */}
                <div className="mt-3 text-[11px] text-slate-600 space-y-1">
                  {res.reasons.slice(0, 2).map((reason, idx) => (
                    <div key={idx} className="flex items-start gap-1.5">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span className="line-clamp-1">{reason}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
                <button
                  onClick={() => onViewScholarship(res)}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition text-center shadow-xs"
                >
                  View Details & Guidance
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
