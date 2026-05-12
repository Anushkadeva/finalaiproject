import json
import random

# Read existing dataset
with open('student_dataset.json', 'r') as f:
    students = json.load(f)

# Upgrade some students to be "Ready"
for i, student in enumerate(students[:100]):  # Upgrade first 100 students
    # Increase core skills
    student['comm_rating'] = random.randint(3, 5)
    student['aptitude_rating'] = random.randint(3, 5)
    student['ps_rating'] = random.randint(4, 5)
    student['teamwork_rating'] = random.randint(4, 5)
    student['adapt_rating'] = random.randint(3, 5)
    
    # Increase technical skills based on domain
    if student['interested_domain'] == 'Data & AI':
        student['prog_rating'] = random.randint(4, 5)
        student['dsa_rating'] = random.randint(3, 5)
        student['ml_rating'] = random.randint(4, 5)
        student['da_rating'] = random.randint(4, 5)
        student['sql_rating'] = random.randint(3, 5)
    elif student['interested_domain'] == 'IT / Software':
        student['prog_rating'] = random.randint(4, 5)
        student['dsa_rating'] = random.randint(4, 5)
        student['webdev_rating'] = random.randint(4, 5)
        student['sql_rating'] = random.randint(3, 5)
        student['cloud_rating'] = random.randint(3, 5)
    
    # Increase projects and internships
    student['projects'] = random.choice(['3-5', '5+', '5+'])
    student['internship'] = 'YES'
    student['certifications'] = 'YES'

# Save updated dataset
with open('student_dataset_fixed.json', 'w') as f:
    json.dump(students, f, indent=2)

print(f"Updated {len(students)} students with higher skill levels")
print("Saved to student_dataset_fixed.json")
