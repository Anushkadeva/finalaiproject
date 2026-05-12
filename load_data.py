
import json
from app import app, db, Student

def load_data():
    try:
        with open('student_dataset.json', 'r') as f:
            data = json.load(f)
        
        with app.app_context():
            # Clear existing data if needed
            # Student.query.delete()
            
            count = 0
            for item in data:
                # Check if student exists
                if not Student.query.filter_by(email=item['email']).first():
                    student = Student(**item)
                    db.session.add(student)
                    count += 1
            
            db.session.commit()
            print(f"Successfully loaded {count} students.")
            
    except Exception as e:
        print(f"Error loading data: {e}")

if __name__ == "__main__":
    load_data()
