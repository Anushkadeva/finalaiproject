import random
import json
import pandas as pd
from datetime import datetime, timedelta

# Realistic student data generator
FIRST_NAMES = ['Rahul', 'Priya', 'Amit', 'Anjali', 'Vikram', 'Sneha', 'Rohit', 'Kavya', 
               'Arjun', 'Divya', 'Karan', 'Neha', 'Aditya', 'Pooja', 'Raj', 'Meera',
               'Vikas', 'Swati', 'Manoj', 'Rashmi', 'Pankaj', 'Anita', 'Sunil', 'Geeta',
               'Deepak', 'Ritu', 'Ajay', 'Kavita', 'Ramesh', 'Sunita', 'Mohan', 'Anita']

LAST_NAMES = ['Sharma', 'Patel', 'Kumar', 'Singh', 'Reddy', 'Gupta', 'Jain', 'Agarwal',
              'Shah', 'Mishra', 'Verma', 'Chopra', 'Malhotra', 'Kapoor', 'Bansal',
              'Tiwari', 'Choudhary', 'Nair', 'Iyer', 'Menon', 'Pillai', 'Rao']

BRANCHES = ['CSE', 'ISE', 'AIML', 'ECE', 'EEE', 'Mechanical', 'Civil', 'Chemical']
DOMAINS = ['Data & AI', 'IT / Software', 'Design', 'Marketing']
YEARS = ['1st', '2nd', '3rd', '4th']

def generate_realistic_skills(domain, year):
    """Generate realistic skill ratings based on domain and year"""
    base_skills = {
        'comm_rating': random.randint(2, 4),
        'aptitude_rating': random.randint(2, 4),
        'ps_rating': random.randint(2, 4),
        'teamwork_rating': random.randint(3, 5),
        'adapt_rating': random.randint(3, 4),
    }
    
    # Domain-specific skills
    if domain == 'Data & AI':
        base_skills.update({
            'prog_rating': random.randint(3, 5),
            'dsa_rating': random.randint(2, 4),
            'ml_rating': random.randint(3, 5),
            'da_rating': random.randint(3, 5),
            'sql_rating': random.randint(3, 4),
            'cloud_rating': random.randint(1, 3),
            'webdev_rating': random.randint(1, 3),
            'cyber_rating': random.randint(1, 2),
            'dm_rating': random.randint(1, 2),
            'seo_rating': random.randint(1, 2),
            'content_rating': random.randint(2, 3),
            'social_rating': random.randint(2, 3),
            'uiux_rating': random.randint(1, 3),
            'graphic_rating': random.randint(1, 2),
            'video_rating': random.randint(1, 2),
            'creativity_rating': random.randint(3, 4),
        })
    elif domain == 'IT / Software':
        base_skills.update({
            'prog_rating': random.randint(4, 5),
            'dsa_rating': random.randint(3, 5),
            'webdev_rating': random.randint(3, 5),
            'sql_rating': random.randint(3, 4),
            'cloud_rating': random.randint(2, 4),
            'ml_rating': random.randint(1, 3),
            'da_rating': random.randint(2, 3),
            'cyber_rating': random.randint(2, 3),
            'dm_rating': random.randint(1, 2),
            'seo_rating': random.randint(1, 2),
            'content_rating': random.randint(1, 2),
            'social_rating': random.randint(2, 3),
            'uiux_rating': random.randint(2, 3),
            'graphic_rating': random.randint(1, 2),
            'video_rating': random.randint(1, 2),
            'creativity_rating': random.randint(2, 3),
        })
    elif domain == 'Design':
        base_skills.update({
            'uiux_rating': random.randint(4, 5),
            'graphic_rating': random.randint(3, 5),
            'video_rating': random.randint(3, 4),
            'creativity_rating': random.randint(4, 5),
            'webdev_rating': random.randint(2, 3),
            'prog_rating': random.randint(1, 2),
            'dsa_rating': random.randint(1, 2),
            'ml_rating': random.randint(1, 2),
            'da_rating': random.randint(2, 3),
            'sql_rating': random.randint(1, 2),
            'cloud_rating': random.randint(1, 2),
            'cyber_rating': random.randint(1, 2),
            'dm_rating': random.randint(3, 4),
            'seo_rating': random.randint(2, 3),
            'content_rating': random.randint(3, 4),
            'social_rating': random.randint(4, 5),
        })
    else:  # Marketing
        base_skills.update({
            'dm_rating': random.randint(4, 5),
            'seo_rating': random.randint(3, 4),
            'content_rating': random.randint(4, 5),
            'social_rating': random.randint(4, 5),
            'creativity_rating': random.randint(3, 4),
            'uiux_rating': random.randint(2, 3),
            'graphic_rating': random.randint(2, 3),
            'video_rating': random.randint(3, 4),
            'webdev_rating': random.randint(2, 3),
            'prog_rating': random.randint(1, 2),
            'dsa_rating': random.randint(1, 2),
            'ml_rating': random.randint(1, 2),
            'da_rating': random.randint(3, 4),
            'sql_rating': random.randint(1, 2),
            'cloud_rating': random.randint(1, 2),
            'cyber_rating': random.randint(1, 2),
        })
    
    # Adjust skills based on year
    year_multiplier = {'1st': 0.6, '2nd': 0.75, '3rd': 0.9, '4th': 1.0}[year]
    
    for skill in base_skills:
        if skill != 'teamwork_rating' and skill != 'adapt_rating':  # These stay consistent
            base_skills[skill] = max(1, min(5, int(base_skills[skill] * year_multiplier)))
    
    return base_skills

def generate_student_data(num_students=500):
    """Generate realistic student dataset"""
    students = []
    
    for i in range(num_students):
        name = f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"
        email = f"{name.lower().replace(' ', '.')}@example.com"
        year = random.choice(YEARS)
        branch = random.choice(BRANCHES)
        domain = random.choice(DOMAINS)
        
        # Generate CGPA based on year (higher years tend to have slightly better CGPA)
        cgpa_base = {'1st': 7.2, '2nd': 7.5, '3rd': 7.8, '4th': 8.0}[year]
        cgpa = round(random.uniform(6.0, 9.5), 2)
        
        # Projects based on year and domain
        if year == '1st':
            projects = random.choice(['0', '0', '1-2'])
        elif year == '2nd':
            projects = random.choice(['0', '1-2', '1-2', '3-5'])
        elif year == '3rd':
            projects = random.choice(['1-2', '3-5', '3-5', '5+'])
        else:  # 4th year
            projects = random.choice(['3-5', '5+', '5+'])
        
        # Internship more likely in 3rd and 4th year
        internship_prob = {'1st': 0.1, '2nd': 0.2, '3rd': 0.4, '4th': 0.6}[year]
        internship = 'YES' if random.random() < internship_prob else 'NO'
        
        # Certifications
        certification_prob = {'1st': 0.3, '2nd': 0.5, '3rd': 0.7, '4th': 0.8}[year]
        certifications = 'YES' if random.random() < certification_prob else 'NO'
        
        # Generate skills
        skills = generate_realistic_skills(domain, year)
        self_rating = random.randint(3, 5)
        
        student = {
            'name': name,
            'email': email,
            'year': year,
            'branch': branch,
            'cgpa': str(cgpa),
            'projects': projects,
            'internship': internship,
            'certifications': certifications,
            'interested_domain': domain,
            'self_rating': self_rating,
            **skills
        }
        
        students.append(student)
    
    return students

def save_dataset(students, filename='student_dataset.json'):
    """Save dataset to JSON file"""
    with open(filename, 'w') as f:
        json.dump(students, f, indent=2)
    print(f"Generated {len(students)} student records and saved to {filename}")

def save_to_excel(students, filename='student_dataset.xlsx'):
    """Save dataset to Excel file"""
    df = pd.DataFrame(students)
    df.to_excel(filename, index=False)
    print(f"Saved dataset to {filename}")

if __name__ == "__main__":
    # Generate 500 realistic student records
    students = generate_student_data(500)
    
    # Save in multiple formats
    save_dataset(students)
    save_to_excel(students)
    
    # Print some statistics
    print("\nDataset Statistics:")
    print(f"Total students: {len(students)}")
    print(f"Year distribution: {dict(pd.Series([s['year'] for s in students]).value_counts())}")
    print(f"Domain distribution: {dict(pd.Series([s['interested_domain'] for s in students]).value_counts())}")
    print(f"Branch distribution: {dict(pd.Series([s['branch'] for s in students]).value_counts())}")
    print(f"Internship rate: {sum(1 for s in students if s['internship'] == 'YES') / len(students) * 100:.1f}%")
    print(f"Certification rate: {sum(1 for s in students if s['certifications'] == 'YES') / len(students) * 100:.1f}%")
