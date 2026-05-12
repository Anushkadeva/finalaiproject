from app import app, db, Student, AnalysisResult
with app.app_context():
    print(f'Students: {Student.query.count()}')
    print(f'Analyses: {AnalysisResult.query.count()}')
