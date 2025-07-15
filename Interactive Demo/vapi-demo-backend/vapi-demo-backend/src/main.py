from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import os
import logging
from datetime import datetime
import json
import uuid
import time
import random

# Initialize Flask app
app = Flask(__name__, static_folder='static', static_url_path='')

# Enable CORS for all routes
CORS(app, origins="*")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'demo-secret-key')
app.config['VAPI_PRIVATE_KEY'] = os.getenv('VAPI_PRIVATE_KEY', 'demo-vapi-key')
app.config['VAPI_PUBLIC_KEY'] = os.getenv('VAPI_PUBLIC_KEY', 'demo-public-key')

# In-memory storage for demo sessions (in production, use a database)
demo_sessions = {}
conversation_logs = {}
demo_metrics = {}

# Demo scenarios configuration
DEMO_SCENARIOS = {
    'customer-service': {
        'id': 'customer-service',
        'title': 'Customer Service Assistant',
        'description': 'Experience intelligent customer support with natural conversation flow',
        'features': ['Natural Language Understanding', 'Context Retention', 'Multi-turn Conversations'],
        'estimated_time': '3-5 minutes',
        'vapi_assistant_id': 'asst_customer_service_demo',
        'conversation_examples': [
            {'speaker': 'AI', 'message': 'Hello! I\'m here to help you with any questions about your account. How can I assist you today?'},
            {'speaker': 'User', 'message': 'I need to check my recent order status'},
            {'speaker': 'AI', 'message': 'I\'d be happy to help you check your order status. Could you please provide your order number or the email address associated with your account?'},
            {'speaker': 'User', 'message': 'My email is john@example.com'},
            {'speaker': 'AI', 'message': 'Thank you! I found your account. I can see you have an order placed on July 8th for $149.99. Your order is currently being prepared for shipment and should be dispatched within the next 24 hours. You\'ll receive a tracking number via email once it ships.'}
        ]
    },
    'sales-qualification': {
        'id': 'sales-qualification',
        'title': 'Sales Lead Qualification',
        'description': 'See how AI can qualify leads and schedule appointments automatically',
        'features': ['Lead Scoring', 'Appointment Scheduling', 'CRM Integration'],
        'estimated_time': '4-6 minutes',
        'vapi_assistant_id': 'asst_sales_qualification_demo',
        'conversation_examples': [
            {'speaker': 'AI', 'message': 'Hi there! I understand you\'re interested in learning more about our voice AI solutions. I\'d love to help you explore how this could benefit your business. What\'s your name?'},
            {'speaker': 'User', 'message': 'I\'m Sarah from TechCorp'},
            {'speaker': 'AI', 'message': 'Nice to meet you, Sarah! What brings TechCorp to explore voice AI solutions today? Are you looking to improve customer service, automate processes, or something else?'},
            {'speaker': 'User', 'message': 'We want to automate our customer support'},
            {'speaker': 'AI', 'message': 'That\'s a great use case! Many companies see 40-60% reduction in support costs with voice AI. How many support calls does TechCorp typically handle per month?'}
        ]
    },
    'ecommerce-support': {
        'id': 'ecommerce-support',
        'title': 'E-commerce Order Assistant',
        'description': 'Handle order inquiries, returns, and product recommendations',
        'features': ['Order Tracking', 'Return Processing', 'Product Recommendations'],
        'estimated_time': '3-4 minutes',
        'vapi_assistant_id': 'asst_ecommerce_demo',
        'conversation_examples': [
            {'speaker': 'AI', 'message': 'Welcome to our store! I can help you with order tracking, returns, or finding the perfect product. What can I assist you with today?'},
            {'speaker': 'User', 'message': 'I want to return an item I bought last week'},
            {'speaker': 'AI', 'message': 'I\'ll be happy to help you with your return. Could you please provide your order number or the email address you used for the purchase?'},
            {'speaker': 'User', 'message': 'Order number is ORD-12345'},
            {'speaker': 'AI', 'message': 'Perfect! I found your order for the wireless headphones purchased on July 4th. I can see it\'s within our 30-day return window. What\'s the reason for the return? This helps us improve our products.'}
        ]
    },
    'appointment-booking': {
        'id': 'appointment-booking',
        'title': 'Appointment Scheduling',
        'description': 'Automate appointment booking with calendar integration',
        'features': ['Calendar Integration', 'Availability Checking', 'Confirmation Emails'],
        'estimated_time': '2-3 minutes',
        'vapi_assistant_id': 'asst_appointment_demo',
        'conversation_examples': [
            {'speaker': 'AI', 'message': 'Hello! I can help you schedule an appointment with our team. What type of service are you looking for?'},
            {'speaker': 'User', 'message': 'I need a consultation for my business'},
            {'speaker': 'AI', 'message': 'Great! I have availability for business consultations. Are you looking for this week or next week?'},
            {'speaker': 'User', 'message': 'This week would be perfect'},
            {'speaker': 'AI', 'message': 'Excellent! I have openings on Thursday at 2 PM or Friday at 10 AM. Which works better for you?'}
        ]
    }
}

@app.route('/')
def index():
    """Serve the main application"""
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/api/health')
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'version': '1.0.0'
    })

@app.route('/api/scenarios')
def get_scenarios():
    """Get available demo scenarios"""
    scenarios = []
    for scenario_id, scenario_data in DEMO_SCENARIOS.items():
        scenarios.append({
            'id': scenario_data['id'],
            'title': scenario_data['title'],
            'description': scenario_data['description'],
            'features': scenario_data['features'],
            'estimated_time': scenario_data['estimated_time']
        })
    return jsonify({'scenarios': scenarios})

@app.route('/api/demo/start', methods=['POST'])
def start_demo():
    """Start a new demo session"""
    try:
        data = request.get_json()
        scenario_id = data.get('scenario_id')
        user_info = data.get('user_info', {})
        
        if scenario_id not in DEMO_SCENARIOS:
            return jsonify({'error': 'Invalid scenario ID'}), 400
        
        # Generate session ID
        session_id = str(uuid.uuid4())
        
        # Initialize demo session
        demo_sessions[session_id] = {
            'session_id': session_id,
            'scenario_id': scenario_id,
            'user_info': user_info,
            'status': 'initialized',
            'created_at': datetime.utcnow().isoformat(),
            'call_active': False,
            'call_duration': 0,
            'progress': 0
        }
        
        # Initialize conversation log
        conversation_logs[session_id] = []
        
        # Initialize metrics
        demo_metrics[session_id] = {
            'accuracy': round(random.uniform(96.0, 99.5), 1),
            'response_time': round(random.uniform(0.2, 0.5), 1),
            'intent_recognition': round(random.uniform(92.0, 98.0), 1),
            'user_satisfaction': round(random.uniform(4.5, 5.0), 1)
        }
        
        logger.info(f"Started demo session {session_id} for scenario {scenario_id}")
        
        return jsonify({
            'session_id': session_id,
            'scenario': DEMO_SCENARIOS[scenario_id],
            'status': 'success'
        })
        
    except Exception as e:
        logger.error(f"Error starting demo: {str(e)}")
        return jsonify({'error': 'Failed to start demo'}), 500

@app.route('/api/demo/<session_id>/call/start', methods=['POST'])
def start_call(session_id):
    """Start a voice call for the demo session"""
    try:
        if session_id not in demo_sessions:
            return jsonify({'error': 'Session not found'}), 404
        
        session = demo_sessions[session_id]
        scenario = DEMO_SCENARIOS[session['scenario_id']]
        
        # Update session status
        session['call_active'] = True
        session['call_start_time'] = time.time()
        session['status'] = 'call_active'
        
        # Add initial AI message to conversation
        if scenario['conversation_examples']:
            conversation_logs[session_id].append(scenario['conversation_examples'][0])
        
        logger.info(f"Started call for session {session_id}")
        
        return jsonify({
            'status': 'call_started',
            'vapi_call_id': f"call_{session_id}",
            'assistant_id': scenario['vapi_assistant_id']
        })
        
    except Exception as e:
        logger.error(f"Error starting call: {str(e)}")
        return jsonify({'error': 'Failed to start call'}), 500

@app.route('/api/demo/<session_id>/call/end', methods=['POST'])
def end_call(session_id):
    """End the voice call for the demo session"""
    try:
        if session_id not in demo_sessions:
            return jsonify({'error': 'Session not found'}), 404
        
        session = demo_sessions[session_id]
        
        # Update session status
        session['call_active'] = False
        session['status'] = 'completed'
        session['progress'] = 100
        
        if 'call_start_time' in session:
            session['call_duration'] = int(time.time() - session['call_start_time'])
        
        logger.info(f"Ended call for session {session_id}")
        
        return jsonify({
            'status': 'call_ended',
            'duration': session.get('call_duration', 0)
        })
        
    except Exception as e:
        logger.error(f"Error ending call: {str(e)}")
        return jsonify({'error': 'Failed to end call'}), 500

@app.route('/api/demo/<session_id>/conversation/continue', methods=['POST'])
def continue_conversation(session_id):
    """Continue the conversation with the next example message"""
    try:
        if session_id not in demo_sessions:
            return jsonify({'error': 'Session not found'}), 404
        
        session = demo_sessions[session_id]
        scenario = DEMO_SCENARIOS[session['scenario_id']]
        current_log = conversation_logs[session_id]
        
        # Get next message from conversation examples
        examples = scenario['conversation_examples']
        current_index = len(current_log)
        
        if current_index < len(examples):
            next_message = examples[current_index]
            conversation_logs[session_id].append(next_message)
            
            # Update progress
            progress = min(100, (current_index + 1) / len(examples) * 100)
            session['progress'] = progress
            
            return jsonify({
                'message': next_message,
                'progress': progress,
                'has_more': current_index + 1 < len(examples)
            })
        else:
            return jsonify({
                'message': None,
                'progress': 100,
                'has_more': False
            })
        
    except Exception as e:
        logger.error(f"Error continuing conversation: {str(e)}")
        return jsonify({'error': 'Failed to continue conversation'}), 500

@app.route('/api/demo/<session_id>/status')
def get_demo_status(session_id):
    """Get current demo session status"""
    try:
        if session_id not in demo_sessions:
            return jsonify({'error': 'Session not found'}), 404
        
        session = demo_sessions[session_id]
        conversation = conversation_logs.get(session_id, [])
        metrics = demo_metrics.get(session_id, {})
        
        # Update call duration if call is active
        if session['call_active'] and 'call_start_time' in session:
            session['call_duration'] = int(time.time() - session['call_start_time'])
        
        return jsonify({
            'session': session,
            'conversation': conversation,
            'metrics': metrics
        })
        
    except Exception as e:
        logger.error(f"Error getting demo status: {str(e)}")
        return jsonify({'error': 'Failed to get demo status'}), 500

@app.route('/api/demo/<session_id>/metrics')
def get_demo_metrics(session_id):
    """Get real-time metrics for the demo session"""
    try:
        if session_id not in demo_sessions:
            return jsonify({'error': 'Session not found'}), 404
        
        # Simulate slight variations in metrics to show "live" updates
        base_metrics = demo_metrics.get(session_id, {})
        live_metrics = {}
        
        for key, value in base_metrics.items():
            if key in ['accuracy', 'intent_recognition']:
                # Slight variation for percentage metrics
                variation = random.uniform(-0.5, 0.5)
                live_metrics[key] = round(max(0, min(100, value + variation)), 1)
            elif key == 'response_time':
                # Slight variation for response time
                variation = random.uniform(-0.05, 0.05)
                live_metrics[key] = round(max(0.1, value + variation), 1)
            elif key == 'user_satisfaction':
                # Slight variation for satisfaction score
                variation = random.uniform(-0.1, 0.1)
                live_metrics[key] = round(max(1.0, min(5.0, value + variation)), 1)
            else:
                live_metrics[key] = value
        
        return jsonify({'metrics': live_metrics})
        
    except Exception as e:
        logger.error(f"Error getting metrics: {str(e)}")
        return jsonify({'error': 'Failed to get metrics'}), 500

@app.route('/api/webhook/vapi', methods=['POST'])
def vapi_webhook():
    """Handle Vapi webhooks for real-time events"""
    try:
        data = request.get_json()
        event_type = data.get('type')
        call_id = data.get('call', {}).get('id')
        
        logger.info(f"Received Vapi webhook: {event_type} for call {call_id}")
        
        # Process different webhook events
        if event_type == 'call-started':
            # Handle call start
            pass
        elif event_type == 'call-ended':
            # Handle call end
            pass
        elif event_type == 'transcript':
            # Handle transcript updates
            transcript = data.get('transcript', {})
            # Update conversation logs with real transcript data
            pass
        elif event_type == 'function-call':
            # Handle function calls from the assistant
            function_call = data.get('functionCall', {})
            # Process function calls and return responses
            pass
        
        return jsonify({'status': 'received'})
        
    except Exception as e:
        logger.error(f"Error processing webhook: {str(e)}")
        return jsonify({'error': 'Webhook processing failed'}), 500

@app.route('/api/lead/capture', methods=['POST'])
def capture_lead():
    """Capture lead information from demo session"""
    try:
        data = request.get_json()
        session_id = data.get('session_id')
        contact_info = data.get('contact_info', {})
        
        if session_id and session_id in demo_sessions:
            session = demo_sessions[session_id]
            
            # Create lead record
            lead_data = {
                'lead_id': str(uuid.uuid4()),
                'session_id': session_id,
                'scenario_id': session['scenario_id'],
                'user_info': session['user_info'],
                'contact_info': contact_info,
                'demo_completed': session['progress'] >= 100,
                'call_duration': session.get('call_duration', 0),
                'created_at': datetime.utcnow().isoformat()
            }
            
            # In production, save to database
            logger.info(f"Captured lead: {lead_data['lead_id']}")
            
            return jsonify({
                'status': 'success',
                'lead_id': lead_data['lead_id']
            })
        else:
            return jsonify({'error': 'Invalid session'}), 400
        
    except Exception as e:
        logger.error(f"Error capturing lead: {str(e)}")
        return jsonify({'error': 'Failed to capture lead'}), 500

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    logger.error(f"Internal server error: {str(error)}")
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    # Development server
    app.run(
        host='0.0.0.0',
        port=int(os.getenv('PORT', 5000)),
        debug=os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
    )

