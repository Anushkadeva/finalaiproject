import sys
import os
import json
from datetime import datetime

# Add root to path
sys.path.append(os.getcwd())

from app import app, db, Student, AnalysisResult, run_analysis

def populate_analyses():
    with app.app_context():
        students = Student.query.all()
        print(f"Found {len(students)} students.")
        
        count = 0
        for student in students:
            # Check if already analyzed
            existing = AnalysisResult.query.filter_by(student_id=student.id).first()
            if not existing:
                student_data = student.to_dict()
                result = run_analysis(student_data)
                
                analysis = AnalysisResult(
                    student_id=student.id,
                    best_domain=result['best_domain'],
                    readiness=result['readiness'],
                    readiness_pct=result['readiness_pct'],
                    domain_scores=json.dumps(result['domain_scores']),
                    strengths=json.dumps(result['strengths']),
                    gaps=json.dumps(result['gaps']),
                    advice=json.dumps(result['advice'])
                )
                db.session.add(analysis)
                count += 1
                
                if count % 50 == 0:
                    db.session.commit()
                    print(f"Processed {count} students...")
        
        db.session.commit()
        print(f"Finished! Added {count} new analysis results.")

if __name__ == "__main__":
    populate_analyses()
