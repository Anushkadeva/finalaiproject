import json
import numpy as np
from datetime import datetime, timedelta

def generate_ai_insights(student_data, analysis_results, ml_predictions):
    """Generate comprehensive AI insights for a student"""
    insights = {
        'strengths': [],
        'weaknesses': [],
        'risk_areas': [],
        'opportunities': []
    }
    
    # Analyze strengths
    strengths = analyze_strengths(student_data, analysis_results)
    insights['strengths'] = strengths
    
    # Analyze weaknesses
    weaknesses = analyze_weaknesses(student_data, analysis_results)
    insights['weaknesses'] = weaknesses
    
    # Identify risk areas
    risks = identify_risk_areas(student_data, analysis_results, ml_predictions)
    insights['risk_areas'] = risks
    
    # Find opportunities
    opportunities = identify_opportunities(student_data, analysis_results)
    insights['opportunities'] = opportunities
    
    return insights

def analyze_strengths(student_data, analysis_results):
    """Analyze student strengths"""
    strengths = []
    
    # High-rated skills
    high_skills = []
    for skill, rating in student_data.items():
        if isinstance(rating, (int, float)) and rating >= 4:
            skill_name = get_skill_display_name(skill)
            if skill_name:
                high_skills.append(skill_name)
    
    if high_skills:
        strengths.append({
            'category': 'Technical Excellence',
            'description': f"Strong performance in {', '.join(high_skills[:3])}",
            'confidence': 0.9,
            'impact': 'high',
            'actionable_steps': [
                "Leverage these skills in job applications",
                "Consider advanced certifications in these areas",
                "Mentor others in these skills"
            ],
            'related_skills': high_skills,
            'career_implications': "Strong foundation for senior roles and specialized positions"
        })
    
    # Consistent progress
    if analysis_results.get('readiness_pct', 0) > 70:
        strengths.append({
            'category': 'Readiness',
            'description': "High placement readiness with strong overall profile",
            'confidence': 0.85,
            'impact': 'high',
            'actionable_steps': [
                "Apply for competitive positions",
                "Prepare for technical interviews",
                "Network with industry professionals"
            ],
            'related_skills': ['Interview Preparation', 'Communication'],
            'career_implications': "Ready for immediate placement with good companies"
        })
    
    # Project and internship experience
    projects = student_data.get('projects', '0')
    internship = student_data.get('internship', 'NO')
    
    if projects in ['3-5', '5+'] and internship == 'YES':
        strengths.append({
            'category': 'Practical Experience',
            'description': "Strong hands-on experience with projects and internships",
            'confidence': 0.8,
            'impact': 'high',
            'actionable_steps': [
                "Showcase projects in portfolio",
                "Highlight internship achievements",
                "Seek leadership roles in team projects"
            ],
            'related_skills': ['Project Management', 'Team Collaboration'],
            'career_implications': "Practical experience highly valued by employers"
        })
    
    return strengths

def analyze_weaknesses(student_data, analysis_results):
    """Analyze student weaknesses"""
    weaknesses = []
    
    # Low-rated skills
    low_skills = []
    for skill, rating in student_data.items():
        if isinstance(rating, (int, float)) and rating <= 2:
            skill_name = get_skill_display_name(skill)
            if skill_name:
                low_skills.append(skill_name)
    
    if low_skills:
        weaknesses.append({
            'category': 'Skill Gaps',
            'description': f"Needs improvement in {', '.join(low_skills[:3])}",
            'confidence': 0.8,
            'impact': 'medium',
            'actionable_steps': [
                "Take online courses in these areas",
                "Practice with hands-on projects",
                "Seek mentorship from experts"
            ],
            'related_skills': low_skills,
            'career_implications': "These gaps may limit opportunities in certain roles"
        })
    
    # Lack of practical experience
    projects = student_data.get('projects', '0')
    internship = student_data.get('internship', 'NO')
    
    if projects in ['0', '1-2'] and internship == 'NO':
        weaknesses.append({
            'category': 'Experience Gap',
            'description': "Limited practical experience through projects and internships",
            'confidence': 0.85,
            'impact': 'high',
            'actionable_steps': [
                "Build 2-3 portfolio projects",
                "Apply for internships",
                "Contribute to open source projects"
            ],
            'related_skills': ['Project Development', 'Professional Experience'],
            'career_implications': "Practical experience is crucial for placement success"
        })
    
    # Low readiness
    if analysis_results.get('readiness_pct', 0) < 50:
        weaknesses.append({
            'category': 'Overall Readiness',
            'description': "Below-average placement readiness",
            'confidence': 0.9,
            'impact': 'high',
            'actionable_steps': [
                "Focus on improving core skills",
                "Build strong project portfolio",
                "Prepare for technical interviews"
            ],
            'related_skills': ['Core Competencies', 'Interview Skills'],
            'career_implications': "May need additional preparation before placement"
        })
    
    return weaknesses

def identify_risk_areas(student_data, analysis_results, ml_predictions):
    """Identify potential risk areas"""
    risks = []
    
    # ML model disagreement
    if ml_predictions:
        predictions = list(ml_predictions.values())
        readiness_values = [p.get('predicted_percentage', 0) for p in predictions]
        
        if max(readiness_values) - min(readiness_values) > 30:
            risks.append({
                'category': 'Inconsistent Profile',
                'description': "ML models show inconsistent readiness predictions",
                'confidence': 0.75,
                'impact': 'medium',
                'actionable_steps': [
                    "Review and balance skill ratings",
                    "Focus on consistently strong areas",
                    "Seek feedback on skill assessment"
                ],
                'related_skills': ['Skill Assessment', 'Profile Consistency'],
                'career_implications': "Inconsistent profile may confuse employers"
            })
    
    # Domain mismatch
    interested_domain = student_data.get('interested_domain', '')
    best_domain = analysis_results.get('best_domain', '')
    
    if interested_domain != best_domain:
        risks.append({
            'category': 'Domain Misalignment',
            'description': f"Interest in {interested_domain} but skills align better with {best_domain}",
            'confidence': 0.8,
            'impact': 'medium',
            'actionable_steps': [
                "Consider aligning interests with strengths",
                "Develop skills for preferred domain",
                "Explore hybrid roles"
            ],
            'related_skills': ['Career Planning', 'Skill Alignment'],
            'career_implications': "May need to adjust career expectations or skill development"
        })
    
    # Low certifications
    if student_data.get('certifications', 'NO') == 'NO':
        risks.append({
            'category': 'Certification Gap',
            'description': "No professional certifications to validate skills",
            'confidence': 0.7,
            'impact': 'medium',
            'actionable_steps': [
                "Earn relevant certifications",
                "Complete online courses with certificates",
                "Participate in hackathons and competitions"
            ],
            'related_skills': ['Professional Validation', 'Continuous Learning'],
            'career_implications': "Certifications help stand out in competitive market"
        })
    
    return risks

def identify_opportunities(student_data, analysis_results):
    """Identify growth opportunities"""
    opportunities = []
    
    # High potential areas
    domain_scores = analysis_results.get('domain_scores', {})
    
    for domain, scores in domain_scores.items():
        if scores.get('pct', 0) > 60 and domain != analysis_results.get('best_domain'):
            opportunities.append({
                'category': 'Cross-Domain Potential',
                'description': f"Strong potential in {domain} domain",
                'confidence': 0.75,
                'impact': 'medium',
                'actionable_steps': [
                    "Explore roles in this domain",
                    "Develop additional skills for this area",
                    "Consider interdisciplinary positions"
                ],
                'related_skills': ['Adaptability', 'Cross-Functional Skills'],
                'career_implications': "Cross-domain skills open more opportunities"
            })
    
    # Fast growth areas
    medium_skills = []
    for skill, rating in student_data.items():
        if isinstance(rating, (int, float)) and rating == 3:
            skill_name = get_skill_display_name(skill)
            if skill_name:
                medium_skills.append(skill_name)
    
    if medium_skills:
        opportunities.append({
            'category': 'Quick Wins',
            'description': f"Can quickly improve {', '.join(medium_skills[:2])} to advanced level",
            'confidence': 0.8,
            'impact': 'medium',
            'actionable_steps': [
                "Focus practice on these skills",
                "Take intermediate to advanced courses",
                "Apply skills in real projects"
            ],
            'related_skills': medium_skills,
            'career_implications': "Quick improvement can significantly boost readiness"
        })
    
    # Emerging tech opportunities
    emerging_skills = ['machine learning', 'cloud computing', 'data science', 'cybersecurity']
    student_emerging = [skill for skill in emerging_skills if skill in str(student_data).lower()]
    
    if len(student_emerging) >= 2:
        opportunities.append({
            'category': 'Emerging Technologies',
            'description': "Strong foundation in emerging technologies",
            'confidence': 0.85,
            'impact': 'high',
            'actionable_steps': [
                "Deepen expertise in these technologies",
                "Build specialized projects",
                "Network with professionals in these areas"
            ],
            'related_skills': student_emerging,
            'career_implications': "Emerging tech skills are in high demand"
        })
    
    return opportunities

def get_skill_display_name(skill_key):
    """Convert skill key to display name"""
    skill_map = {
        'comm_rating': 'Communication',
        'aptitude_rating': 'Aptitude',
        'ps_rating': 'Problem Solving',
        'teamwork_rating': 'Teamwork',
        'adapt_rating': 'Adaptability',
        'prog_rating': 'Programming',
        'dsa_rating': 'Data Structures & Algorithms',
        'webdev_rating': 'Web Development',
        'sql_rating': 'SQL',
        'ml_rating': 'Machine Learning',
        'da_rating': 'Data Analysis',
        'cloud_rating': 'Cloud Computing',
        'cyber_rating': 'Cybersecurity',
        'dm_rating': 'Digital Marketing',
        'seo_rating': 'SEO',
        'content_rating': 'Content Writing',
        'social_rating': 'Social Media',
        'uiux_rating': 'UI/UX Design',
        'graphic_rating': 'Graphic Design',
        'video_rating': 'Video Editing',
        'creativity_rating': 'Creativity'
    }
    return skill_map.get(skill_key, '')

def calculate_career_suitability(student_data, analysis_results, job_recommendations):
    """Calculate career suitability scores"""
    suitability = {}
    
    # Base readiness score
    base_score = analysis_results.get('readiness_pct', 0) / 100
    
    # Domain-specific suitability
    domain_scores = analysis_results.get('domain_scores', {})
    
    for domain, scores in domain_scores.items():
        domain_score = scores.get('pct', 0) / 100
        
        # Adjust based on student interest
        interest_bonus = 0.1 if student_data.get('interested_domain') == domain else 0
        
        # Adjust based on experience
        exp_bonus = 0
        if student_data.get('internship') == 'YES':
            exp_bonus += 0.1
        if student_data.get('projects') in ['3-5', '5+']:
            exp_bonus += 0.1
        
        suitability[domain] = min((domain_score + interest_bonus + exp_bonus), 1.0)
    
    # Overall suitability
    suitability['overall'] = base_score
    
    return suitability
