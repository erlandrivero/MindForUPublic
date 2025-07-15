from flask import Flask, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import os
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

def create_app(testing=False):
    """Application factory pattern"""
    app = Flask(__name__)
    
    # Configuration
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')
    app.config['MONGODB_URI'] = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/vapi_service')
    app.config['MONGODB_DB_NAME'] = os.getenv('MONGODB_DB_NAME', 'vapi_service')
    app.config['TESTING'] = testing
    
    # Enable CORS for all routes
    CORS(app, origins="*")
    
    # Configure logging
    if not testing:
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s %(levelname)s %(name)s: %(message)s'
        )
    
    # Initialize MongoDB connection
    try:
        mongo_client = MongoClient(app.config['MONGODB_URI'])
        db = mongo_client[app.config['MONGODB_DB_NAME']]
        app.db = db
        
        # Test connection
        db.admin.command('ping')
        app.logger.info("MongoDB connection successful")
        
    except Exception as e:
        app.logger.error(f"MongoDB connection failed: {str(e)}")
        if not testing:
            raise
    
    # Register blueprints
    from src.routes.customers import customer_bp
    from src.routes.demos import demo_bp
    from src.routes.webhooks import webhook_bp
    from src.routes.health import health_bp
    
    app.register_blueprint(customer_bp)
    app.register_blueprint(demo_bp)
    app.register_blueprint(webhook_bp)
    app.register_blueprint(health_bp)
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"error": "Endpoint not found"}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        app.logger.error(f"Internal server error: {str(error)}")
        return jsonify({"error": "Internal server error"}), 500
    
    # Root endpoint
    @app.route('/')
    def index():
        return jsonify({
            "message": "Vapi Service API",
            "version": "1.0.0",
            "status": "running"
        })
    
    return app

# Create app instance
app = create_app()

if __name__ == '__main__':
    # Development server
    app.run(
        host='0.0.0.0',
        port=int(os.getenv('PORT', 5000)),
        debug=os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    )

