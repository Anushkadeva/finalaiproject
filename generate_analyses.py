import requests
import json

# Get all students
response = requests.get('http://127.0.0.1:5000/api/students')
students = response.json()

print(f"Found {len(students)} students")

# Run analysis for each student
for i, student in enumerate(students):
    try:
        # Run traditional analysis
        analysis_response = requests.post(f'http://127.0.0.1:5000/api/analyze/{student["id"]}')
        if analysis_response.status_code == 201:
            print(f"[OK] Analysis {i+1}/{len(students)}: {student['name']}")
        else:
            print(f"[ERROR] Analysis failed for {student['name']}: {analysis_response.status_code}")
    except Exception as e:
        print(f"[ERROR] Error analyzing {student['name']}: {e}")

print("All analyses completed!")

# Now train ML models
print("\nTraining ML models...")
train_response = requests.post('http://127.0.0.1:5000/api/ml/train')
print(f"Training result: {train_response.json()}")

# Check dashboard stats
stats_response = requests.get('http://127.0.0.1:5000/api/dashboard/stats')
stats = stats_response.json()
print(f"\nDashboard Stats:")
print(f"Total students: {stats['total_students']}")
print(f"Total analyses: {stats['total_analyses']}")
print(f"Ready count: {stats['ready_count']}")
print(f"Not ready count: {stats['not_ready_count']}")
print(f"Avg readiness: {stats['avg_readiness']}")
