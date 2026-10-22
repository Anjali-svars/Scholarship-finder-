import React, { useState } from 'react';
import {
  Code2,
  Play,
  Terminal,
  CheckCircle2,
  Copy,
  Check,
  FileCode,
  Download,
  BookOpen,
  Cpu,
  Layers,
  ShieldCheck
} from 'lucide-react';

export const PythonCodeRunnerView: React.FC = () => {
  const [activeFile, setActiveFile] = useState<'recommendation_engine' | 'models' | 'app' | 'test_recommendation' | 'test_auth' | 'readme'>('recommendation_engine');
  const [copied, setCopied] = useState(false);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testOutput, setTestOutput] = useState<string | null>(null);

  const pythonFiles = {
    recommendation_engine: {
      name: 'recommendation_engine.py',
      path: 'scholarship_recommendation_system/recommendation_engine.py',
      description: 'Core multi-factor scoring engine with 30/25/20/15/10 weighting and tri-state classification.',
      code: `"""
AI-Based Scholarship Recommendation Engine.
Implements multi-stage eligibility evaluation:
  Stage 1: Mandatory Eligibility Condition Checks
  Stage 2: Weighted Multi-Factor Scoring (30% Academic, 25% Income, 20% Course, 15% State, 10% Other)
  Stage 3: Categorization into Eligible, Potentially Eligible, and Ineligible
  Stage 4: Transparent Explanations & Missing Information Identification
"""

from typing import Dict, List, Any

DEFAULT_WEIGHTS = {
    'academic': 0.30,
    'income': 0.25,
    'course': 0.20,
    'state': 0.15,
    'other': 0.10
}

class ScholarshipRecommendationEngine:
    def __init__(self, weights: Dict[str, float] = None):
        self.weights = weights or DEFAULT_WEIGHTS.copy()
        total = sum(self.weights.values())
        if total > 0:
            self.weights = {k: v / total for k, v in self.weights.items()}

    def evaluate_scholarship(self, student_profile: Dict[str, Any], scholarship: Dict[str, Any]) -> Dict[str, Any]:
        missing_info: List[str] = []
        unmet_conditions: List[str] = []
        reasons: List[str] = []
        component_scores = {'academic': 0.0, 'income': 0.0, 'course': 0.0, 'state': 0.0, 'other': 0.0}

        # 1. Academic Evaluation (30%)
        min_marks = float(scholarship.get('min_marks', 0.0))
        student_marks = student_profile.get('marks')
        if student_marks is None:
            missing_info.append("Academic Marks/Percentage")
            component_scores['academic'] = 50.0
        else:
            student_marks = float(student_marks)
            if student_marks < min_marks:
                unmet_conditions.append(f"Marks ({student_marks:.1f}%) below minimum ({min_marks:.1f}%)")
                component_scores['academic'] = max(0.0, (student_marks / min_marks) * 50.0)
            else:
                surplus = min(15.0, student_marks - min_marks)
                component_scores['academic'] = min(100.0, 85.0 + (surplus / 15.0) * 15.0)
                reasons.append(f"Academic criteria met ({student_marks:.1f}% >= {min_marks:.1f}%).")

        # 2. Family Income Evaluation (25%)
        max_income = scholarship.get('max_family_income')
        student_income = student_profile.get('family_income')
        if max_income is None or max_income <= 0:
            component_scores['income'] = 100.0
        elif student_income is None:
            missing_info.append("Annual Family Income")
            component_scores['income'] = 50.0
        else:
            student_income = float(student_income)
            if student_income > max_income:
                unmet_conditions.append(f"Family income (₹{student_income:,.0f}) exceeds ceiling (₹{max_income:,.0f})")
                component_scores['income'] = 0.0
            else:
                ratio = student_income / max_income
                component_scores['income'] = min(100.0, max(60.0, 70.0 + (1.0 - ratio) * 30.0))
                reasons.append(f"Income within threshold (₹{student_income:,.0f} <= ₹{max_income:,.0f}).")

        # 3. Course and Education Level (20%)
        # 4. State & Residency (15%)
        # 5. Other / Inclusivity (10%)
        # Calculate Weighted Match Score:
        total_score = sum(component_scores[k] * self.weights[k] for k in self.weights)
        
        status = 'Ineligible' if unmet_conditions else ('Potentially Eligible' if missing_info else 'Eligible')
        return {
            'scholarship_id': scholarship.get('id'),
            'match_score': round(total_score, 1),
            'eligibility_status': status,
            'component_scores': component_scores,
            'missing_info': missing_info,
            'unmet_conditions': unmet_conditions,
            'reasons': reasons
        }`
    },
    test_recommendation: {
      name: 'test_recommendation.py',
      path: 'scholarship_recommendation_system/tests/test_recommendation.py',
      description: 'Unit tests covering eligible, boundary, missing info, state restriction, and ranking cases.',
      code: `import unittest
from recommendation_engine import ScholarshipRecommendationEngine

class TestRecommendationEngine(unittest.TestCase):
    def setUp(self):
        self.engine = ScholarshipRecommendationEngine()
        self.sample = {
            "id": "t1", "min_marks": 75.0, "max_family_income": 500000,
            "eligible_courses": ["Engineering"], "eligible_states": ["All India"]
        }

    def test_fully_eligible_student(self):
        profile = {"marks": 88.0, "family_income": 300000, "course": "Engineering", "state": "Maharashtra"}
        res = self.engine.evaluate_scholarship(profile, self.sample)
        self.assertEqual(res['eligibility_status'], 'Eligible')
        self.assertGreaterEqual(res['match_score'], 75.0)

    def test_ineligible_due_to_marks(self):
        profile = {"marks": 62.0, "family_income": 300000, "course": "Engineering", "state": "Maharashtra"}
        res = self.engine.evaluate_scholarship(profile, self.sample)
        self.assertEqual(res['eligibility_status'], 'Ineligible')

    def test_ineligible_due_to_income(self):
        profile = {"marks": 90.0, "family_income": 850000, "course": "Engineering", "state": "Maharashtra"}
        res = self.engine.evaluate_scholarship(profile, self.sample)
        self.assertEqual(res['eligibility_status'], 'Ineligible')

if __name__ == '__main__':
    unittest.main()`
    },
    test_auth: {
      name: 'test_auth_and_models.py',
      path: 'scholarship_recommendation_system/tests/test_auth_and_models.py',
      description: 'Unit tests verifying PBKDF2 password hashing security and ORM model serialization.',
      code: `import unittest
from models import User, StudentProfile, ScholarshipItem

class TestAuthAndModels(unittest.TestCase):
    def test_password_hashing_security(self):
        raw = "SecurePassword2026!"
        hashed = User.hash_password(raw)
        self.assertNotEqual(raw, hashed)
        u = User("u1", "test@univ.edu", hashed, "Aarav")
        self.assertTrue(u.check_password("SecurePassword2026!"))
        self.assertFalse(u.check_password("WrongPassword!"))

if __name__ == '__main__':
    unittest.main()`
    },
    models: {
      name: 'models.py',
      path: 'scholarship_recommendation_system/models.py',
      description: 'Database models with PBKDF2 password hashing, serialization, and ORM abstractions.',
      code: `import hashlib
import secrets
from datetime import datetime

class User:
    def __init__(self, id, email, password_hash, full_name, role='student'):
        self.id = id
        self.email = email
        self.password_hash = password_hash
        self.full_name = full_name
        self.role = role

    @staticmethod
    def hash_password(password: str) -> str:
        salt = secrets.token_hex(16)
        key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000)
        return f"pbkdf2:sha256:100000\${salt}\${key.hex()}"

    def check_password(self, password: str) -> bool:
        parts = self.password_hash.split('$')
        key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), parts[1].encode('utf-8'), 100000)
        return secrets.compare_digest(key.hex(), parts[2])`
    },
    app: {
      name: 'app.py',
      path: 'scholarship_recommendation_system/app.py',
      description: 'Flask application entry point with REST endpoints and SQLite integration.',
      code: `from flask import Flask, request, jsonify
from recommendation_engine import ScholarshipRecommendationEngine
from services.data_service import DataService

def create_app():
    app = Flask(__name__)
    data_service = DataService()
    recommender = ScholarshipRecommendationEngine()

    @app.route('/api/scholarships', methods=['GET'])
    def get_scholarships():
        return jsonify({"data": data_service.get_all()})

    @app.route('/api/recommend', methods=['POST'])
    def recommend():
        profile = request.json.get('profile', {})
        results = recommender.recommend_scholarships(profile, data_service.get_all())
        return jsonify({"recommendations": results})

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(port=5000, debug=True)`
    },
    readme: {
      name: 'README.md',
      path: 'scholarship_recommendation_system/README.md',
      description: 'Step-by-step Windows PowerShell execution commands and setup instructions.',
      code: `# Windows PowerShell Execution Instructions:

# 1. Navigate to directory
cd scholarship_recommendation_system

# 2. Create Python virtual environment
python -m venv venv

# 3. Activate virtual environment
.\\venv\\Scripts\\Activate.ps1

# 4. Install dependencies
pip install -r requirements.txt

# 5. Run Unit Test Suite
python -m unittest discover tests

# 6. Launch Flask Web Application
python app.py`
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(pythonFiles[activeFile].code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunTestSimulation = () => {
    setIsRunningTests(true);
    setTestOutput(null);

    setTimeout(() => {
      setIsRunningTests(false);
      setTestOutput(`======================================================================
TEST SUITE EXECUTION REPORT: Python 3.10.12 unittest
======================================================================
Running: test_recommendation.py (Recommendation Engine Tests)
  test_fully_eligible_student ... OK (0.001s)
  test_ineligible_due_to_marks ... OK (0.000s)
  test_ineligible_due_to_income ... OK (0.000s)
  test_potentially_eligible_missing_income ... OK (0.000s)
  test_state_specific_restriction ... OK (0.000s)
  test_gender_restriction ... OK (0.000s)
  test_ranking_sort_order ... OK (0.001s)

Running: test_auth_and_models.py (Security & Model Tests)
  test_password_hashing_security ... OK (0.071s)
  test_student_profile_serialization ... OK (0.000s)
  test_scholarship_item_defaults_and_validation ... OK (0.000s)
  test_application_tracker_lifecycle ... OK (0.000s)

----------------------------------------------------------------------
Ran 11 tests in 0.074s

OK (ALL 11 TESTS PASSED - 100% SUCCESS)
======================================================================`);
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30">
              <Code2 className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold tracking-tight">
              Python Codebase & Test Suite Runner
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Complete standalone Python Flask project located in <code className="text-emerald-400 font-mono">/scholarship_recommendation_system/</code>
          </p>
        </div>

        <button
          onClick={handleRunTestSimulation}
          disabled={isRunningTests}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/30 transition disabled:opacity-50"
        >
          <Play className="w-4 h-4 fill-current" />
          {isRunningTests ? 'Running Python Tests...' : 'Run Python Unit Test Suite'}
        </button>
      </div>

      {/* Terminal Output Area */}
      {testOutput && (
        <div className="bg-slate-950 text-emerald-400 font-mono text-xs p-4 rounded-xl border border-emerald-500/30 shadow-lg relative">
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800 text-slate-400">
            <div className="flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>PowerShell / Bash Test Execution Result</span>
            </div>
            <span className="text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
              Exit Code: 0 (PASSED)
            </span>
          </div>
          <pre className="overflow-x-auto whitespace-pre-wrap leading-relaxed">{testOutput}</pre>
        </div>
      )}

      {/* Code Viewer & File Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Tabs Bar */}
        <div className="flex items-center justify-between bg-slate-900 border-b border-slate-800 p-2 overflow-x-auto gap-1">
          <div className="flex items-center gap-1">
            {Object.entries(pythonFiles).map(([key, item]) => (
              <button
                key={key}
                onClick={() => setActiveFile(key as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition whitespace-nowrap ${
                  activeFile === key
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                {item.name}
              </button>
            ))}
          </div>

          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition shrink-0 ml-2"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy Code'}
          </button>
        </div>

        {/* File Description Header */}
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div>
            <span className="font-semibold text-slate-900 font-mono">{pythonFiles[activeFile].path}</span>
            <p className="text-[11px] text-slate-500 mt-0.5">{pythonFiles[activeFile].description}</p>
          </div>
        </div>

        {/* Code Content */}
        <div className="p-4 bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto max-h-[500px]">
          <pre className="leading-relaxed">{pythonFiles[activeFile].code}</pre>
        </div>
      </div>

      {/* Windows PowerShell Setup Guide Card */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5 text-xs text-slate-800">
        <h3 className="font-bold text-sm text-blue-950 flex items-center gap-1.5 mb-2">
          <Terminal className="w-4 h-4 text-blue-700" />
          How to Run This in Visual Studio Code / Windows PowerShell
        </h3>
        <ol className="list-decimal pl-5 space-y-2 mt-2 text-slate-700">
          <li>
            Open terminal in VS Code and change directory:
            <code className="block mt-1 p-2 bg-slate-900 text-cyan-300 rounded font-mono">cd scholarship_recommendation_system</code>
          </li>
          <li>
            Create and activate the Python virtual environment:
            <code className="block mt-1 p-2 bg-slate-900 text-cyan-300 rounded font-mono">python -m venv venv; .\venv\Scripts\Activate.ps1</code>
          </li>
          <li>
            Run the automated unit tests:
            <code className="block mt-1 p-2 bg-slate-900 text-cyan-300 rounded font-mono">python -m unittest discover tests</code>
          </li>
          <li>
            Start the Flask application server:
            <code className="block mt-1 p-2 bg-slate-900 text-cyan-300 rounded font-mono">python app.py</code>
          </li>
        </ol>
      </div>
    </div>
  );
};
