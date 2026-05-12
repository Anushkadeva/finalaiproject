import requests
import json

# Clear existing students (delete all)
response = requests.get('http://127.0.0.1:5000/api/students')
students = response.json()

for student in students:
    delete_response = requests.delete(f'http://127.0.0.1:5000/api/students/{student["id"]}')
    print(f"Deleted student {student['id']}: {delete_response.status_code}")

# Load fixed dataset
with open('student_dataset_fixed.json', 'r') as f:
    fixed_students = json.load(f)

# Load the fixed data
load_response = requests.post('http://127.0.0.1:5000/api/data/load')
print(f"Load response: {load_response.json()}")

# Train ML models
train_response = requests.post('http://127.0.0.1:5000/api/ml/train')
print(f"Training response: {train_response.json()}")
