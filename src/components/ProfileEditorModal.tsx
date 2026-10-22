import React, { useState, useEffect } from 'react';
import {
  X,
  UserCheck,
  CheckCircle,
  GraduationCap,
  Building,
  MapPin,
  Percent,
  IndianRupee,
  Award,
  AlertCircle
} from 'lucide-react';
import { StudentProfile, EducationLevel, Category } from '../types/scholarship';

interface ProfileEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: StudentProfile;
  onSaveProfile: (updatedProfile: StudentProfile) => void;
}

export const ProfileEditorModal: React.FC<ProfileEditorModalProps> = ({
  isOpen,
  onClose,
  currentProfile,
  onSaveProfile
}) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState<StudentProfile>({ ...currentProfile });
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    setFormData({ ...currentProfile });
  }, [currentProfile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name.trim()) {
      setErrorMsg('Full name is required.');
      return;
    }
    if (isNaN(formData.marks) || formData.marks < 0 || formData.marks > 100) {
      setErrorMsg('Academic marks must be between 0 and 100%.');
      return;
    }
    if (isNaN(formData.family_income) || formData.family_income < 0) {
      setErrorMsg('Annual family income must be a valid positive amount.');
      return;
    }

    setErrorMsg('');
    onSaveProfile(formData);
    onClose();
  };

  const educationLevels: EducationLevel[] = ['High School', 'Diploma', 'Undergraduate', 'Postgraduate', 'Doctoral'];
  const categories: Category[] = ['General', 'OBC', 'SC', 'ST', 'EWS', 'Minority'];
  const states = [
    'All India',
    'Maharashtra',
    'Karnataka',
    'West Bengal',
    'Telangana',
    'Delhi',
    'Tamil Nadu',
    'Uttar Pradesh',
    'Gujarat',
    'Kerala',
    'Rajasthan',
    'Madhya Pradesh',
    'Punjab'
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">Edit Student Eligibility Profile</h2>
              <p className="text-xs text-slate-400">
                Updating your profile immediately recalculates AI scholarship match scores
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Personal Details */}
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2.5">
              1. Personal & Demographic Data
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Student Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">State of Domicile / Residence *</label>
                <select
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs focus:ring-1 focus:ring-blue-500"
                >
                  {states.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Social Category (Caste / EWS) *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs focus:ring-1 focus:ring-blue-500"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Academic & Institutional */}
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2.5">
              2. Academic Standing & Institution
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Current Education Level</label>
                <select
                  value={formData.education_level}
                  onChange={(e) => setFormData({ ...formData, education_level: e.target.value as EducationLevel })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs focus:ring-1 focus:ring-blue-500"
                >
                  {educationLevels.map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Course / Major Stream *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Computer Science, Medicine, Pure Sciences"
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">College / University Name</label>
                <input
                  type="text"
                  placeholder="e.g. National Institute of Technology"
                  value={formData.institution}
                  onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Academic Marks / Percentage (0-100%) *</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  required
                  value={formData.marks}
                  onChange={(e) => setFormData({ ...formData, marks: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs focus:ring-1 focus:ring-blue-500 font-bold"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Financial Need & Inclusivity */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
              3. Financial Need & Special Considerations
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Annual Family Income (in INR ₹) *
                </label>
                <input
                  type="number"
                  step="10000"
                  min="0"
                  required
                  value={formData.family_income}
                  onChange={(e) => setFormData({ ...formData, family_income: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs focus:ring-1 focus:ring-blue-500 font-bold text-emerald-800"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Current: ₹{formData.family_income.toLocaleString('en-IN')} (₹{(formData.family_income / 100000).toFixed(2)} Lakh)
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Disability Status (Benchmark &gt;=40%)
                </label>
                <select
                  value={formData.disability_status ? 'yes' : 'no'}
                  onChange={(e) => setFormData({ ...formData, disability_status: e.target.value === 'yes' })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs focus:ring-1 focus:ring-blue-500"
                >
                  <option value="no">No</option>
                  <option value="yes">Yes (Eligible for PwD reserved grants)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Key Achievements / Background (Olympiads, Sports, First-Gen, Hackathons)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. State rank in Math Olympiad, First in family to attend college, Research paper author..."
                  value={formData.achievements}
                  onChange={(e) => setFormData({ ...formData, achievements: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md transition flex items-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              Save Profile & Recalculate Matches
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
