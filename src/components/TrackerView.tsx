import React, { useState } from 'react';
import {
  BookmarkCheck,
  Calendar,
  FileText,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  Trash2,
  Edit3,
  ExternalLink,
  PlusCircle,
  Tag,
  AlertCircle
} from 'lucide-react';
import { ApplicationTrackerItem, ApplicationStatus, StudentProfile } from '../types/scholarship';
import { exportTrackerToCSV } from '../utils/csvExport';

interface TrackerViewProps {
  trackerItems: ApplicationTrackerItem[];
  studentProfile: StudentProfile;
  onUpdateStatus: (id: string, newStatus: ApplicationStatus) => void;
  onUpdateItem: (id: string, updates: Partial<ApplicationTrackerItem>) => void;
  onRemoveItem: (id: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const TrackerView: React.FC<TrackerViewProps> = ({
  trackerItems,
  studentProfile,
  onUpdateStatus,
  onUpdateItem,
  onRemoveItem,
  onNavigateTab
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [editAppRef, setEditAppRef] = useState('');
  const [editAppliedDate, setEditAppliedDate] = useState('');

  const statuses: ApplicationStatus[] = [
    'Interested',
    'Preparing Documents',
    'Applied',
    'Result Awaited',
    'Awarded',
    'Not Awarded'
  ];

  const handleStartEdit = (item: ApplicationTrackerItem) => {
    setEditingId(item.id);
    setEditNotes(item.notes || '');
    setEditAppRef(item.application_ref || '');
    setEditAppliedDate(item.applied_date || '');
  };

  const handleSaveEdit = (id: string) => {
    onUpdateItem(id, {
      notes: editNotes,
      application_ref: editAppRef,
      applied_date: editAppliedDate,
      updated_at: new Date().toISOString()
    });
    setEditingId(null);
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'Interested':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Preparing Documents':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Applied':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Result Awaited':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'Awarded':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Not Awarded':
        return 'bg-slate-100 text-slate-800 border-slate-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <BookmarkCheck className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900">
              Scholarship Application Pipeline & Tracker
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track submission deadlines, document readiness, official application reference numbers, and award outcomes
          </p>
        </div>

        <div className="flex items-center gap-2">
          {trackerItems.length > 0 && (
            <button
              onClick={() => exportTrackerToCSV(trackerItems, studentProfile.full_name)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs transition"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Download Tracker CSV
            </button>
          )}

          <button
            onClick={() => onNavigateTab('recommendations')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-xs transition"
          >
            <PlusCircle className="w-4 h-4" />
            Add Scholarships
          </button>
        </div>
      </div>

      {/* Tracker Pipeline Stages Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {statuses.map(st => {
          const count = trackerItems.filter(t => t.status === st).length;
          return (
            <div
              key={st}
              className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs text-center"
            >
              <span className="text-[11px] font-semibold text-slate-500 block truncate">{st}</span>
              <span className="text-xl font-extrabold text-slate-900 mt-0.5 block">{count}</span>
            </div>
          );
        })}
      </div>

      {/* Applications List */}
      {trackerItems.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center">
          <BookmarkCheck className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">Your application pipeline is empty</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
            Discover scholarships matching your profile and bookmark them to begin tracking documents, application deadlines, and submission references.
          </p>
          <button
            onClick={() => onNavigateTab('recommendations')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition shadow-sm"
          >
            Explore AI Recommendations
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {trackerItems.map((item) => {
            const isEditing = editingId === item.id;

            return (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    {/* Scholarship Info */}
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        {/* Status Dropdown */}
                        <select
                          value={item.status}
                          onChange={(e) => onUpdateStatus(item.id, e.target.value as ApplicationStatus)}
                          className={`text-xs font-bold py-1 px-2.5 rounded-full border cursor-pointer ${getStatusBadge(
                            item.status
                          )}`}
                        >
                          {statuses.map(st => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>

                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs font-semibold text-emerald-700">
                          {item.award_amount}
                        </span>

                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          Deadline: {item.deadline}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900">
                        {item.scholarship_name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">{item.provider}</p>

                      {/* Application Reference & Notes Section */}
                      <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs space-y-2">
                        {isEditing ? (
                          <div className="space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                  Application Reference No / Registration ID
                                </label>
                                <input
                                  type="text"
                                  placeholder="e.g. NSP-2026-90412"
                                  value={editAppRef}
                                  onChange={(e) => setEditAppRef(e.target.value)}
                                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                  Applied / Submission Date
                                </label>
                                <input
                                  type="date"
                                  value={editAppliedDate}
                                  onChange={(e) => setEditAppliedDate(e.target.value)}
                                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                Student Tracking Notes / Checklist Progress
                              </label>
                              <textarea
                                rows={2}
                                placeholder="Add notes (e.g., submitted bonafide certificate, awaiting bank validation)..."
                                value={editNotes}
                                onChange={(e) => setEditNotes(e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs"
                              />
                            </div>
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => setEditingId(null)}
                                className="px-3 py-1 bg-slate-200 text-slate-700 rounded text-xs"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleSaveEdit(item.id)}
                                className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-semibold"
                              >
                                Save Changes
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex flex-wrap items-center justify-between gap-2 text-slate-700">
                              <div>
                                <span className="text-slate-500 font-medium">Ref No: </span>
                                <strong className="text-slate-900 font-mono">
                                  {item.application_ref || 'Not registered yet'}
                                </strong>
                              </div>
                              {item.applied_date && (
                                <div>
                                  <span className="text-slate-500 font-medium">Applied on: </span>
                                  <strong className="text-slate-900">{item.applied_date}</strong>
                                </div>
                              )}
                            </div>
                            {item.notes ? (
                              <p className="text-slate-600 italic">"{item.notes}"</p>
                            ) : (
                              <p className="text-slate-400 italic">No custom notes added yet.</p>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex sm:flex-col items-center justify-end gap-2 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0">
                      {!isEditing && (
                        <button
                          onClick={() => handleStartEdit(item)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Update Notes
                        </button>
                      )}

                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-xs font-medium transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
