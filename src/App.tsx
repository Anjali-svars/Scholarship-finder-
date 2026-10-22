import React, { useState, useMemo, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Scholarship,
  StudentProfile,
  EvaluationResult,
  ApplicationTrackerItem,
  ScoringWeights,
  ApplicationStatus
} from './types/scholarship';
import { INITIAL_SCHOLARSHIPS, DEMO_PROFILES } from './data/initialScholarships';
import { DEFAULT_WEIGHTS, rankScholarships } from './services/recommendationEngine';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { RecommendationsView } from './components/RecommendationsView';
import { DirectoryView } from './components/DirectoryView';
import { TrackerView } from './components/TrackerView';
import { ProfileEditorModal } from './components/ProfileEditorModal';
import { ScholarshipDetailModal } from './components/ScholarshipDetailModal';
import { AdminPortalView } from './components/AdminPortalView';
import { PythonCodeRunnerView } from './components/PythonCodeRunnerView';

export default function App() {
  // Navigation active tab
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Student Persona & Profile state
  const [profileKey, setProfileKey] = useState<string>('aarav');
  const [currentProfile, setCurrentProfile] = useState<StudentProfile>(DEMO_PROFILES['aarav']);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Admin Mode state
  const [isAdmin, setIsAdmin] = useState(false);

  // Scholarships Dataset state (loaded with initial scholarships, with localStorage persistence)
  const [scholarships, setScholarships] = useState<Scholarship[]>(() => {
    try {
      const saved = localStorage.getItem('scholarai_dataset');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // fallback
    }
    return INITIAL_SCHOLARSHIPS;
  });

  // Scoring Weights state
  const [weights, setWeights] = useState<ScoringWeights>(DEFAULT_WEIGHTS);

  // Application Pipeline Tracker state
  const [trackerItems, setTrackerItems] = useState<ApplicationTrackerItem[]>(() => {
    try {
      const saved = localStorage.getItem('scholarai_tracker');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // fallback
    }
    // Default initial tracking item
    return [
      {
        id: 't-1',
        scholarship_id: 'sch-001',
        scholarship_name: 'Central Sector Scheme of Scholarships for College & University Students',
        provider: 'Department of Higher Education, Ministry of Education',
        award_amount: '₹20,000 / year',
        deadline: '2026-11-30',
        status: 'Applied',
        notes: 'Submitted on National Scholarship Portal (NSP). Awaiting college verification.',
        application_ref: 'NSP-2026-88192',
        applied_date: '2026-10-18',
        checked_documents: ['Class 12th Board Marksheet', 'Income Certificate', 'Aadhaar Card'],
        updated_at: '2026-10-18T10:00:00Z'
      },
      {
        id: 't-2',
        scholarship_id: 'sch-006',
        scholarship_name: 'ONGC Foundation Scholarship for Meritorious Economically Weaker Students',
        provider: 'Oil and Natural Gas Corporation (ONGC) Foundation',
        award_amount: '₹48,000 / year',
        deadline: '2026-12-10',
        status: 'Preparing Documents',
        notes: 'Income certificate verified by Tehsildar received; college bonafide requested.',
        application_ref: '',
        applied_date: '',
        checked_documents: ['Standard 12th / Graduation Marksheet'],
        updated_at: '2026-10-20T14:30:00Z'
      }
    ];
  });

  // Selected scholarship for detail modal
  const [selectedEvaluation, setSelectedEvaluation] = useState<EvaluationResult | null>(null);

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('scholarai_dataset', JSON.stringify(scholarships));
    } catch (e) {}
  }, [scholarships]);

  useEffect(() => {
    try {
      localStorage.setItem('scholarai_tracker', JSON.stringify(trackerItems));
    } catch (e) {}
  }, [trackerItems]);

  // Handle persona switch
  const handlePersonaSwitch = (key: string) => {
    setProfileKey(key);
    if (DEMO_PROFILES[key]) {
      setCurrentProfile({ ...DEMO_PROFILES[key] });
    }
  };

  // Recalculate recommendation engine results whenever profile, scholarships, or weights change
  const recommendations: EvaluationResult[] = useMemo(() => {
    return rankScholarships(currentProfile, scholarships, weights);
  }, [currentProfile, scholarships, weights]);

  // Add scholarship to tracker
  const handleAddToTracker = (scholarshipId: string) => {
    const sch = scholarships.find(s => s.id === scholarshipId);
    if (!sch) return;

    if (trackerItems.some(t => t.scholarship_id === scholarshipId)) return;

    const newItem: ApplicationTrackerItem = {
      id: `t-${Date.now()}`,
      scholarship_id: sch.id,
      scholarship_name: sch.name,
      provider: sch.provider,
      award_amount: sch.award_amount,
      deadline: sch.application_deadline,
      status: 'Interested',
      notes: 'Added from AI recommendations list.',
      application_ref: '',
      applied_date: '',
      checked_documents: [],
      updated_at: new Date().toISOString()
    };

    setTrackerItems(prev => [newItem, ...prev]);

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.85 }
    });
  };

  // Update status in tracker
  const handleUpdateTrackerStatus = (id: string, newStatus: ApplicationStatus) => {
    setTrackerItems(prev =>
      prev.map(item => (item.id === id ? { ...item, status: newStatus, updated_at: new Date().toISOString() } : item))
    );

    if (newStatus === 'Awarded') {
      confetti({
        particleCount: 100,
        spread: 90,
        origin: { y: 0.6 }
      });
    }
  };

  // Update tracker item fields (notes, ref)
  const handleUpdateTrackerItem = (id: string, updates: Partial<ApplicationTrackerItem>) => {
    setTrackerItems(prev =>
      prev.map(item => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  // Remove tracker item
  const handleRemoveTrackerItem = (id: string) => {
    setTrackerItems(prev => prev.filter(item => item.id !== id));
  };

  // Admin dataset handlers
  const handleAddScholarship = (newSch: Scholarship) => {
    setScholarships(prev => [newSch, ...prev]);
  };

  const handleUpdateScholarship = (updatedSch: Scholarship) => {
    setScholarships(prev =>
      prev.map(s => (s.id === updatedSch.id ? updatedSch : s))
    );
  };

  const handleDeleteScholarship = (id: string) => {
    setScholarships(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentProfile={currentProfile}
        profileKey={profileKey}
        setProfileKey={handlePersonaSwitch}
        isAdmin={isAdmin}
        setIsAdmin={setIsAdmin}
        openProfileModal={() => setIsProfileModalOpen(true)}
        trackerCount={trackerItems.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            studentProfile={currentProfile}
            recommendations={recommendations}
            trackerItems={trackerItems}
            onViewScholarship={(evalRes) => setSelectedEvaluation(evalRes)}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onOpenProfile={() => setIsProfileModalOpen(true)}
          />
        )}

        {activeTab === 'recommendations' && (
          <RecommendationsView
            recommendations={recommendations}
            studentProfile={currentProfile}
            weights={weights}
            onUpdateWeights={(newWeights) => setWeights(newWeights)}
            onResetWeights={() => setWeights(DEFAULT_WEIGHTS)}
            onViewScholarship={(evalRes) => setSelectedEvaluation(evalRes)}
            onAddToTracker={handleAddToTracker}
            trackerItems={trackerItems}
          />
        )}

        {activeTab === 'directory' && (
          <DirectoryView
            scholarships={scholarships}
            recommendations={recommendations}
            onViewScholarship={(evalRes) => setSelectedEvaluation(evalRes)}
            onAddToTracker={handleAddToTracker}
            trackerItems={trackerItems}
          />
        )}

        {activeTab === 'tracker' && (
          <TrackerView
            trackerItems={trackerItems}
            studentProfile={currentProfile}
            onUpdateStatus={handleUpdateTrackerStatus}
            onUpdateItem={handleUpdateTrackerItem}
            onRemoveItem={handleRemoveTrackerItem}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'admin' && (
          <AdminPortalView
            scholarships={scholarships}
            onAddScholarship={handleAddScholarship}
            onUpdateScholarship={handleUpdateScholarship}
            onDeleteScholarship={handleDeleteScholarship}
          />
        )}

        {activeTab === 'python-code' && (
          <PythonCodeRunnerView />
        )}
      </main>

      {/* Scholarship Detail & Guidance Modal */}
      <ScholarshipDetailModal
        result={selectedEvaluation}
        onClose={() => setSelectedEvaluation(null)}
        onAddToTracker={handleAddToTracker}
        trackerItems={trackerItems}
      />

      {/* Profile Editor Modal */}
      <ProfileEditorModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentProfile={currentProfile}
        onSaveProfile={(updated) => {
          setCurrentProfile(updated);
        }}
      />

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-6 text-xs mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <p className="font-semibold text-slate-300">
              AI-Based Scholarship Recommendation System for Students Using Python
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Multi-factor weighted scoring model: 30% Academic &bull; 25% Family Income &bull; 20% Course/Level &bull; 15% State Domicile &bull; 10% Other Inclusivity
            </p>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => setActiveTab('python-code')}
              className="hover:text-cyan-400 transition"
            >
              Inspect Python Source & Tests
            </button>
            <span>&bull;</span>
            <button
              onClick={() => setActiveTab('admin')}
              className="hover:text-purple-400 transition"
            >
              Admin Portal
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
