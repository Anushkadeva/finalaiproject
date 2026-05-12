import json
from datetime import datetime

# Comprehensive learning resources database
LEARNING_RESOURCES = {
    'courses': {
        'Programming': [
            {
                'title': 'Python for Everybody',
                'platform': 'Coursera',
                'provider': 'University of Michigan',
                'duration': '4 weeks',
                'level': 'beginner',
                'url': 'https://www.coursera.org/learn/python',
                'rating': 4.8,
                'skills': ['python', 'programming', 'problem solving']
            },
            {
                'title': 'Complete Web Developer Bootcamp',
                'platform': 'Udemy',
                'provider': 'Colt Steele',
                'duration': '8 weeks',
                'level': 'beginner',
                'url': 'https://www.udemy.com/course/the-complete-web-developer-bootcamp',
                'rating': 4.7,
                'skills': ['html', 'css', 'javascript', 'react', 'nodejs']
            },
            {
                'title': 'Machine Learning A-Z',
                'platform': 'Udemy',
                'provider': 'Kirill Eremenko',
                'duration': '10 weeks',
                'level': 'intermediate',
                'url': 'https://www.udemy.com/course/machinelearning',
                'rating': 4.6,
                'skills': ['machine learning', 'python', 'data science']
            }
        ],
        'Data Science': [
            {
                'title': 'Data Science Professional Certificate',
                'platform': 'Coursera',
                'provider': 'IBM',
                'duration': '12 weeks',
                'level': 'beginner',
                'url': 'https://www.coursera.org/professional-certificates/ibm-data-science',
                'rating': 4.6,
                'skills': ['data analysis', 'python', 'sql', 'machine learning']
            },
            {
                'title': 'SQL for Data Science',
                'platform': 'Coursera',
                'provider': 'UC Davis',
                'duration': '3 weeks',
                'level': 'intermediate',
                'url': 'https://www.coursera.org/learn/sql-for-data-science',
                'rating': 4.7,
                'skills': ['sql', 'data analysis', 'databases']
            }
        ],
        'Cloud Computing': [
            {
                'title': 'AWS Certified Solutions Architect',
                'platform': 'Udemy',
                'provider': 'Stephane Maarek',
                'duration': '6 weeks',
                'level': 'intermediate',
                'url': 'https://www.udemy.com/course/aws-certified-solutions-architect-associate',
                'rating': 4.7,
                'skills': ['aws', 'cloud computing', 'architecture']
            }
        ],
        'Digital Marketing': [
            {
                'title': 'Google Digital Marketing Certificate',
                'platform': 'Coursera',
                'provider': 'Google',
                'duration': '6 weeks',
                'level': 'beginner',
                'url': 'https://www.coursera.org/professional-certificates/google-digital-marketing',
                'rating': 4.6,
                'skills': ['digital marketing', 'seo', 'social media', 'analytics']
            }
        ]
    },
    'youtube': {
        'Programming': [
            {
                'title': 'Python Tutorial for Beginners',
                'channel': 'Programming with Mosh',
                'duration': '2 hours',
                'level': 'beginner',
                'url': 'https://www.youtube.com/watch?v=rfscVS0vtvw',
                'views': '25M+',
                'skills': ['python', 'programming basics']
            },
            {
                'title': 'JavaScript Full Course',
                'channel': 'freeCodeCamp',
                'duration': '6 hours',
                'level': 'beginner',
                'url': 'https://www.youtube.com/watch?v=PkZNo7MFNFg',
                'views': '10M+',
                'skills': ['javascript', 'web development']
            },
            {
                'title': 'Data Structures and Algorithms',
                'channel': 'Abdul Bari',
                'duration': '8 hours',
                'level': 'intermediate',
                'url': 'https://www.youtube.com/watch?v=0IvILv-v9Lw',
                'views': '5M+',
                'skills': ['data structures', 'algorithms']
            }
        ],
        'Machine Learning': [
            {
                'title': 'Machine Learning Course',
                'channel': 'Stanford University',
                'duration': '20 hours',
                'level': 'advanced',
                'url': 'https://www.youtube.com/playlist?list=PLA89DCFA6ADACE599',
                'views': '2M+',
                'skills': ['machine learning', 'algorithms', 'theory']
            },
            {
                'title': 'Practical Machine Learning',
                'channel': 'StatQuest with Josh Starmer',
                'duration': '15 hours',
                'level': 'intermediate',
                'url': 'https://www.youtube.com/playlist?list=PLblH5jT_bTLidQb5QHJ1EiFKL9NWTaGZ2',
                'views': '3M+',
                'skills': ['machine learning', 'statistics', 'practical ml']
            }
        ],
        'Web Development': [
            {
                'title': 'React Tutorial',
                'channel': 'The Net Ninja',
                'duration': '4 hours',
                'level': 'intermediate',
                'url': 'https://www.youtube.com/playlist?list=PL4cUxeGkcC9gZD-TvwfodTTgaRyinRENX',
                'views': '1M+',
                'skills': ['react', 'javascript', 'frontend']
            },
            {
                'title': 'Node.js Tutorial',
                'channel': 'Traversy Media',
                'duration': '3 hours',
                'level': 'intermediate',
                'url': 'https://www.youtube.com/watch?v=Oe421IPjeIk',
                'views': '2M+',
                'skills': ['nodejs', 'javascript', 'backend']
            }
        ]
    },
    'practice_platforms': {
        'Programming': [
            {
                'name': 'LeetCode',
                'description': 'Algorithm and data structure problems',
                'difficulty': 'easy to hard',
                'url': 'https://leetcode.com',
                'features': ['daily challenges', 'contests', 'discussions'],
                'skills': ['algorithms', 'data structures', 'problem solving']
            },
            {
                'name': 'HackerRank',
                'description': 'Coding challenges and interview prep',
                'difficulty': 'easy to hard',
                'url': 'https://www.hackerrank.com',
                'features': ['interview prep', 'certifications', 'skill tracks'],
                'skills': ['programming', 'algorithms', 'interview preparation']
            },
            {
                'name': 'Codewars',
                'description': 'Martial arts themed coding challenges',
                'difficulty': 'easy to expert',
                'url': 'https://www.codewars.com',
                'features': ['kata system', 'community solutions', 'rank progression'],
                'skills': ['problem solving', 'algorithms', 'clean code']
            }
        ],
        'Data Science': [
            {
                'name': 'Kaggle',
                'description': 'Data science competitions and datasets',
                'difficulty': 'intermediate to expert',
                'url': 'https://www.kaggle.com',
                'features': ['competitions', 'datasets', 'notebooks', 'courses'],
                'skills': ['machine learning', 'data analysis', 'python']
            },
            {
                'name': 'DrivenData',
                'description': 'Data science for social good',
                'difficulty': 'intermediate',
                'url': 'https://www.drivendata.org',
                'features': ['social impact projects', 'learning tracks'],
                'skills': ['data science', 'machine learning', 'social impact']
            }
        ],
        'Web Development': [
            {
                'name': 'Frontend Mentor',
                'description': 'Real-world frontend challenges',
                'difficulty': 'beginner to expert',
                'url': 'https://www.frontendmentor.io',
                'features': ['professional designs', 'solutions', 'community'],
                'skills': ['html', 'css', 'javascript', 'design']
            },
            {
                'name': 'CodePen',
                'description': 'Online code editor and community',
                'difficulty': 'beginner to expert',
                'url': 'https://codepen.io',
                'features': ['live coding', 'challenges', 'components'],
                'skills': ['frontend', 'creativity', 'prototyping']
            }
        ]
    },
    'projects': {
        'Programming': [
            {
                'title': 'E-commerce Website',
                'description': 'Full-stack e-commerce platform with payment integration',
                'difficulty': 'intermediate',
                'duration': '2-3 weeks',
                'skills': ['web development', 'databases', 'authentication'],
                'technologies': ['React', 'Node.js', 'MongoDB', 'Stripe']
            },
            {
                'title': 'Weather App',
                'description': 'Real-time weather application with API integration',
                'difficulty': 'beginner',
                'duration': '1 week',
                'skills': ['api integration', 'frontend', 'data visualization'],
                'technologies': ['JavaScript', 'HTML', 'CSS', 'Weather API']
            },
            {
                'title': 'Task Management System',
                'description': 'Collaborative task management with real-time updates',
                'difficulty': 'intermediate',
                'duration': '2 weeks',
                'skills': ['full-stack', 'real-time communication', 'databases'],
                'technologies': ['React', 'Socket.io', 'Express', 'PostgreSQL']
            }
        ],
        'Machine Learning': [
            {
                'title': 'Sentiment Analysis Tool',
                'description': 'Analyze sentiment of text using NLP',
                'difficulty': 'intermediate',
                'duration': '1-2 weeks',
                'skills': ['nlp', 'machine learning', 'python'],
                'technologies': ['Python', 'NLTK', 'Scikit-learn', 'Flask']
            },
            {
                'title': 'Image Classification',
                'description': 'Classify images using deep learning',
                'difficulty': 'advanced',
                'duration': '2-3 weeks',
                'skills': ['deep learning', 'computer vision', 'tensorflow'],
                'technologies': ['Python', 'TensorFlow', 'Keras', 'OpenCV']
            },
            {
                'title': 'Recommendation System',
                'description': 'Build a movie or product recommendation engine',
                'difficulty': 'intermediate',
                'duration': '2 weeks',
                'skills': ['machine learning', 'algorithms', 'data processing'],
                'technologies': ['Python', 'Pandas', 'Scikit-learn', 'Flask']
            }
        ],
        'Data Science': [
            {
                'title': 'Sales Dashboard',
                'description': 'Interactive dashboard for sales data analysis',
                'difficulty': 'intermediate',
                'duration': '1-2 weeks',
                'skills': ['data analysis', 'visualization', 'dashboards'],
                'technologies': ['Python', 'Pandas', 'Plotly', 'Dash']
            },
            {
                'title': 'COVID-19 Data Analysis',
                'description': 'Analyze and visualize COVID-19 trends',
                'difficulty': 'beginner',
                'duration': '1 week',
                'skills': ['data analysis', 'visualization', 'statistics'],
                'technologies': ['Python', 'Matplotlib', 'Seaborn', 'Jupyter']
            }
        ]
    }
}

def generate_learning_recommendations(student_data, skill_gaps, student_domain):
    """Generate personalized learning recommendations"""
    recommendations = []
    
    # Get skill gaps
    gaps = skill_gaps.get('skill_gaps', [])
    
    for gap in gaps[:5]:  # Top 5 gaps
        skill_name = gap['skill']
        current_level = gap['current_level']
        target_level = gap['required_level']
        
        # Generate recommendations for each gap
        skill_recommendations = generate_skill_recommendations(skill_name, current_level, target_level, student_domain)
        recommendations.extend(skill_recommendations)
    
    return recommendations

def generate_skill_recommendations(skill_name, current_level, target_level, domain):
    """Generate recommendations for a specific skill"""
    recommendations = []
    
    # Map skill to resource categories
    skill_mapping = {
        'Programming': 'Programming',
        'DSA': 'Programming',
        'Web Development': 'Programming',
        'SQL': 'Data Science',
        'Machine Learning': 'Machine Learning',
        'Data Analysis': 'Data Science',
        'Cloud/DevOps': 'Cloud Computing',
        'Digital Marketing': 'Digital Marketing',
        'SEO': 'Digital Marketing',
        'Content Writing': 'Digital Marketing',
        'Social Media': 'Digital Marketing',
        'UI/UX Design': 'Web Development',
        'Graphic Design': 'Web Development',
        'Video Editing': 'Web Development'
    }
    
    category = skill_mapping.get(skill_name, 'Programming')
    
    # Determine difficulty level
    if current_level <= 1:
        difficulty = 'beginner'
    elif current_level <= 3:
        difficulty = 'intermediate'
    else:
        difficulty = 'advanced'
    
    # Course recommendations
    if category in LEARNING_RESOURCES['courses']:
        courses = LEARNING_RESOURCES['courses'][category]
        suitable_courses = [c for c in courses if c['level'] == difficulty or c['level'] == 'beginner']
        
        for course in suitable_courses[:2]:  # Top 2 courses
            recommendations.append({
                'skill_name': skill_name,
                'current_level': current_level,
                'target_level': target_level,
                'recommendation_type': 'course',
                'recommendation_data': {
                    'title': course['title'],
                    'platform': course['platform'],
                    'provider': course['provider'],
                    'duration': course['duration'],
                    'level': course['level'],
                    'url': course['url'],
                    'rating': course['rating'],
                    'skills': course['skills']
                },
                'priority': 'high',
                'estimated_time': course['duration'],
                'difficulty_level': difficulty
            })
    
    # YouTube recommendations
    if category in LEARNING_RESOURCES['youtube']:
        videos = LEARNING_RESOURCES['youtube'][category]
        suitable_videos = [v for v in videos if v['level'] == difficulty or v['level'] == 'beginner']
        
        for video in suitable_videos[:2]:  # Top 2 videos
            recommendations.append({
                'skill_name': skill_name,
                'current_level': current_level,
                'target_level': target_level,
                'recommendation_type': 'video',
                'recommendation_data': {
                    'title': video['title'],
                    'channel': video['channel'],
                    'duration': video['duration'],
                    'level': video['level'],
                    'url': video['url'],
                    'views': video['views'],
                    'skills': video['skills']
                },
                'priority': 'medium',
                'estimated_time': video['duration'],
                'difficulty_level': difficulty
            })
    
    # Practice platform recommendations
    if category in LEARNING_RESOURCES['practice_platforms']:
        platforms = LEARNING_RESOURCES['practice_platforms'][category]
        
        for platform in platforms[:2]:  # Top 2 platforms
            recommendations.append({
                'skill_name': skill_name,
                'current_level': current_level,
                'target_level': target_level,
                'recommendation_type': 'platform',
                'recommendation_data': {
                    'name': platform['name'],
                    'description': platform['description'],
                    'difficulty': platform['difficulty'],
                    'url': platform['url'],
                    'features': platform['features'],
                    'skills': platform['skills']
                },
                'priority': 'medium',
                'estimated_time': 'ongoing',
                'difficulty_level': difficulty
            })
    
    # Project recommendations
    if category in LEARNING_RESOURCES['projects']:
        projects = LEARNING_RESOURCES['projects'][category]
        suitable_projects = [p for p in projects if p['difficulty'] == difficulty or p['difficulty'] == 'beginner']
        
        for project in suitable_projects[:1]:  # Top 1 project
            recommendations.append({
                'skill_name': skill_name,
                'current_level': current_level,
                'target_level': target_level,
                'recommendation_type': 'project',
                'recommendation_data': {
                    'title': project['title'],
                    'description': project['description'],
                    'difficulty': project['difficulty'],
                    'duration': project['duration'],
                    'skills': project['skills'],
                    'technologies': project['technologies']
                },
                'priority': 'high',
                'estimated_time': project['duration'],
                'difficulty_level': difficulty
            })
    
    return recommendations

def calculate_priority(skill_gap, student_profile):
    """Calculate recommendation priority based on various factors"""
    priority_score = 0
    
    # Gap size impact
    gap_size = skill_gap.get('gap', 0)
    if gap_size > 2:
        priority_score += 3
    elif gap_size > 1:
        priority_score += 2
    else:
        priority_score += 1
    
    # Domain relevance
    if skill_gap.get('priority') == 'High':
        priority_score += 2
    
    # Student's current level
    current_level = skill_gap.get('current_level', 0)
    if current_level <= 1:
        priority_score += 2
    elif current_level <= 2:
        priority_score += 1
    
    # Convert to priority string
    if priority_score >= 5:
        return 'high'
    elif priority_score >= 3:
        return 'medium'
    else:
        return 'low'

def get_learning_path(student_domain, current_skills):
    """Get structured learning path for domain"""
    learning_paths = {
        'Data & AI': [
            {'week': 1, 'focus': 'Python Fundamentals', 'resources': ['Python for Everybody']},
            {'week': 2, 'focus': 'Data Analysis Basics', 'resources': ['SQL for Data Science']},
            {'week': 3, 'focus': 'Statistics & Probability', 'resources': ['Statistics with Python']},
            {'week': 4, 'focus': 'Machine Learning Intro', 'resources': ['Machine Learning A-Z']},
            {'week': 5, 'focus': 'Deep Learning', 'resources': ['Deep Learning Specialization']},
            {'week': 6, 'focus': 'Projects & Portfolio', 'resources': ['Kaggle Competitions']}
        ],
        'IT / Software': [
            {'week': 1, 'focus': 'Programming Fundamentals', 'resources': ['Python Tutorial']},
            {'week': 2, 'focus': 'Data Structures', 'resources': ['Abdul Bari DSA']},
            {'week': 3, 'focus': 'Web Development', 'resources': ['Web Developer Bootcamp']},
            {'week': 4, 'focus': 'Databases & SQL', 'resources': ['SQL for Beginners']},
            {'week': 5, 'focus': 'Cloud Computing', 'resources': ['AWS Certification']},
            {'week': 6, 'focus': 'Full Stack Project', 'resources': ['E-commerce Project']}
        ],
        'Design': [
            {'week': 1, 'focus': 'Design Principles', 'resources': ['Design Fundamentals']},
            {'week': 2, 'focus': 'UI/UX Basics', 'resources': ['Google UX Design']},
            {'week': 3, 'focus': 'Tools & Software', 'resources': ['Figma Tutorial']},
            {'week': 4, 'focus': 'Web Design', 'resources': ['Frontend Mentor']},
            {'week': 5, 'focus': 'Portfolio Building', 'resources': ['Portfolio Projects']},
            {'week': 6, 'focus': 'Advanced Techniques', 'resources': ['Advanced UI/UX']}
        ],
        'Marketing': [
            {'week': 1, 'focus': 'Marketing Fundamentals', 'resources': ['Google Digital Marketing']},
            {'week': 2, 'focus': 'SEO Basics', 'resources': ['SEO Course']},
            {'week': 3, 'focus': 'Content Marketing', 'resources': ['Content Strategy']},
            {'week': 4, 'focus': 'Social Media', 'resources': ['Social Media Marketing']},
            {'week': 5, 'focus': 'Analytics', 'resources': ['Google Analytics']},
            {'week': 6, 'focus': 'Campaign Management', 'resources': ['Marketing Projects']}
        ]
    }
    
    return learning_paths.get(student_domain, learning_paths['IT / Software'])
