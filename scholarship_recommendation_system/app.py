"""
AI-Based Scholarship Recommendation System - Flask Application
Backend entrypoint for Python execution with REST APIs and Web Endpoints.
"""

import os
import json
from flask import Flask, request, jsonify, render_template, session, redirect, url_for
from config import Config
from models import User, StudentProfile, ScholarshipItem, ApplicationTrackerItem
from recommendation_engine import ScholarshipRecommendationEngine
from services.data_service import DataService

def create_app(config_class=Config):
    app = Flask(__name__, template_folder='templates', static_folder='static')
    app.config.from_object(config_class)

    data_service = DataService()
    recommender = ScholarshipRecommendationEngine()

    # In-memory storage for local execution demo
    STUDENTS_DB = {
        "student@demo.edu": {
            "user": User("u1", "student@demo.edu", User.hash_password("Student123!"), "Aarav Sharma", "student"),
            "profile": StudentProfile(
                id="p1",
                user_id="u1",
                full_name="Aarav Sharma",
                dob="2004-05-14",
                age=20,
                gender="Male",
                state="Maharashtra",
                education_level="Undergraduate",
                course="Computer Science & Engineering",
                institution="National Institute of Technology",
                marks=84.5,
                family_income=320000,
                category="OBC",
                disability_status=False,
                achievements="State Mathematics Olympiad Rank 4, Winner Hackathon 2025"
            )
        },
        "ananya@demo.edu": {
            "user": User("u2", "ananya@demo.edu", User.hash_password("Student123!"), "Ananya Sen", "student"),
            "profile": StudentProfile(
                id="p2",
                user_id="u2",
                full_name="Ananya Sen",
                dob="2005-08-22",
                age=19,
                gender="Female",
                state="West Bengal",
                education_level="Undergraduate",
                course="Engineering",
                institution="Jadavpur University",
                marks=88.0,
                family_income=450000,
                category="General",
                disability_status=False,
                achievements="Published research paper in IEEE Student branch, AI developer"
            )
        }
    }

    ADMINS_DB = {
        "admin@scholarships.edu": User(
            "admin-1",
            "admin@scholarships.edu",
            User.hash_password("AdminPass123!"),
            "Director of Scholarships (Admin)",
            "admin"
        )
    }

    TRACKER_DB = [
        ApplicationTrackerItem("t1", "u1", "sch-001", "Applied", "Submitted on National Scholarship Portal", "NSP-2026-90214", "2026-10-15").to_dict(),
        ApplicationTrackerItem("t2", "u1", "sch-006", "Preparing Documents", "Awaiting Tehsildar income stamp", "", "").to_dict()
    ]

    @app.route('/')
    def index():
        return jsonify({
            "message": "AI-Based Scholarship Recommendation System API",
            "version": "1.0.0",
            "endpoints": [
                "/api/scholarships",
                "/api/recommend",
                "/api/track",
                "/api/auth/login",
                "/api/stats"
            ]
        })

    @app.route('/api/scholarships', methods=['GET', 'POST'])
    def handle_scholarships():
        if request.method == 'GET':
            items = data_service.get_all()
            # Optional query filters
            query = request.args.get('q', '').lower()
            category = request.args.get('category', '').lower()
            stream = request.args.get('stream', '').lower()
            verified_only = request.args.get('verified_only', 'false').lower() == 'true'

            filtered = items
            if query:
                filtered = [s for s in filtered if query in s['name'].lower() or query in s['provider'].lower()]
            if category and category != 'all':
                filtered = [s for s in filtered if any(c.lower() in ['all', category] for c in s.get('applicable_categories', []))]
            if stream and stream != 'all':
                filtered = [s for s in filtered if any(stream in c.lower() or 'all' in c.lower() for c in s.get('eligible_courses', []))]
            if verified_only:
                filtered = [s for s in filtered if not s.get('is_sample', False)]

            return jsonify({"status": "success", "count": len(filtered), "data": filtered})

        elif request.method == 'POST':
            data = request.get_json() or {}
            if not data.get('name') or not data.get('provider'):
                return jsonify({"status": "error", "message": "Scholarship name and provider are required"}), 400
            
            sch_id = f"sch-custom-{len(data_service.get_all()) + 1}"
            data['id'] = sch_id
            data['is_sample'] = data.get('is_sample', True)
            data['verification_status'] = "Verified Custom" if not data['is_sample'] else "Demonstration / Sample Record"
            saved = data_service.add_scholarship(data)
            return jsonify({"status": "success", "message": "Scholarship created successfully", "data": saved}), 201

    @app.route('/api/scholarships/<sch_id>', methods=['GET', 'PUT', 'DELETE'])
    def handle_scholarship_by_id(sch_id):
        if request.method == 'GET':
            sch = data_service.get_by_id(sch_id)
            if not sch:
                return jsonify({"status": "error", "message": "Scholarship not found"}), 404
            return jsonify({"status": "success", "data": sch})
        elif request.method == 'PUT':
            updates = request.get_json() or {}
            res = data_service.update_scholarship(sch_id, updates)
            if not res:
                return jsonify({"status": "error", "message": "Scholarship not found"}), 404
            return jsonify({"status": "success", "data": res})
        elif request.method == 'DELETE':
            success = data_service.delete_scholarship(sch_id)
            if not success:
                return jsonify({"status": "error", "message": "Scholarship not found"}), 404
            return jsonify({"status": "success", "message": "Deleted successfully"})

    @app.route('/api/recommend', methods=['POST'])
    def recommend():
        body = request.get_json() or {}
        profile = body.get('profile')
        weights = body.get('weights')
        
        if not profile:
            return jsonify({"status": "error", "message": "Student profile is required"}), 400

        custom_recommender = ScholarshipRecommendationEngine(weights=weights) if weights else recommender
        all_scholarships = data_service.get_all()
        ranked = custom_recommender.recommend_scholarships(profile, all_scholarships)
        
        stats = {
            'total': len(ranked),
            'eligible': sum(1 for r in ranked if r['eligibility_status'] == 'Eligible'),
            'potentially_eligible': sum(1 for r in ranked if r['eligibility_status'] == 'Potentially Eligible'),
            'ineligible': sum(1 for r in ranked if r['eligibility_status'] == 'Ineligible')
        }

        return jsonify({
            "status": "success",
            "stats": stats,
            "recommendations": ranked
        })

    @app.route('/api/auth/login', methods=['POST'])
    def login():
        data = request.get_json() or {}
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')

        if email in ADMINS_DB:
            admin = ADMINS_DB[email]
            if admin.check_password(password):
                return jsonify({
                    "status": "success",
                    "user": admin.to_dict(),
                    "role": "admin"
                })

        if email in STUDENTS_DB:
            student_obj = STUDENTS_DB[email]
            if student_obj["user"].check_password(password):
                return jsonify({
                    "status": "success",
                    "user": student_obj["user"].to_dict(),
                    "profile": student_obj["profile"].to_dict(),
                    "role": "student"
                })

        return jsonify({"status": "error", "message": "Invalid credentials"}), 401

    @app.route('/api/track', methods=['GET', 'POST', 'PUT'])
    def track_scholarship():
        nonlocal TRACKER_DB
        if request.method == 'GET':
            user_id = request.args.get('user_id', 'u1')
            user_items = [t for t in TRACKER_DB if t.get('user_id') == user_id]
            return jsonify({"status": "success", "data": user_items})
        elif request.method == 'POST':
            payload = request.get_json() or {}
            item_id = f"t-{len(TRACKER_DB) + 1}"
            new_item = {
                "id": item_id,
                "user_id": payload.get('user_id', 'u1'),
                "scholarship_id": payload.get('scholarship_id'),
                "status": payload.get('status', 'Interested'),
                "notes": payload.get('notes', ''),
                "application_ref": payload.get('application_ref', ''),
                "applied_date": payload.get('applied_date', ''),
                "updated_at": payload.get('updated_at', '')
            }
            TRACKER_DB.append(new_item)
            return jsonify({"status": "success", "data": new_item})

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True)
