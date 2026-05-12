from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json
import os
import pickle
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score

from ai_insights import generate_ai_insights, calculate_career_suitability
from learning_recommendations import generate_learning_recommendations, get_learning_path
from resume_analyzer import (
    extract_text_from_pdf, extract_skills, calculate_resume_score,
    generate_improvement_suggestions, analyze_resume_sentiment,
    extract_missing_keywords, extract_strength_keywords
)

app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///placement.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = 'uploads'
db = SQLAlchemy(app)

# ─── Domain skill maps ────────────────────────────────────────────────────────
DOMAINS = {
    "Data & AI": {
        "core":      ["Problem Solving", "Aptitude", "Adaptability"],
        "technical": ["Programming", "DSA", "ML", "Data Analysis", "SQL"],
        "creative":  ["Creativity"],
        "weight":    {"core": 0.20, "technical": 0.65, "creative": 0.15}
    },
    "IT / Software": {
        "core":      ["Problem Solving", "Communication", "Teamwork"],
        "technical": ["Programming", "DSA", "Web Development", "SQL", "Cloud/DevOps"],
        "creative":  ["UI/UX Design"],
        "weight":    {"core": 0.20, "technical": 0.65, "creative": 0.15}
    },
    "Design": {
        "core":      ["Creativity", "Communication", "Adaptability"],
        "technical": ["Web Development"],
        "creative":  ["UI/UX Design", "Graphic Design", "Video Editing", "Social Media", "Content Writing"],
        "weight":    {"core": 0.25, "technical": 0.15, "creative": 0.60}
    },
    "Marketing": {
        "core":      ["Communication", "Adaptability", "Teamwork"],
        "technical": ["Data Analysis"],
        "creative":  ["Digital Marketing", "SEO", "Content Writing", "Social Media", "Creativity"],
        "weight":    {"core": 0.25, "technical": 0.15, "creative": 0.60}
    }
}

SKILL_KEY_MAP = {
    "Communication": "comm_rating", "Aptitude": "aptitude_rating",
    "Problem Solving": "ps_rating", "Teamwork": "teamwork_rating",
    "Adaptability": "adapt_rating", "Programming": "prog_rating",
    "DSA": "dsa_rating", "Web Development": "webdev_rating",
    "SQL": "sql_rating", "ML": "ml_rating", "Data Analysis": "da_rating",
    "Cloud/DevOps": "cloud_rating", "Cybersecurity": "cyber_rating",
    "Digital Marketing": "dm_rating", "SEO": "seo_rating",
    "Content Writing": "content_rating", "Social Media": "social_rating",
    "UI/UX Design": "uiux_rating", "Graphic Design": "graphic_rating",
    "Video Editing": "video_rating", "Creativity": "creativity_rating",
}


# ─── DB Models ────────────────────────────────────────────────────────────────
class Student(db.Model):
    """Student profile and skill ratings"""
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=True) # Added for authentication
    year = db.Column(db.String(20))
    branch = db.Column(db.String(50))
    cgpa = db.Column(db.String(20))
    projects = db.Column(db.String(20))
    internship = db.Column(db.String(10))
    certifications = db.Column(db.String(10))
    interested_domain = db.Column(db.String(100))
    self_rating = db.Column(db.Integer)
    
    # Core Skills
    comm_rating = db.Column(db.Integer, default=0)
    aptitude_rating = db.Column(db.Integer, default=0)
    ps_rating = db.Column(db.Integer, default=0)
    teamwork_rating = db.Column(db.Integer, default=0)
    adapt_rating = db.Column(db.Integer, default=0)
    
    # Technical Skills
    prog_rating = db.Column(db.Integer, default=0)
    dsa_rating = db.Column(db.Integer, default=0)
    webdev_rating = db.Column(db.Integer, default=0)
    sql_rating = db.Column(db.Integer, default=0)
    ml_rating = db.Column(db.Integer, default=0)
    da_rating = db.Column(db.Integer, default=0)
    cloud_rating = db.Column(db.Integer, default=0)
    cyber_rating = db.Column(db.Integer, default=0)
    
    # Creative/Marketing Skills
    dm_rating = db.Column(db.Integer, default=0)
    seo_rating = db.Column(db.Integer, default=0)
    content_rating = db.Column(db.Integer, default=0)
    social_rating = db.Column(db.Integer, default=0)
    uiux_rating = db.Column(db.Integer, default=0)
    graphic_rating = db.Column(db.Integer, default=0)
    video_rating = db.Column(db.Integer, default=0)
    creativity_rating = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'year': self.year,
            'branch': self.branch,
            'cgpa': self.cgpa,
            'projects': self.projects,
            'internship': self.internship,
            'certifications': self.certifications,
            'interested_domain': self.interested_domain,
            'self_rating': self.self_rating,
            'core': {
                'Communication': self.comm_rating,
                'Aptitude': self.aptitude_rating,
                'Problem Solving': self.ps_rating,
                'Teamwork': self.teamwork_rating,
                'Adaptability': self.adapt_rating,
            },
            'technical': {
                'Programming': self.prog_rating,
                'DSA': self.dsa_rating,
                'Web Development': self.webdev_rating,
                'SQL': self.sql_rating,
                'ML': self.ml_rating,
                'Data Analysis': self.da_rating,
                'Cloud/DevOps': self.cloud_rating,
                'Cybersecurity': self.cyber_rating,
            },
            'creative': {
                'Digital Marketing': self.dm_rating,
                'SEO': self.seo_rating,
                'Content Writing': self.content_rating,
                'Social Media': self.social_rating,
                'UI/UX Design': self.uiux_rating,
                'Graphic Design': self.graphic_rating,
                'Video Editing': self.video_rating,
                'Creativity': self.creativity_rating,
            },
            'created_at': self.created_at.isoformat()
        }


class AnalysisResult(db.Model):
    id            = db.Column(db.Integer, primary_key=True)
    student_id    = db.Column(db.Integer, db.ForeignKey('student.id'), nullable=False)
    best_domain   = db.Column(db.String(50))
    readiness     = db.Column(db.String(20))
    readiness_pct = db.Column(db.Float)
    domain_scores = db.Column(db.Text, default='{}')
    strengths     = db.Column(db.Text, default='[]')
    gaps          = db.Column(db.Text, default='[]')
    advice        = db.Column(db.Text, default='[]')
    created_at    = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'best_domain': self.best_domain,
            'readiness': self.readiness,
            'readiness_pct': self.readiness_pct,
            'domain_scores': json.loads(self.domain_scores),
            'strengths': json.loads(self.strengths),
            'gaps': json.loads(self.gaps),
            'advice': json.loads(self.advice),
            'created_at': self.created_at.isoformat()
        }


class JobRecommendation(db.Model):
    id              = db.Column(db.Integer, primary_key=True)
    student_id      = db.Column(db.Integer, db.ForeignKey('student.id'), nullable=False)
    job_role        = db.Column(db.String(100))
    domain          = db.Column(db.String(50))
    match_percentage = db.Column(db.Float)
    missing_skills  = db.Column(db.Text, default='[]')
    strengths       = db.Column(db.Text, default='[]')
    salary_range    = db.Column(db.String(50))
    growth_potential = db.Column(db.String(20))
    created_at      = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'job_role': self.job_role,
            'domain': self.domain,
            'match_percentage': self.match_percentage,
            'missing_skills': json.loads(self.missing_skills),
            'strengths': json.loads(self.strengths),
            'salary_range': self.salary_range,
            'growth_potential': self.growth_potential,
            'created_at': self.created_at.isoformat()
        }


class LearningRoadmap(db.Model):
    id            = db.Column(db.Integer, primary_key=True)
    student_id    = db.Column(db.Integer, db.ForeignKey('student.id'), nullable=False)
    domain        = db.Column(db.String(50))
    week          = db.Column(db.Integer)
    focus_area    = db.Column(db.String(100))
    skills        = db.Column(db.Text, default='[]')
    resources     = db.Column(db.Text, default='[]')
    projects      = db.Column(db.Text, default='[]')
    certifications = db.Column(db.Text, default='[]')
    created_at    = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'domain': self.domain,
            'week': self.week,
            'focus_area': self.focus_area,
            'skills': json.loads(self.skills),
            'resources': json.loads(self.resources),
            'projects': json.loads(self.projects),
            'certifications': json.loads(self.certifications),
            'created_at': self.created_at.isoformat()
        }


class MLPrediction(db.Model):
    id                    = db.Column(db.Integer, primary_key=True)
    student_id            = db.Column(db.Integer, db.ForeignKey('student.id'), nullable=False)
    model_type            = db.Column(db.String(50))
    predicted_readiness   = db.Column(db.String(20))
    predicted_percentage  = db.Column(db.Float)
    confidence_score      = db.Column(db.Float)
    feature_importance    = db.Column(db.Text, default='{}')
    created_at            = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'model_type': self.model_type,
            'predicted_readiness': self.predicted_readiness,
            'predicted_percentage': self.predicted_percentage,
            'confidence_score': self.confidence_score,
            'feature_importance': json.loads(self.feature_importance),
            'created_at': self.created_at.isoformat()
        }


class ResumeAnalysis(db.Model):
    id                    = db.Column(db.Integer, primary_key=True)
    student_id            = db.Column(db.Integer, db.ForeignKey('student.id'), nullable=False)
    filename              = db.Column(db.String(255))
    extracted_text        = db.Column(db.Text)
    extracted_skills      = db.Column(db.Text, default='[]')
    resume_score          = db.Column(db.Float)
    completeness_score    = db.Column(db.Float)
    skill_relevance_score  = db.Column(db.Float)
    format_score          = db.Column(db.Float)
    improvement_suggestions = db.Column(db.Text, default='[]')
    missing_keywords      = db.Column(db.Text, default='[]')
    strength_keywords     = db.Column(db.Text, default='[]')
    created_at            = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'filename': self.filename,
            'extracted_text': self.extracted_text[:500] + '...' if self.extracted_text and len(self.extracted_text) > 500 else self.extracted_text,
            'extracted_skills': json.loads(self.extracted_skills),
            'resume_score': self.resume_score,
            'completeness_score': self.completeness_score,
            'skill_relevance_score': self.skill_relevance_score,
            'format_score': self.format_score,
            'improvement_suggestions': json.loads(self.improvement_suggestions),
            'missing_keywords': json.loads(self.missing_keywords),
            'strength_keywords': json.loads(self.strength_keywords),
            'created_at': self.created_at.isoformat()
        }


class ProgressTracking(db.Model):
    id                    = db.Column(db.Integer, primary_key=True)
    student_id            = db.Column(db.Integer, db.ForeignKey('student.id'), nullable=False)
    analysis_date         = db.Column(db.DateTime, default=datetime.utcnow)
    readiness_score        = db.Column(db.Float)
    skill_scores          = db.Column(db.Text, default='{}')
    domain_scores         = db.Column(db.Text, default='{}')
    improvements_made    = db.Column(db.Text, default='[]')
    areas_declined        = db.Column(db.Text, default='[]')
    trend_analysis       = db.Column(db.Text, default='{}')

    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'analysis_date': self.analysis_date.isoformat(),
            'readiness_score': self.readiness_score,
            'skill_scores': json.loads(self.skill_scores),
            'domain_scores': json.loads(self.domain_scores),
            'improvements_made': json.loads(self.improvements_made),
            'areas_declined': json.loads(self.areas_declined),
            'trend_analysis': json.loads(self.trend_analysis)
        }


class LearningRecommendation(db.Model):
    id                    = db.Column(db.Integer, primary_key=True)
    student_id            = db.Column(db.Integer, db.ForeignKey('student.id'), nullable=False)
    skill_name            = db.Column(db.String(100))
    current_level         = db.Column(db.Integer)
    target_level          = db.Column(db.Integer)
    recommendation_type    = db.Column(db.String(50))  # course, video, platform, project
    recommendation_data    = db.Column(db.Text, default='{}')
    priority              = db.Column(db.String(20))   # high, medium, low
    estimated_time        = db.Column(db.String(50))   # hours, days, weeks
    difficulty_level      = db.Column(db.String(20))   # beginner, intermediate, advanced
    created_at            = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'skill_name': self.skill_name,
            'current_level': self.current_level,
            'target_level': self.target_level,
            'recommendation_type': self.recommendation_type,
            'recommendation_data': json.loads(self.recommendation_data),
            'priority': self.priority,
            'estimated_time': self.estimated_time,
            'difficulty_level': self.difficulty_level,
            'created_at': self.created_at.isoformat()
        }


class AIInsight(db.Model):
    id                    = db.Column(db.Integer, primary_key=True)
    student_id            = db.Column(db.Integer, db.ForeignKey('student.id'), nullable=False)
    insight_type          = db.Column(db.String(50))  # strength, weakness, risk, opportunity
    category              = db.Column(db.String(100))
    description           = db.Column(db.Text)
    confidence_score      = db.Column(db.Float)
    impact_level          = db.Column(db.String(20))  # high, medium, low
    actionable_steps     = db.Column(db.Text, default='[]')
    related_skills        = db.Column(db.Text, default='[]')
    career_implications   = db.Column(db.Text)
    created_at            = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'insight_type': self.insight_type,
            'category': self.category,
            'description': self.description,
            'confidence_score': self.confidence_score,
            'impact_level': self.impact_level,
            'actionable_steps': json.loads(self.actionable_steps),
            'related_skills': json.loads(self.related_skills),
            'career_implications': self.career_implications,
            'created_at': self.created_at.isoformat()
        }


# ─── Analysis Engine ──────────────────────────────────────────────────────────
def get_skill_val(data, skill_name):
    key = SKILL_KEY_MAP.get(skill_name)
    if key:
        return data.get(key, 0) or 0
    return 0


def run_analysis(data):
    domain_scores = {}
    best_domain = None
    best_pct = -1

    for domain, cfg in DOMAINS.items():
        core_skills = cfg['core']
        tech_skills = cfg['technical']
        cre_skills  = cfg['creative']
        weights     = cfg['weight']

        core_avg = sum(get_skill_val(data, s) for s in core_skills) / len(core_skills)
        tech_avg = sum(get_skill_val(data, s) for s in tech_skills) / len(tech_skills)
        cre_avg  = sum(get_skill_val(data, s) for s in cre_skills)  / len(cre_skills)

        pct = round(
            (core_avg * weights['core'] + tech_avg * weights['technical'] + cre_avg * weights['creative'])
            / 5 * 100, 1
        )

        domain_scores[domain] = {
            'pct': pct,
            'core_avg': round(core_avg, 2),
            'tech_avg': round(tech_avg, 2),
            'creative_avg': round(cre_avg, 2),
        }
        if pct > best_pct:
            best_pct = pct
            best_domain = domain

    # Readiness bonus factors
    bonus = 0
    if data.get('internship') == 'YES':    bonus += 5
    if data.get('certifications') == 'YES': bonus += 3
    projects = data.get('projects', '0')
    if projects in ('3-5', '5+'):          bonus += 4
    elif projects == '1-2':                bonus += 2

    readiness_pct = min(round(best_pct + bonus, 1), 100)
    readiness = 'Ready' if readiness_pct >= 40 else 'Not Ready'

    # Strengths = skills rated >= 4 across all categories
    strengths = [s for s, k in SKILL_KEY_MAP.items() if (data.get(k) or 0) >= 4]
    gaps      = [s for s, k in SKILL_KEY_MAP.items() if (data.get(k) or 0) <= 1][:6]

    # Advice
    advice = []
    if gaps:
        advice.append(f"Improve weak skills: {', '.join(gaps[:3])}.")
    if data.get('internship') != 'YES':
        advice.append("Apply for internships to gain real-world experience.")
    if data.get('certifications') != 'YES':
        advice.append("Earn at least one certification relevant to your domain.")
    if projects in ('0', '1-2', ''):
        advice.append("Build 2–3 portfolio projects to strengthen your profile.")
    if not advice:
        advice.append("Great profile! Focus on interview prep and networking.")

    return {
        'best_domain': best_domain,
        'readiness': readiness,
        'readiness_pct': readiness_pct,
        'domain_scores': domain_scores,
        'strengths': strengths,
        'gaps': gaps,
        'advice': advice,
    }


# ─── Data Structures ──────────────────────────────────────────────────────────
JOB_ROLES = {
    "Data & AI": {
        "Data Scientist": {
            "required_skills": {"ML": 4, "Data Analysis": 4, "Programming": 4, "SQL": 3},
            "avg_salary": "8-15 LPA", "growth_potential": "Very High", "description": "Analyzing complex data sets to drive business decisions."
        },
        "AI Engineer": {
            "required_skills": {"ML": 5, "Programming": 4, "DSA": 4},
            "avg_salary": "10-20 LPA", "growth_potential": "Very High", "description": "Designing and building production AI systems."
        }
    },
    "IT / Software": {
        "Full Stack Developer": {
            "required_skills": {"Web Development": 4, "Programming": 4, "SQL": 3, "Problem Solving": 4},
            "avg_salary": "6-12 LPA", "growth_potential": "High", "description": "Developing end-to-end web applications and services."
        },
        "Software Engineer": {
            "required_skills": {"DSA": 4, "Programming": 4, "Problem Solving": 4},
            "avg_salary": "7-14 LPA", "growth_potential": "High", "description": "General software design and implementation."
        }
    },
    "Design": {
        "UI/UX Designer": {
            "required_skills": {"UI/UX Design": 5, "Creativity": 4, "Web Development": 2},
            "avg_salary": "5-10 LPA", "growth_potential": "High", "description": "Designing user-centric interfaces and experiences."
        }
    },
    "Marketing": {
        "Digital Marketer": {
            "required_skills": {"Digital Marketing": 4, "SEO": 4, "Social Media": 4},
            "avg_salary": "4-8 LPA", "growth_potential": "Medium", "description": "Managing online presence and marketing campaigns."
        }
    }
}

LEARNING_PATHS = {
    "Data & AI": [
        {"week": 1, "focus_area": "Python for Data Science", "skills": ["Programming"], "resources": ["Coursera", "YouTube"], "projects": ["Titanic Survival"], "certifications": ["Python Basic"]},
        {"week": 2, "focus_area": "Machine Learning Fundamentals", "skills": ["ML"], "resources": ["Andrew Ng", "Scikit-learn docs"], "projects": ["House Price Prediction"], "certifications": ["ML Specialization"]}
    ],
    "IT / Software": [
        {"week": 1, "focus_area": "Frontend Mastery", "skills": ["Web Development"], "resources": ["MDN", "FreeCodeCamp"], "projects": ["Personal Portfolio"], "certifications": ["Responsive Design"]},
        {"week": 2, "focus_area": "Backend & Databases", "skills": ["SQL", "Programming"], "resources": ["Node.js docs", "PostgreSQL"], "projects": ["E-commerce Backend"], "certifications": ["Node.js Certified"]}
    ]
}

# ─── Helper Functions ─────────────────────────────────────────────────────────

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})
def prepare_ml_data():
    """Prepare data for ML training"""
    students = Student.query.all()
    if len(students) < 50:
        return None, None, None
    
    data = []
    labels = []
    
    # Get latest analysis results for each student
    for student in students:
        # Get latest analysis result
        latest_result = AnalysisResult.query.filter_by(student_id=student.id)\
                        .order_by(AnalysisResult.created_at.desc()).first()
        
        if not latest_result:
            continue  # Skip students without analysis
        
        features = []
        # Add skill ratings
        for skill_key in SKILL_KEY_MAP.values():
            features.append(getattr(student, skill_key, 0))
        
        # Add other features
        features.append(1 if student.internship == 'YES' else 0)
        features.append(1 if student.certifications == 'YES' else 0)
        projects_map = {'0': 0, '1-2': 1, '3-5': 2, '5+': 3}
        features.append(projects_map.get(student.projects, 0))
        
        # Use actual analysis result
        labels.append(1 if latest_result.readiness == 'Ready' else 0)
        data.append(features)
    
    # Debug: Print class distribution
    unique_labels = list(set(labels))
    print(f"ML Data: {len(data)} samples, classes: {unique_labels}, counts: {labels.count(0)} Not Ready, {labels.count(1)} Ready")
    
    return np.array(data), np.array(labels), students


def train_ml_models():
    """Train and save ML models"""
    X, y, students = prepare_ml_data()
    if X is None or len(X) < 50:
        return None
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    models = {}
    results = {}
    
    # Random Forest
    rf = RandomForestClassifier(n_estimators=100, random_state=42)
    rf.fit(X_train, y_train)
    rf_pred = rf.predict(X_test)
    rf_accuracy = accuracy_score(y_test, rf_pred)
    models['random_forest'] = rf
    results['random_forest'] = {
        'accuracy': rf_accuracy,
        'feature_importance': dict(zip(list(SKILL_KEY_MAP.values()) + ['internship', 'certifications', 'projects'], rf.feature_importances_))
    }
    
    # Decision Tree
    dt = DecisionTreeClassifier(random_state=42)
    dt.fit(X_train, y_train)
    dt_pred = dt.predict(X_test)
    dt_accuracy = accuracy_score(y_test, dt_pred)
    models['decision_tree'] = dt
    results['decision_tree'] = {
        'accuracy': dt_accuracy,
        'feature_importance': dict(zip(list(SKILL_KEY_MAP.values()) + ['internship', 'certifications', 'projects'], dt.feature_importances_))
    }
    
    # Logistic Regression
    lr = LogisticRegression(random_state=42, max_iter=1000)
    lr.fit(X_train, y_train)
    lr_pred = lr.predict(X_test)
    lr_accuracy = accuracy_score(y_test, lr_pred)
    models['logistic_regression'] = lr
    results['logistic_regression'] = {
        'accuracy': lr_accuracy
    }
    
    # Save models
    os.makedirs('models', exist_ok=True)
    for name, model in models.items():
        with open(f'models/{name}.pkl', 'wb') as f:
            pickle.dump(model, f)
    
    return results


def load_ml_model(model_type):
    """Load a trained ML model"""
    model_path = f'models/{model_type}.pkl'
    if not os.path.exists(model_path):
        return None
    with open(model_path, 'rb') as f:
        return pickle.load(f)


def predict_readiness_ml(student_id, model_type='random_forest'):
    """Predict readiness using ML model"""
    student = Student.query.get(student_id)
    if not student:
        return None
    
    model = load_ml_model(model_type)
    if not model:
        return None
    
    # Prepare features
    features = []
    for skill_key in SKILL_KEY_MAP.values():
        features.append(getattr(student, skill_key, 0))
    features.append(1 if student.internship == 'YES' else 0)
    features.append(1 if student.certifications == 'YES' else 0)
    projects_map = {'0': 0, '1-2': 1, '3-5': 2, '5+': 3}
    features.append(projects_map.get(student.projects, 0))
    
    X = np.array([features])
    prediction = model.predict(X)[0]
    probability = model.predict_proba(X)[0]
    
    confidence = max(probability)
    readiness = 'Ready' if prediction == 1 else 'Not Ready'
    percentage = probability[1] * 100 if prediction == 1 else probability[0] * 100
    
    # Get feature importance if available
    feature_importance = {}
    if hasattr(model, 'feature_importances_'):
        feature_names = list(SKILL_KEY_MAP.values()) + ['internship', 'certifications', 'projects']
        feature_importance = dict(zip(feature_names, model.feature_importances_))
    
    return {
        'predicted_readiness': readiness,
        'predicted_percentage': round(percentage, 1),
        'confidence_score': round(confidence, 3),
        'feature_importance': feature_importance
    }


# ─── Job Role Recommendations ───────────────────────────────────────────────────
def calculate_job_match(student_skills, required_skills):
    """Calculate match percentage between student skills and job requirements"""
    total_skills = len(required_skills)
    if total_skills == 0:
        return 0
    
    match_score = 0
    for skill, required_level in required_skills.items():
        student_level = get_skill_val(student_skills, skill)
        if student_level >= required_level:
            match_score += 1
        elif student_level >= required_level - 1:
            match_score += 0.5
    
    return round((match_score / total_skills) * 100, 1)


def get_job_recommendations(student_data):
    """Get job recommendations for a student"""
    recommendations = []
    student_domain = student_data.get('interested_domain', 'IT / Software')
    
    # Get jobs in student's preferred domain first
    domain_jobs = JOB_ROLES.get(student_domain, {})
    for job_role, job_info in domain_jobs.items():
        match_pct = calculate_job_match(student_data, job_info['required_skills'])
        
        if match_pct >= 30:  # Only include matches above 30%
            missing_skills = []
            strengths = []
            
            for skill, required_level in job_info['required_skills'].items():
                student_level = get_skill_val(student_data, skill)
                if student_level < required_level - 1:
                    missing_skills.append(skill)
                elif student_level >= required_level:
                    strengths.append(skill)
            
            recommendations.append({
                'job_role': job_role,
                'domain': student_domain,
                'match_percentage': match_pct,
                'missing_skills': missing_skills[:5],  # Limit to top 5
                'strengths': strengths[:5],
                'salary_range': job_info['avg_salary'],
                'growth_potential': job_info['growth_potential'],
                'description': job_info['description']
            })
    
    # Add some jobs from other domains if student has good cross-domain skills
    other_domains = [d for d in DOMAINS.keys() if d != student_domain]
    for domain in other_domains:
        domain_jobs = JOB_ROLES.get(domain, {})
        for job_role, job_info in domain_jobs.items():
            match_pct = calculate_job_match(student_data, job_info['required_skills'])
            
            if match_pct >= 40:  # Higher threshold for cross-domain
                missing_skills = []
                strengths = []
                
                for skill, required_level in job_info['required_skills'].items():
                    student_level = get_skill_val(student_data, skill)
                    if student_level < required_level - 1:
                        missing_skills.append(skill)
                    elif student_level >= required_level:
                        strengths.append(skill)
                
                recommendations.append({
                    'job_role': job_role,
                    'domain': domain,
                    'match_percentage': match_pct,
                    'missing_skills': missing_skills[:3],
                    'strengths': strengths[:3],
                    'salary_range': job_info['avg_salary'],
                    'growth_potential': job_info['growth_potential'],
                    'description': job_info['description']
                })
    
    # Sort by match percentage and return top 5
    recommendations.sort(key=lambda x: x['match_percentage'], reverse=True)
    return recommendations[:5]


# ─── Skill Gap Analysis ─────────────────────────────────────────────────────────
def analyze_skill_gaps(student_data, target_domain=None):
    """Analyze skill gaps compared to industry requirements"""
    if target_domain is None:
        target_domain = student_data.get('interested_domain', 'IT / Software')
    
    domain_jobs = JOB_ROLES.get(target_domain, {})
    
    # Aggregate skill requirements across all jobs in the domain
    all_required_skills = {}
    for job_info in domain_jobs.values():
        for skill, level in job_info['required_skills'].items():
            if skill not in all_required_skills:
                all_required_skills[skill] = []
            all_required_skills[skill].append(level)
    
    # Calculate average required level for each skill
    avg_required = {}
    for skill, levels in all_required_skills.items():
        avg_required[skill] = round(sum(levels) / len(levels), 1)
    
    # Compare with student skills
    gaps = []
    strengths = []
    
    for skill, required_level in avg_required.items():
        student_level = get_skill_val(student_data, skill)
        gap = required_level - student_level
        
        if gap > 1:
            gaps.append({
                'skill': skill,
                'current_level': student_level,
                'required_level': required_level,
                'gap': round(gap, 1),
                'priority': 'High' if gap > 2 else 'Medium'
            })
        elif student_level >= required_level:
            strengths.append({
                'skill': skill,
                'level': student_level,
                'above_requirement': round(student_level - required_level, 1)
            })
    
    # Sort by priority and gap size
    gaps.sort(key=lambda x: (x['priority'] != 'High', -x['gap']))
    strengths.sort(key=lambda x: -x['above_requirement'])
    
    return {
        'target_domain': target_domain,
        'skill_gaps': gaps[:8],  # Top 8 gaps
        'strengths': strengths[:8],  # Top 8 strengths
        'overall_readiness': round(len([s for s in strengths]) / len(avg_required) * 100, 1) if avg_required else 0
    }


# ─── Learning Roadmap Generation ─────────────────────────────────────────────────
def generate_learning_roadmap(student_data, target_domain=None):
    """Generate personalized learning roadmap"""
    if target_domain is None:
        target_domain = student_data.get('interested_domain', 'IT / Software')
    
    skill_gap_analysis = analyze_skill_gaps(student_data, target_domain)
    gaps = skill_gap_analysis['skill_gaps']
    
    # Get base learning path for domain
    base_path = LEARNING_PATHS.get(target_domain, [])
    
    # Customize based on student's skill gaps
    customized_path = []
    for week_plan in base_path:
        customized_week = week_plan.copy()
        
        # Add specific focus based on gaps
        week_gaps = [g for g in gaps if any(skill in g['skill'] for skill in week_plan['skills'])]
        if week_gaps:
            customized_week['priority_gaps'] = [g['skill'] for g in week_gaps[:3]]
            customized_week['gap_severity'] = max(g['gap'] for g in week_gaps)
        
        customized_path.append(customized_week)
    
    return customized_path


# ─── Routes ───────────────────────────────────────────────────────────────────


@app.route('/api/students', methods=['GET'])
def get_students():
    students = Student.query.order_by(Student.created_at.desc()).all()
    return jsonify([s.to_dict() for s in students])


@app.route('/api/students/<int:sid>', methods=['GET'])
def get_student(sid):
    return jsonify(Student.query.get_or_404(sid).to_dict())


@app.route('/api/students', methods=['POST'])
def create_student():
    data = request.get_json()
    if not data or not data.get('name') or not data.get('email'):
        return jsonify({'error': 'name and email are required'}), 400
    if Student.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 409

    s = Student(**{k: data.get(k) for k in [
        'name','email','year','branch','cgpa','projects','internship','certifications',
        'interested_domain','self_rating',
        'comm_rating','aptitude_rating','ps_rating','teamwork_rating','adapt_rating',
        'prog_rating','dsa_rating','webdev_rating','sql_rating','ml_rating',
        'da_rating','cloud_rating','cyber_rating',
        'dm_rating','seo_rating','content_rating','social_rating',
        'uiux_rating','graphic_rating','video_rating','creativity_rating',
    ] if k in data})
    db.session.add(s)
    db.session.commit()
    return jsonify(s.to_dict()), 201


@app.route('/api/students/<int:sid>', methods=['DELETE'])
def delete_student(sid):
    s = Student.query.get_or_404(sid)
    # Delete all dependent records
    AnalysisResult.query.filter_by(student_id=sid).delete()
    JobRecommendation.query.filter_by(student_id=sid).delete()
    LearningRoadmap.query.filter_by(student_id=sid).delete()
    db.session.delete(s)
    db.session.commit()
    return jsonify({'message': 'deleted'})


@app.route('/api/analyze/quick', methods=['POST'])
def quick_analyze():
    data = request.get_json()
    return jsonify(run_analysis(data))


@app.route('/api/analyze/<int:sid>', methods=['POST'])
def analyze_student(sid):
    s = Student.query.get_or_404(sid)
    data = s.to_dict()
    # flatten nested skill dicts for analysis
    flat = {**data, **data.get('core', {}), **data.get('technical', {}), **data.get('creative', {})}
    # re-map display names back to rating keys via SKILL_KEY_MAP
    for skill, key in SKILL_KEY_MAP.items():
        flat[key] = flat.get(skill, flat.get(key, 0))

    res = run_analysis(s.__dict__)
    r = AnalysisResult(
        student_id=sid,
        best_domain=res['best_domain'],
        readiness=res['readiness'],
        readiness_pct=res['readiness_pct'],
        domain_scores=json.dumps(res['domain_scores']),
        strengths=json.dumps(res['strengths']),
        gaps=json.dumps(res['gaps']),
        advice=json.dumps(res['advice']),
    )
    db.session.add(r)
    db.session.commit()
    return jsonify(r.to_dict()), 201


@app.route('/api/results/<int:sid>', methods=['GET'])
def get_results(sid):
    results = AnalysisResult.query.filter_by(student_id=sid)\
                .order_by(AnalysisResult.created_at.desc()).all()
    return jsonify([r.to_dict() for r in results])


@app.route('/api/analysis/student/<int:student_id>', methods=['GET'])
def get_student_analysis(student_id):
    analysis = AnalysisResult.query.filter_by(student_id=student_id)\
                .order_by(AnalysisResult.created_at.desc()).first()
    if not analysis:
        return jsonify({'error': 'No analysis found'}), 404
        
    student = Student.query.get(student_id)
    
    top_skills = []
    for skill_name, skill_key in SKILL_KEY_MAP.items():
        score = getattr(student, skill_key, 0)
        if score > 0:
            top_skills.append({'name': skill_name, 'score': score})
            
    top_skills.sort(key=lambda x: x['score'], reverse=True)
    
    result = analysis.to_dict()
    result['top_skills'] = top_skills[:5]
    return jsonify(result)


@app.route('/api/dashboard/stats', methods=['GET'])
def dashboard_stats():
    students = Student.query.all()
    total = len(students)
    if total == 0:
        return jsonify({'total_students': 0})

    results = AnalysisResult.query.all()
    avg_readiness = round(sum(r.readiness_pct for r in results) / len(results), 1) if results else 0
    ready_count = sum(1 for r in results if r.readiness == 'Ready')

    domain_dist = {}
    for r in results:
        domain_dist[r.best_domain] = domain_dist.get(r.best_domain, 0) + 1

    return jsonify({
        'total_students': total,
        'total_analyses': len(results),
        'avg_readiness': avg_readiness,
        'ready_count': ready_count,
        'not_ready_count': len(results) - ready_count,
        'internship_pct': round(sum(1 for s in students if s.internship == 'YES') / total * 100, 1),
        'certification_pct': round(sum(1 for s in students if s.certifications == 'YES') / total * 100, 1),
        'avg_readiness_pct': avg_readiness,
        'domain_distribution': domain_dist,
    })


@app.route('/api/analysis/results', methods=['GET'])
def get_all_analysis_results():
    """Get all analysis results for admin reports"""
    results = AnalysisResult.query.order_by(AnalysisResult.created_at.desc()).all()
    return jsonify([r.to_dict() for r in results])


@app.route('/api/analytics/skill-gaps', methods=['GET'])
def get_all_skill_gaps():
    """Get aggregated skill gaps for all domains"""
    results = AnalysisResult.query.all()
    if not results:
        return jsonify([])
        
    # Aggregate skill gaps by domain
    domain_data = {}
    for result in results:
        domain = result.best_domain
        if domain not in domain_data:
            domain_data[domain] = {
                'skills': {}, # skill -> list of scores
                'total_students': 0
            }
        
        domain_data[domain]['total_students'] += 1
        
        # We need to get the actual skill scores for the domain.
        # For simplicity, we'll use the Student data for these students.
        student = Student.query.get(result.student_id)
        if student:
            for skill_name, skill_key in SKILL_KEY_MAP.items():
                score = getattr(student, skill_key, 0)
                if score > 0:
                    if skill_name not in domain_data[domain]['skills']:
                        domain_data[domain]['skills'][skill_name] = []
                    domain_data[domain]['skills'][skill_name].append(score)
    
    skill_gap_analysis = []
    for domain, data in domain_data.items():
        for skill_name, scores in data['skills'].items():
            avg = sum(scores) / len(scores)
            below_3 = sum(1 for s in scores if s < 3)
            
            skill_gap_analysis.append({
                'domain': domain,
                'skill': skill_name,
                'average': round(avg, 1),
                'studentsBelow3': below_3,
                'totalStudents': data['total_students'],
                'percentage': round(below_3 / data['total_students'] * 100, 1)
            })
    
    return jsonify(skill_gap_analysis)


@app.route('/api/analytics/domain-statistics', methods=['GET'])
def get_domain_statistics():
    """Get detailed statistics for each domain"""
    results = AnalysisResult.query.all()
    if not results:
        return jsonify({})
        
    domain_stats = {}
    for result in results:
        domain = result.best_domain
        if domain not in domain_stats:
            domain_stats[domain] = {
                'domain': domain,
                'totalStudents': 0,
                'readyStudents': 0,
                'readiness_scores': [],
                'skill_scores': {} # skill -> list of scores
            }
        
        stats = domain_stats[domain]
        stats['totalStudents'] += 1
        stats['readiness_scores'].append(result.readiness_pct)
        
        if result.readiness == 'Ready' or result.readiness_pct >= 60:
            stats['readyStudents'] += 1
            
        student = Student.query.get(result.student_id)
        if student:
            for skill_name, skill_key in SKILL_KEY_MAP.items():
                score = getattr(student, skill_key, 0)
                if score > 0:
                    if skill_name not in stats['skill_scores']:
                        stats['skill_scores'][skill_name] = []
                    stats['skill_scores'][skill_name].append(score)
    
    final_stats = {}
    for domain, stats in domain_stats.items():
        avg_readiness = sum(stats['readiness_scores']) / len(stats['readiness_scores'])
        
        top_skills_list = []
        for skill_name, scores in stats['skill_scores'].items():
            top_skills_list.append({
                'name': skill_name,
                'average': sum(scores) / len(scores)
            })
        
        top_skills_list.sort(key=lambda x: x['average'], reverse=True)
        
        # Distribution: % of students strong in each skill
        dist = {}
        for skill_name, scores in stats['skill_scores'].items():
            strong_pct = sum(1 for s in scores if s >= 4) / stats['totalStudents'] * 100
            dist[skill_name] = round(strong_pct, 1)
            
        final_stats[domain] = {
            'totalStudents': stats['totalStudents'],
            'readyStudents': stats['readyStudents'],
            'averageReadiness': round(avg_readiness, 1),
            'topSkill': top_skills_list[0]['name'] if top_skills_list else 'N/A',
            'topSkills': top_skills_list[:5],
            'skillDistribution': dist,
            'improvementRate': 12.5, # Mocked
            'growthRate': 8.4 # Mocked
        }
    
    return jsonify(final_stats)


@app.route('/api/roles', methods=['GET'])
def get_roles():
    """Get available user roles"""
    return jsonify(['admin', 'student'])


@app.route('/api/users', methods=['GET'])
def get_users():
    """Get all users with their roles"""
    students = Student.query.all()
    users = []
    
    for student in students:
        users.append({
            'id': student.id,
            'name': student.name,
            'email': student.email,
            'role': 'student',  # All students have student role
            'created_at': student.created_at.isoformat()
        })
    
    # Add admin user (hardcoded for demo)
    users.append({
        'id': 999,
        'name': 'Admin User',
        'email': 'admin@placeai.com',
        'role': 'admin',
        'created_at': datetime.utcnow().isoformat()
    })
    
    return jsonify(users)


@app.route('/api/users/<int:user_id>', methods=['PUT'])
def update_user_role(user_id):
    """Update user role (admin only)"""
    data = request.get_json()
    new_role = data.get('role')
    
    if new_role not in ['admin', 'student']:
        return jsonify({'error': 'Invalid role'}), 400
    
    # For demo purposes, we'll just return success
    return jsonify({'message': 'User role updated successfully'})


@app.route('/api/users', methods=['POST'])
def add_user():
    """Add a new user"""
    try:
        data = request.get_json()
        name = data.get('name')
        email = data.get('email')
        role = data.get('role', 'student')
        
        if role == 'student':
            new_student = Student(name=name, email=email)
            db.session.add(new_student)
            db.session.commit()
            return jsonify(new_student.to_dict()), 201
        else:
            return jsonify({'message': 'Admin created (mock)'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    """Delete a user"""
    try:
        student = Student.query.get(user_id)
        if student:
            db.session.delete(student)
            db.session.commit()
            return jsonify({'message': 'User deleted successfully'})
        return jsonify({'error': 'User not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/ml/predictions', methods=['GET'])
def get_all_predictions():
    """Get all ML predictions"""
    try:
        predictions = MLPrediction.query.order_by(MLPrediction.created_at.desc()).all()
        return jsonify([p.to_dict() for p in predictions])
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ─── New API Endpoints for ML and Enhanced Features ─────────────────────────────
@app.route('/api/ml/train', methods=['POST'])
def train_models():
    """Train ML models with current data"""
    try:
        results = train_ml_models()
        if results:
            return jsonify({
                'message': 'Models trained successfully',
                'results': results
            })
        else:
            return jsonify({'error': 'Insufficient data for training (need at least 50 students)'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/ml/predict/<int:student_id>', methods=['GET'])
def predict_readiness(student_id):
    """Get ML prediction for student readiness"""
    try:
        # Try different models
        models = ['random_forest', 'decision_tree', 'logistic_regression']
        predictions = {}
        
        for model_type in models:
            prediction = predict_readiness_ml(student_id, model_type)
            if prediction:
                predictions[model_type] = prediction
                
                # Save to database
                ml_pred = MLPrediction(
                    student_id=student_id,
                    model_type=model_type,
                    predicted_readiness=prediction['predicted_readiness'],
                    predicted_percentage=prediction['predicted_percentage'],
                    confidence_score=prediction['confidence_score'],
                    feature_importance=json.dumps(prediction['feature_importance'])
                )
                db.session.add(ml_pred)
        
        db.session.commit()
        
        if predictions:
            return jsonify(predictions)
        else:
            return jsonify({'error': 'Models not trained or insufficient data'}), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/jobs/recommend/<int:student_id>', methods=['GET'])
def get_job_recommendations_api(student_id):
    """Get job recommendations for a student"""
    try:
        student = Student.query.get_or_404(student_id)
        student_data = student.to_dict()
        
        recommendations = get_job_recommendations(student_data)
        
        # Save recommendations to database
        JobRecommendation.query.filter_by(student_id=student_id).delete()
        
        for rec in recommendations:
            job_rec = JobRecommendation(
                student_id=student_id,
                job_role=rec['job_role'],
                domain=rec['domain'],
                match_percentage=rec['match_percentage'],
                missing_skills=json.dumps(rec['missing_skills']),
                strengths=json.dumps(rec['strengths']),
                salary_range=rec['salary_range'],
                growth_potential=rec['growth_potential']
            )
            db.session.add(job_rec)
        
        db.session.commit()
        
        return jsonify(recommendations)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/analysis/skill-gaps/<int:student_id>', methods=['GET'])
def get_skill_gap_analysis(student_id):
    """Get skill gap analysis for a student"""
    try:
        student = Student.query.get_or_404(student_id)
        # Mock skill gaps
        gaps = [
            {'skill': 'Data Structures', 'domain': 'IT / Software', 'average': 2.5, 'studentsBelow3': 45, 'totalStudents': 100},
            {'skill': 'Machine Learning', 'domain': 'Data & AI', 'average': 1.8, 'studentsBelow3': 70, 'totalStudents': 100}
        ]
        return jsonify(gaps)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/insights/<int:student_id>', methods=['GET'])
@app.route('/api/ai-insights/<int:student_id>', methods=['GET'])
def get_ai_insights(student_id):
    """Get detailed AI insights for a student"""
    insights = {
        'career_suitability': {
            'Data & AI': 0.85,
            'IT / Software': 0.78,
            'Design': 0.45,
            'Marketing': 0.30
        },
        'insights': {
            'strengths': [
                {
                    'category': 'Problem Solving',
                    'impact': 'high',
                    'confidence': 0.92,
                    'description': 'Excellent logical reasoning and algorithm design skills.',
                    'career_implications': 'Well-suited for complex software engineering roles.',
                    'related_skills': ['Algorithms', 'Python', 'C++'],
                    'actionable_steps': ['Participate in competitive programming', 'Mentor peers']
                }
            ],
            'weaknesses': [
                {
                    'category': 'Communication',
                    'impact': 'medium',
                    'confidence': 0.75,
                    'description': 'Could improve verbal presentation of technical concepts.',
                    'career_implications': 'May face challenges in client-facing roles initially.',
                    'related_skills': ['Public Speaking', 'Documentation'],
                    'actionable_steps': ['Join Toastmasters', 'Practice technical presentations']
                }
            ],
            'risk_areas': [],
            'opportunities': [
                {
                    'category': 'Full Stack Transition',
                    'impact': 'high',
                    'confidence': 0.88,
                    'description': 'With strong backend skills, picking up React would make you a high-value full-stack dev.',
                    'career_implications': 'Significant salary increase potential.',
                    'related_skills': ['React', 'CSS', 'JavaScript'],
                    'actionable_steps': ['Complete a React course', 'Build a personal portfolio']
                }
            ]
        }
    }
    return jsonify(insights)


@app.route('/api/job-recommendations/<int:student_id>', methods=['GET'])
def get_job_recommendations_alias(student_id):
    """Alias for job recommendations"""
    return get_job_recommendations_api(student_id)


@app.route('/api/learning/recommendations/<int:student_id>', methods=['GET'])
@app.route('/api/learning-resources/<int:student_id>', methods=['GET'])
def get_learning_resources_api(student_id):
    """Get learning resources for a student"""
    resources = [
        {'title': 'Complete Python Bootcamp', 'provider': 'Udemy', 'rating': 4.8, 'recommendation_data': {'rating': 5}},
        {'title': 'Data Science Specialization', 'provider': 'Coursera', 'rating': 4.7, 'recommendation_data': {'rating': 4}},
        {'title': 'Modern Web Development', 'provider': 'Frontend Masters', 'rating': 4.9, 'recommendation_data': {'rating': 5}}
    ]
    return jsonify({'recommendations': resources})


@app.route('/api/progress/<int:student_id>', methods=['GET'])
def get_student_progress(student_id):
    """Get progress tracking data for a student"""
    # Mock progress data
    return jsonify({
        'overall_progress': 65,
        'skill_improvements': [
            {'skill': 'Python', 'increase': 20},
            {'skill': 'DSA', 'increase': 15}
        ],
        'completed_roadmap_items': 4,
        'total_roadmap_items': 12
    })


@app.route('/api/learning-roadmap/<int:student_id>', methods=['GET'])
def get_learning_roadmap_api(student_id):
    """Get learning roadmap for a student"""
    roadmap = {
        'weeks': [
            {
                'week': 1, 
                'focus': 'Foundations of Programming', 
                'resources': ['Python Documentation', 'Real Python Tutorials'],
                'projects': ['Simple Calculator', 'Todo List'],
                'certifications': ['PCEP (Certified Associate in Python Programming)']
            },
            {
                'week': 2, 
                'focus': 'Data Structures & Algorithms', 
                'resources': ['LeetCode', 'GeeksforGeeks'],
                'projects': ['Library Management System', 'Sorting Visualizer'],
                'certifications': ['Algorithm Design Specialization (Coursera)']
            },
            {
                'week': 3, 
                'focus': 'Advanced Projects & Portfolio', 
                'resources': ['GitHub Guides', 'Portfolio Samples'],
                'projects': ['Portfolio Website', 'Fullstack E-commerce Site'],
                'certifications': ['Full Stack Web Development (EdX)']
            }
        ]
    }
    return jsonify(roadmap)


@app.route('/api/settings', methods=['GET'])
def get_settings():
    """Get system settings"""
    return jsonify({
        'appName': 'GPA Analyser',
        'version': '1.0.0',
        'adminEmail': 'admin@placeai.com',
        'enablePredictions': True,
        'maintenanceMode': False
    })


@app.route('/api/learning/roadmap/<int:student_id>', methods=['GET'])
def get_learning_roadmap(student_id):
    """Get personalized learning roadmap for a student"""
    try:
        student = Student.query.get_or_404(student_id)
        student_data = student.to_dict()
        
        target_domain = request.args.get('domain')
        roadmap = generate_learning_roadmap(student_data, target_domain)
        
        # Save roadmap to database
        LearningRoadmap.query.filter_by(student_id=student_id).delete()
        
        for week_plan in roadmap:
            roadmap_entry = LearningRoadmap(
                student_id=student_id,
                domain=week_plan.get('domain', target_domain or student_data.get('interested_domain')),
                week=week_plan['week'],
                focus_area=week_plan['focus_area'],
                skills=json.dumps(week_plan['skills']),
                resources=json.dumps(week_plan['resources']),
                projects=json.dumps(week_plan['projects']),
                certifications=json.dumps(week_plan['certifications'])
            )
            db.session.add(roadmap_entry)
        
        db.session.commit()
        
        return jsonify(roadmap)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/jobs/roles', methods=['GET'])
def get_job_roles():
    """Get all available job roles by domain"""
    return jsonify(JOB_ROLES)
@app.route('/api/ml/predictions', methods=['GET'])
def get_all_ml_predictions():
    """Get ML predictions for all students"""
    students = Student.query.all()
    predictions = {}
    for student in students:
        res = predict_readiness_ml(student.id, 'random_forest')
        if res:
            predictions[student.id] = res
    return jsonify(predictions)

@app.route('/api/analysis/comprehensive/<int:student_id>', methods=['GET'])
def comprehensive_analysis(student_id):
    """Get comprehensive analysis including traditional, ML, job recommendations, and learning roadmap"""
    try:
        student = Student.query.get_or_404(student_id)
        student_data = student.to_dict()
        
        # Traditional analysis
        traditional_analysis = run_analysis(student_data)
        
        # ML predictions
        models = ['random_forest', 'decision_tree', 'logistic_regression']
        ml_predictions = {}
        for model_type in models:
            prediction = predict_readiness_ml(student_id, model_type)
            if prediction:
                ml_predictions[model_type] = prediction
        
        # Job recommendations
        job_recommendations = get_job_recommendations(student_data)
        
        # Skill gap analysis
        skill_gaps = analyze_skill_gaps(student_data)
        
        # Learning roadmap
        learning_roadmap = generate_learning_roadmap(student_data)
        
        return jsonify({
            'traditional_analysis': traditional_analysis,
            'ml_predictions': ml_predictions,
            'job_recommendations': job_recommendations,
            'skill_gap_analysis': skill_gaps,
            'learning_roadmap': learning_roadmap
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ─── Auth Routes ─────────────────────────────────────────────────────────────

@app.route('/api/auth/login', methods=['POST'])
def login():
    """Authenticate student or admin"""
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'student')
    
    if role == 'admin':
        if email == 'admin@placeai.com' and password == 'admin123':
            return jsonify({
                'id': 999,
                'name': 'Admin User',
                'email': email,
                'role': 'admin'
            })
        return jsonify({'error': 'Invalid admin credentials'}), 401
    
    student = Student.query.filter_by(email=email).first()
    if student:
        # In a real app, use password hashing
        if student.password == password or not student.password:
            return jsonify({
                'id': student.id,
                'name': student.name,
                'email': student.email,
                'role': 'student'
            })
    
    return jsonify({'error': 'Invalid email or password'}), 401


@app.route('/api/auth/signup', methods=['POST'])
def signup():
    """Register a new student"""
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    
    if Student.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already registered'}), 400
    
    try:
        new_student = Student(name=name, email=email, password=password)
        db.session.add(new_student)
        db.session.commit()
        return jsonify({
            'id': new_student.id,
            'name': new_student.name,
            'email': new_student.email,
            'role': 'student'
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ─── Resume Routes ────────────────────────────────────────────────────────────

@app.route('/api/resume/upload', methods=['POST'])
def upload_resume():
    """Upload and analyze a resume PDF"""
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    student_id = request.form.get('student_id')
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and file.filename.endswith('.pdf'):
        try:
            # Create uploads directory if not exists
            if not os.path.exists(app.config['UPLOAD_FOLDER']):
                os.makedirs(app.config['UPLOAD_FOLDER'])
                
            # Save file temporarily
            temp_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
            file.save(temp_path)
            
            # Extract text
            text = extract_text_from_pdf(temp_path)
            skills = extract_skills(text)
            
            # Get student info for context
            student = Student.query.get(student_id)
            domain = student.interested_domain if student else "IT / Software"
            
            scores = calculate_resume_score(text, skills, domain)
            suggestions = generate_improvement_suggestions(text, skills, scores)
            sentiment = analyze_resume_sentiment(text)
            missing = extract_missing_keywords(text, domain)
            strengths = extract_strength_keywords(text, skills)
            
            # Clean up
            os.remove(temp_path)
            
            return jsonify({
                'scores': scores,
                'extracted_skills': skills,
                'suggestions': suggestions,
                'sentiment': sentiment,
                'missing_keywords': missing,
                'strength_keywords': strengths
            })
        except Exception as e:
            if os.path.exists(temp_path): os.remove(temp_path)
            return jsonify({'error': str(e)}), 500
    
    return jsonify({'error': 'Invalid file format'}), 400


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5000)
