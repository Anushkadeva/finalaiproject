import PyPDF2
import re
import json
from collections import Counter
from textblob import TextBlob
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize

# Download required NLTK data
try:
    nltk.data.find('tokenizers/punkt')
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('punkt')
    nltk.download('stopwords')

# Technical skills keywords
TECHNICAL_SKILLS = {
    'Programming': ['python', 'java', 'javascript', 'c++', 'c#', 'ruby', 'php', 'go', 'rust', 'swift', 'kotlin'],
    'Web Development': ['html', 'css', 'react', 'angular', 'vue', 'nodejs', 'express', 'django', 'flask', 'spring'],
    'Databases': ['sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'oracle', 'nosql', 'cassandra'],
    'Cloud/DevOps': ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'terraform', 'ansible', 'ci/cd'],
    'Data Science': ['machine learning', 'data analysis', 'pandas', 'numpy', 'scikit-learn', 'tensorflow', 'pytorch', 'r'],
    'Mobile': ['android', 'ios', 'react native', 'flutter', 'swift', 'kotlin', 'xamarin'],
    'Testing': ['junit', 'selenium', 'pytest', 'jest', 'mocha', 'cypress', 'unit testing', 'integration testing'],
    'Version Control': ['git', 'github', 'gitlab', 'bitbucket', 'svn', 'mercurial'],
    'Methodologies': ['agile', 'scrum', 'kanban', 'waterfall', 'devops', 'tdd', 'bdd']
}

# Soft skills keywords
SOFT_SKILLS = [
    'leadership', 'communication', 'teamwork', 'problem solving', 'critical thinking',
    'creativity', 'adaptability', 'time management', 'project management', 'analytical',
    'collaboration', 'interpersonal', 'presentation', 'negotiation', 'decision making'
]

# Education keywords
EDUCATION_KEYWORDS = [
    'bachelor', 'master', 'phd', 'degree', 'university', 'college', 'institute',
    'engineering', 'computer science', 'information technology', 'business administration'
]

# Experience indicators
EXPERIENCE_KEYWORDS = [
    'years of experience', 'worked', 'developed', 'designed', 'implemented', 'managed',
    'led', 'coordinated', 'architected', 'built', 'created', 'maintained', 'optimized'
]

def extract_text_from_pdf(pdf_path):
    """Extract text from PDF file"""
    try:
        with open(pdf_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            text = ""
            for page in reader.pages:
                text += page.extract_text()
        return text.lower()
    except Exception as e:
        raise Exception(f"Error extracting text from PDF: {str(e)}")

def extract_skills(text):
    """Extract technical and soft skills from resume text"""
    found_skills = {
        'technical': [],
        'soft': [],
        'tools': [],
        'methodologies': []
    }
    
    text_words = word_tokenize(text.lower())
    text_words = [word for word in text_words if word not in stopwords.words('english')]
    
    # Extract technical skills
    for category, skills in TECHNICAL_SKILLS.items():
        for skill in skills:
            if skill in text:
                found_skills['technical'].append(skill)
    
    # Extract soft skills
    for skill in SOFT_SKILLS:
        if skill in text:
            found_skills['soft'].append(skill)
    
    # Extract common tools and technologies
    tools = ['github', 'gitlab', 'jira', 'slack', 'vs code', 'intellij', 'eclipse', 'postman', 'figma']
    for tool in tools:
        if tool in text:
            found_skills['tools'].append(tool)
    
    # Remove duplicates and return
    for category in found_skills:
        found_skills[category] = list(set(found_skills[category]))
    
    return found_skills

def calculate_resume_score(text, extracted_skills, student_domain):
    """Calculate overall resume score"""
    scores = {
        'completeness': 0,
        'skill_relevance': 0,
        'format': 0,
        'overall': 0
    }
    
    # Completeness score (40% weight)
    completeness_indicators = 0
    total_indicators = 8
    
    # Check for key sections
    if any(word in text for word in ['education', 'academic']):
        completeness_indicators += 1
    if any(word in text for word in ['experience', 'work', 'employment']):
        completeness_indicators += 1
    if any(word in text for word in ['skills', 'technical', 'expertise']):
        completeness_indicators += 1
    if any(word in text for word in ['projects', 'portfolio']):
        completeness_indicators += 1
    if any(word in text for word in ['certification', 'certificate']):
        completeness_indicators += 1
    if re.search(r'\b\d{4}\b', text):  # Has years (experience/education)
        completeness_indicators += 1
    if '@' in text and '.' in text:  # Has email
        completeness_indicators += 1
    if len(text) > 500:  # Sufficient length
        completeness_indicators += 1
    
    scores['completeness'] = (completeness_indicators / total_indicators) * 100
    
    # Skill relevance score (40% weight)
    domain_skills = TECHNICAL_SKILLS.get(student_domain.replace(' ', '/').replace('&', 'and'), [])
    relevant_skills = [skill for skill in extracted_skills['technical'] if skill in domain_skills]
    
    if len(domain_skills) > 0:
        scores['skill_relevance'] = (len(relevant_skills) / len(domain_skills)) * 100
    else:
        scores['skill_relevance'] = len(extracted_skills['technical']) * 10  # Fallback
    
    # Format score (20% weight)
    format_score = 0
    if re.search(r'\b[A-Z][a-z]+ [A-Z][a-z]+\b', text):  # Proper names
        format_score += 25
    if re.search(r'\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b', text):  # Dates
        format_score += 25
    if re.search(r'\b\d{10}\b', text):  # Phone numbers
        format_score += 25
    if len(extracted_skills['technical']) > 0:  # Has skills section
        format_score += 25
    
    scores['format'] = min(format_score, 100)
    
    # Overall score
    scores['overall'] = (
        scores['completeness'] * 0.4 +
        scores['skill_relevance'] * 0.4 +
        scores['format'] * 0.2
    )
    
    return scores

def generate_improvement_suggestions(text, extracted_skills, scores):
    """Generate improvement suggestions based on resume analysis"""
    suggestions = []
    
    # Completeness suggestions
    if scores['completeness'] < 70:
        if 'education' not in text:
            suggestions.append("Add education section with degree and institution details")
        if 'experience' not in text:
            suggestions.append("Include work experience or internship details")
        if 'skills' not in text:
            suggestions.append("Create a dedicated skills section")
        if 'projects' not in text:
            suggestions.append("Add projects section to showcase practical experience")
        if 'certification' not in text:
            suggestions.append("Include relevant certifications and achievements")
    
    # Skill relevance suggestions
    if scores['skill_relevance'] < 60:
        suggestions.append("Add more domain-specific technical skills")
        suggestions.append("Include keywords relevant to your target job roles")
    
    # Format suggestions
    if scores['format'] < 70:
        suggestions.append("Ensure proper formatting with clear sections")
        suggestions.append("Add contact information (email, phone)")
        suggestions.append("Include dates for education and experience")
    
    # Content suggestions
    if len(extracted_skills['technical']) < 5:
        suggestions.append("Expand your technical skills section")
    
    if len(extracted_skills['soft']) < 3:
        suggestions.append("Highlight soft skills and interpersonal abilities")
    
    # General suggestions
    suggestions.append("Quantify achievements with metrics and numbers")
    suggestions.append("Use action verbs to describe experience")
    suggestions.append("Tailor resume to specific job descriptions")
    suggestions.append("Keep resume concise and focused (1-2 pages)")
    
    return suggestions[:8]  # Return top 8 suggestions

def analyze_resume_sentiment(text):
    """Analyze sentiment and confidence from resume text"""
    try:
        blob = TextBlob(text)
        sentiment = blob.sentiment
        
        # Map sentiment to confidence
        if sentiment.polarity > 0.3:
            confidence_level = "High"
        elif sentiment.polarity > 0:
            confidence_level = "Medium"
        else:
            confidence_level = "Low"
        
        return {
            'polarity': sentiment.polarity,
            'subjectivity': sentiment.subjectivity,
            'confidence_level': confidence_level
        }
    except:
        return {
            'polarity': 0,
            'subjectivity': 0,
            'confidence_level': "Medium"
        }

def extract_missing_keywords(text, student_domain):
    """Identify missing important keywords for the domain"""
    missing_keywords = []
    
    # Domain-specific keywords
    domain_keywords = {
        'Data & AI': ['machine learning', 'data science', 'python', 'sql', 'statistics', 'algorithms'],
        'IT / Software': ['programming', 'software development', 'debugging', 'testing', 'algorithms'],
        'Design': ['design thinking', 'user experience', 'prototyping', 'visual design', 'creativity'],
        'Marketing': ['digital marketing', 'analytics', 'campaigns', 'strategy', 'communication']
    }
    
    relevant_keywords = domain_keywords.get(student_domain, [])
    
    for keyword in relevant_keywords:
        if keyword not in text.lower():
            missing_keywords.append(keyword)
    
    return missing_keywords[:5]  # Return top 5 missing keywords

def extract_strength_keywords(text, extracted_skills):
    """Identify strength keywords present in resume"""
    strength_keywords = []
    
    # Achievement indicators
    achievement_words = ['led', 'achieved', 'improved', 'increased', 'reduced', 'optimized', 'developed', 'created']
    
    for word in achievement_words:
        if word in text.lower():
            strength_keywords.append(word)
    
    # Add strong technical skills
    if len(extracted_skills['technical']) > 3:
        strength_keywords.extend(extracted_skills['technical'][:3])
    
    return list(set(strength_keywords))[:5]  # Return unique strengths
