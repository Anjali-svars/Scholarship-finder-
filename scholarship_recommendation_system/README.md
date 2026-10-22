# AI-Based Scholarship Recommendation System for Students Using Python

An intelligent, transparent scholarship matching and decision support platform engineered in Python. It evaluates multi-factor criteria including academic performance, annual family income, course/discipline, state residency, social category, and disability considerations.

---

## 1. Key Features
- **Mandatory Eligibility Rule Engine**: Pre-filters non-qualifying records to guarantee students do not apply for ineligible grants.
- **Weighted Match Scoring Algorithm**:
  - **Academic Performance**: 30% (evaluates GPA/percentage against cut-offs with proportional scaling)
  - **Family Income Need**: 25% (prioritizes low-income brackets below defined ceiling)
  - **Course & Education Level**: 20% (aligns program major and degree level)
  - **State & Domicile**: 15% (checks Pan-India vs regional state residency)
  - **Other Inclusion Criteria**: 10% (gender affirmative action, social category, disability)
- **Tri-State Classification**:
  - `Eligible`: Fully satisfies all mandatory criteria.
  - `Potentially Eligible`: Borderline index or missing non-critical documentation.
  - `Ineligible`: Explicitly violates a mandatory constraint with clear diagnostic explanation.
- **Application Tracking Pipeline**: Manage scholarships through stages: `Interested` &rarr; `Preparing Documents` &rarr; `Applied` &rarr; `Result Awaited` &rarr; `Awarded`.
- **Administrative Portal**: Add, audit, verify, toggle sample/verified tags, and remove scholarship listings.
- **Report Export**: Download CSV exports of matches and application pipelines.

---

## 2. Technology Stack
- **Backend**: Python 3.10+ / Flask / SQLAlchemy
- **Data & Algorithmic Analysis**: NumPy, Pandas, Scikit-learn
- **Frontend / Visualization**: Modern Responsive UI, Chart.js, Lucide Icons, Bootstrap/Tailwind design tokens
- **Testing**: Python `unittest` / `pytest` test suites

---

## 3. Local Installation & Execution (Windows PowerShell / VS Code)

Follow these exact commands in your terminal or Visual Studio Code PowerShell:

### Step 1: Open project directory
```powershell
cd scholarship_recommendation_system
```

### Step 2: Create a virtual environment
```powershell
python -m venv venv
```

### Step 3: Activate the virtual environment
```powershell
.\venv\Scripts\Activate.ps1
```
*(If script execution is restricted on Windows, run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` first)*

### Step 4: Install dependencies
```powershell
pip install -r requirements.txt
```

### Step 5: Run Unit Test Suite
```powershell
python -m unittest discover -s tests -t .
```
*Or run test modules individually:*
```powershell
python tests/test_recommendation.py
python tests/test_auth_and_models.py
```
*All 11 tests in `tests/test_recommendation.py` and `tests/test_auth_and_models.py` will execute and display passing assertions.*

### Step 6: Start the Flask Application
```powershell
python app.py
```
*The Flask server will start at `http://127.0.0.1:5000`.*

---

## 4. Test Accounts

| Role | Email | Password | Details |
|------|-------|----------|---------|
| **Student (B.Tech)** | `student@demo.edu` | `Student123!` | 84.5%, Family income ₹3,20,000, OBC, Maharashtra |
| **Student (B.Sc/Med)**| `ananya@demo.edu` | `Student123!` | 88.0%, Family income ₹4,50,000, General, West Bengal |
| **Administrator** | `admin@scholarships.edu`| `AdminPass123!` | Full administrative privileges |

---

## 5. Adding Verified Scholarship Records
When inserting new records via the Admin panel or data seed:
1. Always populate the official application URL directing to government (`.gov.in`, `.nic.in`) or verified philanthropic trust domains.
2. Label demonstration scholarships with `is_sample: true` and official grants with `is_sample: false`.
3. Specify realistic deadlines and list mandatory document checklists so applicants have complete guidance.
