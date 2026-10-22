import React, { useState } from 'react';
import {
  ShieldAlert,
  PlusCircle,
  Edit2,
  Trash2,
  CheckCircle,
  FileSpreadsheet,
  AlertTriangle,
  Building,
  Calendar,
  IndianRupee,
  ShieldCheck,
  Search,
  X,
  FileCheck2
} from 'lucide-react';
import { Scholarship, EducationLevel } from '../types/scholarship';
import { exportScholarshipDatasetToCSV } from '../utils/csvExport';

interface AdminPortalViewProps {
  scholarships: Scholarship[];
  onAddScholarship: (newSch: Scholarship) => void;
  onUpdateScholarship: (updatedSch: Scholarship) => void;
  onDeleteScholarship: (id: string) => void;
}

export const AdminPortalView: React.FC<AdminPortalViewProps> = ({
  scholarships,
  onAddScholarship,
  onUpdateScholarship,
  onDeleteScholarship
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSch, setEditingSch] = useState<Scholarship | null>(null);

  // Stats
  const totalCount = scholarships.length;
  const verifiedCount = scholarships.filter(s => !s.is_sample).length;
  const sampleCount = scholarships.filter(s => s.is_sample).length;

  // Filtered scholarships
  const filtered = scholarships.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.provider.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // New scholarship form initial state
  const initialNewSch: Scholarship = {
    id: `sch-${Date.now()}`,
    name: '',
    provider: '',
    description: '',
    eligible_courses: ['Engineering', 'Computer Science'],
    education_level: ['Undergraduate'],
    min_marks: 60,
    max_family_income: 500000,
    eligible_states: ['All India'],
    applicable_categories: ['General', 'OBC', 'SC', 'ST', 'EWS'],
    gender_preference: 'All',
    disability_friendly: true,
    award_amount: '₹50,000 / year',
    award_amount_val: 50000,
    application_deadline: '2026-12-31',
    required_documents: ['Standard Marksheets', 'Family Income Certificate', 'Aadhaar Card'],
    official_url: 'https://scholarships.gov.in',
    eligibility_conditions: ['Full-time enrolled student', 'Family income within threshold'],
    is_sample: false,
    verification_status: 'Verified Official Scheme'
  };

  const [formData, setFormData] = useState<Scholarship>(initialNewSch);

  const handleOpenAdd = () => {
    setFormData({ ...initialNewSch, id: `sch-custom-${Date.now()}` });
    setShowAddModal(true);
    setEditingSch(null);
  };

  const handleOpenEdit = (sch: Scholarship) => {
    setFormData({ ...sch });
    setEditingSch(sch);
    setShowAddModal(true);
  };

  const handleSaveScholarship = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSch) {
      onUpdateScholarship(formData);
    } else {
      onAddScholarship(formData);
    }
    setShowAddModal(false);
  };

  const toggleVerification = (sch: Scholarship) => {
    const updated: Scholarship = {
      ...sch,
      is_sample: !sch.is_sample,
      verification_status: sch.is_sample ? 'Verified Official Scheme' : 'Demonstration / Sample Record'
    };
    onUpdateScholarship(updated);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white rounded-xl p-5 border border-purple-900/50 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-purple-500/20 text-purple-300 rounded-lg border border-purple-500/30">
              <ShieldAlert className="w-5 h-5 text-purple-400" />
            </span>
            <h1 className="text-xl font-bold tracking-tight text-white">
              Scholarship Administrator & Verification Portal
            </h1>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Manage scheme datasets, add verified government or foundation opportunities, and audit sample records
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportScholarshipDatasetToCSV(scholarships)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold shadow-xs transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            Export Master Dataset
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-purple-600/30 transition"
          >
            <PlusCircle className="w-4 h-4" />
            Add Scholarship
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Total Catalog Records
          </span>
          <p className="text-2xl font-bold text-slate-900 mt-0.5">{totalCount}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Active in recommendation engine</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Verified Schemes
          </span>
          <p className="text-2xl font-bold text-slate-900 mt-0.5">{verifiedCount}</p>
          <p className="text-[11px] text-emerald-600 mt-0.5">Direct government & trust portals</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
            Demonstration Records
          </span>
          <p className="text-2xl font-bold text-slate-900 mt-0.5">{sampleCount}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Labeled for testing and training</p>
        </div>
      </div>

      {/* Dataset Table & Search */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-slate-900">
            Scholarship Dataset Inventory ({filtered.length} entries)
          </h2>

          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title or provider..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-semibold text-[11px]">
                <th className="py-2.5 px-3">Title & Provider</th>
                <th className="py-2.5 px-3">Eligibility Cutoffs</th>
                <th className="py-2.5 px-3">Grant & Deadline</th>
                <th className="py-2.5 px-3">Verification Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((sch) => (
                <tr key={sch.id} className="hover:bg-slate-50/50 transition">
                  <td className="py-3 px-3 max-w-xs">
                    <div className="font-bold text-slate-900 line-clamp-1">{sch.name}</div>
                    <div className="text-[11px] text-slate-500 truncate">{sch.provider}</div>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <div>Min Marks: <strong className="text-slate-800">{sch.min_marks}%</strong></div>
                    <div className="text-[11px] text-slate-500">
                      Income: {sch.max_family_income ? `≤ ₹${(sch.max_family_income / 100000).toFixed(1)}L` : 'Open'}
                    </div>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <div className="font-semibold text-emerald-700">{sch.award_amount}</div>
                    <div className="text-[11px] text-slate-500">{sch.application_deadline}</div>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <button
                      onClick={() => toggleVerification(sch)}
                      title="Click to toggle verification status"
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border transition ${
                        sch.is_sample
                          ? 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                      }`}
                    >
                      {sch.is_sample ? (
                        <>Sample Demo (Click to Verify)</>
                      ) : (
                        <>
                          <ShieldCheck className="w-3 h-3 text-blue-600" />
                          Verified Official
                        </>
                      )}
                    </button>
                  </td>
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(sch)}
                        className="p-1 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit scholarship"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteScholarship(sch.id)}
                        className="p-1 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded"
                        title="Delete scholarship"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between shrink-0">
              <h2 className="text-base font-bold">
                {editingSch ? 'Edit Scholarship Record' : 'Add New Scholarship Record'}
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveScholarship} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Scholarship Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Funding Ministry / Provider *</label>
                  <input
                    type="text"
                    required
                    value={formData.provider}
                    onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Overview Description *</label>
                  <textarea
                    rows={2}
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Min Marks Cut-off (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="100"
                    required
                    value={formData.min_marks}
                    onChange={(e) => setFormData({ ...formData, min_marks: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Max Annual Family Income (₹)</label>
                  <input
                    type="number"
                    step="50000"
                    min="0"
                    value={formData.max_family_income || ''}
                    placeholder="Leave blank for no ceiling"
                    onChange={(e) => setFormData({ ...formData, max_family_income: e.target.value ? parseFloat(e.target.value) : null })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Award Amount Label</label>
                  <input
                    type="text"
                    required
                    value={formData.award_amount}
                    onChange={(e) => setFormData({ ...formData, award_amount: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Application Deadline (YYYY-MM-DD)</label>
                  <input
                    type="date"
                    required
                    value={formData.application_deadline}
                    onChange={(e) => setFormData({ ...formData, application_deadline: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Official Application Link (Verified URL)</label>
                  <input
                    type="url"
                    required
                    value={formData.official_url}
                    onChange={(e) => setFormData({ ...formData, official_url: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer mt-1 font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={formData.is_sample}
                      onChange={(e) => setFormData({ ...formData, is_sample: e.target.checked })}
                      className="rounded text-purple-600 focus:ring-purple-500"
                    />
                    <span>Mark as Demonstration / Sample Record</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-semibold shadow-xs"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
