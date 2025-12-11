#!/usr/bin/env python3
"""
Mock ATS Server for Testing
Simulates external ATS system
"""
from flask import Flask, request, jsonify
import json

app = Flask(__name__)

# Mock interview data storage
MOCK_INTERVIEWS = {
    "ATS-12345": {
        "candidateName": "Mehmet Demir",
        "candidateEmail": "mehmet.demir@example.com",
        "jobPosition": "Backend Developer",
        "companyName": "StartupCo",
        "companyInfo": "Hızlı büyüyen bir fintech startup",
        "jobDescription": "Python, Django, PostgreSQL ile backend geliştirme. 3+ yıl deneyim.",
        "candidateResume": json.dumps({
            "name": "Mehmet",
            "surname": "Demir",
            "email": "mehmet.demir@example.com",
            "skills": ["Python", "Django", "PostgreSQL", "Docker", "REST API"],
            "experience_summary": "5 yıl backend development deneyimi"
        }),
        "avatarId": "male"
    }
}

# Received reports storage
RECEIVED_REPORTS = []


@app.route('/api/interview/<session_id>', methods=['GET'])
def get_interview_data(session_id):
    """Mock endpoint: Return interview data"""
    auth_header = request.headers.get('Authorization')
    
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'error': 'Unauthorized'}), 401
    
    if session_id not in MOCK_INTERVIEWS:
        return jsonify({'error': 'Session not found'}), 404
    
    print(f"✅ ATS: Interview data requested for {session_id}")
    return jsonify(MOCK_INTERVIEWS[session_id])


@app.route('/webhook/report', methods=['POST'])
def receive_report():
    """Mock webhook: Receive interview report"""
    auth_header = request.headers.get('Authorization')
    
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'error': 'Unauthorized'}), 401
    
    data = request.json
    session_id = data.get('session_id')
    report = data.get('report')
    
    RECEIVED_REPORTS.append({
        'session_id': session_id,
        'report': report,
        'received_at': data.get('completed_at')
    })
    
    print(f"\n{'='*60}")
    print(f"✅ ATS: Interview report received!")
    print(f"Session: {session_id}")
    print(f"Candidate: {report.get('candidateName')}")
    print(f"Score: {report.get('overallScore')}/100")
    print(f"Recommendation: {report.get('hiringRecommendation')}")
    print(f"{'='*60}\n")
    
    return jsonify({
        'status': 'success',
        'message': 'Report received successfully'
    })


@app.route('/webhook/report/fail', methods=['POST'])
def receive_report_fail():
    """Mock webhook that fails (for testing retry mechanism)"""
    print(f"❌ ATS: Simulated failure (testing retry)")
    return jsonify({'error': 'Server error'}), 500


@app.route('/reports', methods=['GET'])
def list_reports():
    """List all received reports"""
    return jsonify({
        'count': len(RECEIVED_REPORTS),
        'reports': RECEIVED_REPORTS
    })


if __name__ == '__main__':
    print("\n" + "="*60)
    print("🏢 Mock ATS Server Starting...")
    print("="*60)
    print("📡 Endpoints:")
    print("   GET  /api/interview/<id>  - Get interview data")
    print("   POST /webhook/report      - Receive report (success)")
    print("   POST /webhook/report/fail - Receive report (fail test)")
    print("   GET  /reports             - List received reports")
    print("="*60 + "\n")
    
    app.run(host='0.0.0.0', port=9000, debug=True)

