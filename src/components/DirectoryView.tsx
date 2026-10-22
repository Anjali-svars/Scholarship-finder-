import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  SlidersHorizontal,
  RotateCcw,
  Building,
  GraduationCap,
  Calendar,
  IndianRupee,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  BookmarkPlus,
  Check
} from 'lucide-react';
import { Scholarship, EvaluationResult, ApplicationTrackerItem } from '../types/scholarship';

interface DirectoryViewProps {
  scholarships: Scholarship[];
  recommendations: EvaluationResult[];
  onViewScholarship: (result: EvaluationResult) => void;
  onAddToTracker: (scholarshipId: string) => void;
  trackerItems: ApplicationTrackerItem[];
}

export const DirectoryView: React.FC<DirectoryViewProps> = ({
  scholarships,
  recommendations,
  onViewScholarship,
  onAddToTracker,
  trackerItems
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStream, setSelectedStream] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [selectedState, setSelectedState] = useState('All');
  const [maxIncomeFilter, setMaxIncomeFilter] = useState<number | ''>('');
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [sortBy, setSortBy] = useState<'match' | 'amount' | 'deadline' | 'marks'>('match');

  // Map scholarship IDs to their evaluation results
  const evalMap = useMemo(() => {
    const map = new Map<string, EvaluationResult>();
    recommendations.forEach(r => map.set(r.scholarship.id, r));
    return map;
  }, [recommendations]);

  // Extract unique filter options
  const allStreams = ['All', 'Engineering', 'Computer Science', 'Medicine', 'Pure Sciences', 'Commerce', 'Arts & Humanities'];
  const allCategories = ['All', 'General', 'OBC', 'SC', 'ST', 'EWS'];
  const allLevels = ['All', 'High School', 'Diploma', 'Undergraduate', 'Postgraduate', 'Doctoral'];
  const allStates = ['All', 'All India', 'Maharashtra', 'Karnataka', 'West Bengal', 'Telangana'];

  // Filtered & sorted scholarships
  const filteredScholarships = useMemo(() => {
    return scholarships.filter(s => {
      // Search term
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matchesName = s.name.toLowerCase().includes(query);
        const matchesProvider = s.provider.toLowerCase().includes(query);
        const matchesCourse = s.eligible_courses.some(c => c.toLowerCase().includes(query));
        if (!matchesName && !matchesProvider && !matchesCourse) return false;
      }

      // Category
      if (selectedCategory !== 'All') {
        const hasCategory = s.applicable_categories.includes('All') || s.applicable_categories.includes(selectedCategory);
        if (!hasCategory) return false;
      }

      // Stream
      if (selectedStream !== 'All') {
        const hasStream = s.eligible_courses.includes('All') || s.eligible_courses.some(c => c.toLowerCase().includes(selectedStream.toLowerCase()));
        if (!hasStream) return false;
      }

      // Level
      if (selectedLevel !== 'All') {
        const hasLevel = s.education_level.includes(selectedLevel as any);
        if (!hasLevel) return false;
      }

      // State
      if (selectedState !== 'All') {
        const hasState = s.eligible_states.includes('All India') || s.eligible_states.includes(selectedState);
        if (!hasState) return false;
      }

      // Income limit
      if (maxIncomeFilter !== '' && s.max_family_income !== null) {
        if (s.max_family_income > Number(maxIncomeFilter)) return false;
      }

      // Verified only
      if (onlyVerified && s.is_sample) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      const evalA = evalMap.get(a.id);
      const evalB = evalMap.get(b.id);

      if (sortBy === 'match') {
        return (evalB?.match_score || 0) - (evalA?.match_score || 0);
      }
      if (sortBy === 'amount') {
        return (b.award_amount_val || 0) - (a.award_amount_val || 0);
      }
      if (sortBy === 'deadline') {
        return new Date(a.application_deadline).getTime() - new Date(b.application_deadline).getTime();
      }
      if (sortBy === 'marks') {
        return a.min_marks - b.min_marks;
      }
      return 0;
    });
  }, [
    scholarships,
    searchTerm,
    selectedCategory,
    selectedStream,
    selectedLevel,
    selectedState,
    maxIncomeFilter,
    onlyVerified,
    sortBy,
    evalMap
  ]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedStream('All');
    setSelectedLevel('All');
    setSelectedState('All');
    setMaxIncomeFilter('');
    setOnlyVerified(false);
    setSortBy('match');
  };

  const isTracked = (id: string) => trackerItems.some(t => t.scholarship_id === id);

  return (
    <div className="space-y-6">
      {/* Search & Filter Header Box */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Scholarship Search & Directory
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Explore national government schemes, corporate grants, and institutional aids with granular filtering
            </p>
          </div>

          <button
            onClick={handleResetFilters}
            className="self-start md:self-auto flex items-center gap-1.5 text-xs text-slate-600 hover:text-blue-600 font-medium py-1 px-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset All Filters
          </button>
        </div>

        {/* Search Bar Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by scholarship title, ministry, funding provider, or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
          />
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1 text-xs">
          {/* Stream */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Discipline</label>
            <select
              value={selectedStream}
              onChange={(e) => setSelectedStream(e.target.value)}
              className="w-full py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-xs focus:ring-1 focus:ring-blue-500"
            >
              {allStreams.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Level */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Education Level</label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-xs focus:ring-1 focus:ring-blue-500"
            >
              {allLevels.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Social Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-xs focus:ring-1 focus:ring-blue-500"
            >
              {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* State */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">State Domicile</label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-xs focus:ring-1 focus:ring-blue-500"
            >
              {allStates.map(st => <option key={st} value={st}>{st}</option>)}
            </select>
          </div>

          {/* Income Ceiling */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Max Income Limit</label>
            <select
              value={maxIncomeFilter}
              onChange={(e) => setMaxIncomeFilter(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-xs focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Any Income</option>
              <option value="300000">Up to ₹3.0 Lakh</option>
              <option value="500000">Up to ₹5.0 Lakh</option>
              <option value="800000">Up to ₹8.0 Lakh</option>
              <option value="1200000">Up to ₹12.0 Lakh</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Sort Results</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-xs focus:ring-1 focus:ring-blue-500 font-medium"
            >
              <option value="match">Match Score (High-Low)</option>
              <option value="amount">Award Amount (High-Low)</option>
              <option value="deadline">Application Deadline</option>
              <option value="marks">Min Marks Required</option>
            </select>
          </div>
        </div>

        {/* Toggles & Count Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
            <input
              type="checkbox"
              checked={onlyVerified}
              onChange={(e) => setOnlyVerified(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <span>Show verified official schemes only (hide sample records)</span>
          </label>

          <span className="text-slate-500 text-xs">
            Showing <strong className="text-slate-900">{filteredScholarships.length}</strong> of {scholarships.length} scholarships
          </span>
        </div>
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredScholarships.map(sch => {
          const evalRes = evalMap.get(sch.id);
          const tracked = isTracked(sch.id);

          return (
            <div
              key={sch.id}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:shadow-md hover:border-blue-400 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  {sch.is_sample ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                      Sample Demo
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                      <ShieldCheck className="w-3 h-3 text-blue-600" />
                      Verified
                    </span>
                  )}

                  {evalRes && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        evalRes.eligibility_status === 'Eligible'
                          ? 'bg-emerald-100 text-emerald-800'
                          : evalRes.eligibility_status === 'Potentially Eligible'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {evalRes.match_score}% Match
                    </span>
                  )}
                </div>

                <h3
                  onClick={() => evalRes && onViewScholarship(evalRes)}
                  className="font-bold text-sm text-slate-900 hover:text-blue-600 cursor-pointer line-clamp-2 leading-snug"
                >
                  {sch.name}
                </h3>

                <p className="text-[11px] text-slate-500 mt-1 line-clamp-1 flex items-center gap-1">
                  <Building className="w-3 h-3 text-slate-400 shrink-0" />
                  {sch.provider}
                </p>

                <p className="text-xs text-slate-600 mt-2 line-clamp-2">
                  {sch.description}
                </p>

                <div className="mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500 text-[11px]">Award Amount:</span>
                    <strong className="text-emerald-700 font-semibold">{sch.award_amount}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 text-[11px]">Deadline:</span>
                    <span className="text-slate-700 font-medium">{sch.application_deadline}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 text-[11px]">Min Marks:</span>
                    <span className="text-slate-700 font-medium">{sch.min_marks}%</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => onAddToTracker(sch.id)}
                  disabled={tracked}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                    tracked
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {tracked ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      Tracked
                    </>
                  ) : (
                    <>
                      <BookmarkPlus className="w-3 h-3" />
                      Save
                    </>
                  )}
                </button>

                <button
                  onClick={() => evalRes && onViewScholarship(evalRes)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition"
                >
                  View Details & Guide
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
