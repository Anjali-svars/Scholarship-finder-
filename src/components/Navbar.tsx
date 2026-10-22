import React from 'react';
import {
  GraduationCap,
  LayoutDashboard,
  Sparkles,
  Search,
  BookmarkCheck,
  UserCheck,
  ShieldAlert,
  Code2,
  ChevronDown,
  User,
  LogOut,
  Building2
} from 'lucide-react';
import { StudentProfile } from '../types/scholarship';
import { DEMO_PROFILES } from '../data/initialScholarships';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentProfile: StudentProfile;
  setProfileKey: (key: string) => void;
  profileKey: string;
  isAdmin: boolean;
  setIsAdmin: (val: boolean) => void;
  openProfileModal: () => void;
  trackerCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentProfile,
  setProfileKey,
  profileKey,
  isAdmin,
  setIsAdmin,
  openProfileModal,
  trackerCount
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & System Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-white tracking-tight">
                  Scholar<span className="text-cyan-400">AI</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full">
                  Python Engine
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Intelligent Scholarship Recommendation System
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-blue-600/30 text-cyan-300 border border-blue-500/40 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </button>

            <button
              onClick={() => setActiveTab('recommendations')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'recommendations'
                  ? 'bg-blue-600/30 text-cyan-300 border border-blue-500/40 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              AI Recommendations
            </button>

            <button
              onClick={() => setActiveTab('directory')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'directory'
                  ? 'bg-blue-600/30 text-cyan-300 border border-blue-500/40 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Search className="w-4 h-4" />
              Scholarships Directory
            </button>

            <button
              onClick={() => setActiveTab('tracker')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors relative ${
                activeTab === 'tracker'
                  ? 'bg-blue-600/30 text-cyan-300 border border-blue-500/40 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BookmarkCheck className="w-4 h-4 text-emerald-400" />
              Tracker
              {trackerCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 text-[10px] bg-emerald-500 text-slate-950 font-bold rounded-full">
                  {trackerCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'admin'
                  ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-purple-400" />
              Admin Portal
            </button>

            <button
              onClick={() => setActiveTab('python-code')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'python-code'
                  ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Code2 className="w-4 h-4 text-emerald-400" />
              Python Test Suite
            </button>
          </nav>

          {/* User Persona & Role Selector */}
          <div className="flex items-center gap-2">
            {/* Quick Persona Switcher */}
            <div className="relative group">
              <button className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-800/90 hover:bg-slate-700/80 border border-slate-700 rounded-lg text-xs transition">
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center font-bold text-[11px] text-white">
                  {isAdmin ? 'AD' : currentProfile.full_name[0]}
                </div>
                <div className="text-left hidden lg:block">
                  <div className="font-semibold text-slate-200 leading-tight text-[11px]">
                    {isAdmin ? 'Administrator' : currentProfile.full_name}
                  </div>
                  <div className="text-[10px] text-cyan-400 leading-tight">
                    {isAdmin ? 'System Admin' : `${currentProfile.marks}% • ₹${(currentProfile.family_income / 100000).toFixed(1)}L`}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Persona Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 hidden group-hover:block group-focus-within:block z-50">
                <div className="px-2 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  Switch Persona / Role
                </div>

                <div className="space-y-1 mt-1">
                  <button
                    onClick={() => {
                      setIsAdmin(false);
                      setProfileKey('aarav');
                    }}
                    className={`w-full text-left p-2 rounded-lg text-xs flex items-center justify-between transition ${
                      !isAdmin && profileKey === 'aarav'
                        ? 'bg-blue-600/30 text-cyan-300 border border-blue-500/30'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div>
                      <div className="font-medium">Aarav Sharma (B.Tech CS)</div>
                      <div className="text-[10px] text-slate-400">84.5% • OBC • ₹3.2L • Maharashtra</div>
                    </div>
                    {!isAdmin && profileKey === 'aarav' && <span className="text-cyan-400">✓</span>}
                  </button>

                  <button
                    onClick={() => {
                      setIsAdmin(false);
                      setProfileKey('ananya');
                    }}
                    className={`w-full text-left p-2 rounded-lg text-xs flex items-center justify-between transition ${
                      !isAdmin && profileKey === 'ananya'
                        ? 'bg-blue-600/30 text-cyan-300 border border-blue-500/30'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div>
                      <div className="font-medium">Ananya Sen (Pure Science)</div>
                      <div className="text-[10px] text-slate-400">88.0% • General • ₹4.5L • West Bengal</div>
                    </div>
                    {!isAdmin && profileKey === 'ananya' && <span className="text-cyan-400">✓</span>}
                  </button>

                  <button
                    onClick={() => {
                      setIsAdmin(false);
                      setProfileKey('rajesh');
                    }}
                    className={`w-full text-left p-2 rounded-lg text-xs flex items-center justify-between transition ${
                      !isAdmin && profileKey === 'rajesh'
                        ? 'bg-blue-600/30 text-cyan-300 border border-blue-500/30'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div>
                      <div className="font-medium">Rajesh Kumar (Arts / First-Gen)</div>
                      <div className="text-[10px] text-slate-400">68.0% • SC • ₹1.8L • Karnataka</div>
                    </div>
                    {!isAdmin && profileKey === 'rajesh' && <span className="text-cyan-400">✓</span>}
                  </button>

                  <button
                    onClick={() => {
                      setIsAdmin(false);
                      setProfileKey('sneha');
                    }}
                    className={`w-full text-left p-2 rounded-lg text-xs flex items-center justify-between transition ${
                      !isAdmin && profileKey === 'sneha'
                        ? 'bg-blue-600/30 text-cyan-300 border border-blue-500/30'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div>
                      <div className="font-medium">Sneha Reddy (MBBS Medicine)</div>
                      <div className="text-[10px] text-slate-400">81.0% • EWS • ₹4.0L • Telangana</div>
                    </div>
                    {!isAdmin && profileKey === 'sneha' && <span className="text-cyan-400">✓</span>}
                  </button>

                  <div className="border-t border-slate-800 my-1"></div>

                  <button
                    onClick={() => {
                      setIsAdmin(true);
                      setActiveTab('admin');
                    }}
                    className={`w-full text-left p-2 rounded-lg text-xs flex items-center justify-between transition ${
                      isAdmin
                        ? 'bg-purple-600/30 text-purple-300 border border-purple-500/30'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-purple-400" />
                      <div>
                        <div className="font-medium">Admin Mode</div>
                        <div className="text-[10px] text-slate-400">Manage scholarship dataset & audits</div>
                      </div>
                    </div>
                    {isAdmin && <span className="text-purple-400">✓</span>}
                  </button>
                </div>

                {!isAdmin && (
                  <div className="border-t border-slate-800 mt-2 pt-2">
                    <button
                      onClick={openProfileModal}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      Edit My Profile Criteria
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Edit Profile Button */}
            {!isAdmin && (
              <button
                onClick={openProfileModal}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg shadow-sm transition"
              >
                <User className="w-3.5 h-3.5" />
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden flex items-center justify-between overflow-x-auto py-2 border-t border-slate-800 gap-1 text-[11px]">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-2 py-1 rounded whitespace-nowrap ${
              activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'text-slate-400'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`px-2 py-1 rounded whitespace-nowrap ${
              activeTab === 'recommendations' ? 'bg-blue-600 text-white' : 'text-slate-400'
            }`}
          >
            Recommendations
          </button>
          <button
            onClick={() => setActiveTab('directory')}
            className={`px-2 py-1 rounded whitespace-nowrap ${
              activeTab === 'directory' ? 'bg-blue-600 text-white' : 'text-slate-400'
            }`}
          >
            Directory
          </button>
          <button
            onClick={() => setActiveTab('tracker')}
            className={`px-2 py-1 rounded whitespace-nowrap ${
              activeTab === 'tracker' ? 'bg-blue-600 text-white' : 'text-slate-400'
            }`}
          >
            Tracker ({trackerCount})
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`px-2 py-1 rounded whitespace-nowrap ${
              activeTab === 'admin' ? 'bg-purple-600 text-white' : 'text-slate-400'
            }`}
          >
            Admin
          </button>
          <button
            onClick={() => setActiveTab('python-code')}
            className={`px-2 py-1 rounded whitespace-nowrap ${
              activeTab === 'python-code' ? 'bg-emerald-600 text-white' : 'text-slate-400'
            }`}
          >
            Python Tests
          </button>
        </div>
      </div>
    </header>
  );
};
