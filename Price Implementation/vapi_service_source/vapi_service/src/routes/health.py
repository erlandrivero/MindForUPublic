from flask import Blueprint, jsonify, current_app
from datetime import datetime
import psutil
import os

health_bp = Blueprint('health', __name__, url_prefix='/health')

@health_bp.route('/', methods=['GET'])
def health_check():
    """Health check endpoint for monitoring"""
    
    try:
        # Test database connection
        current_app.db.admin.command('ping')
        db_status = "healthy"
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"
    
    # Get system metrics
    system_metrics = {
        "cpu_percent": psutil.cpu_percent(interval=1),
        "memory_percent": psutil.virtual_memory().percent,
        "disk_percent": psutil.disk_usage('/').percent
    }
    
    # Overall health status
    is_healthy = db_status == "healthy" and system_metrics["memory_percent"] < 90
    
    return jsonify({
        "status": "healthy" if is_healthy else "unhealthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0",
        "database": db_status,
        "system": system_metrics,
        "uptime": get_uptime()
    }), 200 if is_healthy else 503

def get_uptime():
    """Get application uptime"""
    try:
        with open('/proc/uptime', 'r') as f:
            uptime_seconds = float(f.readline().split()[0])
            return f"{uptime_seconds:.2f} seconds"
    except:
        return "unknown"

