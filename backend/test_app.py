from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)

# Allow all origins for development (simpler approach)
CORS(app)

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    print("Health check endpoint hit!")
    return jsonify({"status": "healthy", "message": "Flask server is running"}), 200

@app.route('/prompt', methods=['POST', 'OPTIONS'])
def prompt():
    # Handle preflight OPTIONS request
    if request.method == 'OPTIONS':
        return '', 200
    
    print(f"Received request: {request.method}")
    print(f"Headers: {dict(request.headers)}")
    
    try:
        data = request.get_json()
        user_prompt = data.get('prompt', '').strip() if data else ''
        
        print(f"User prompt: {user_prompt}")
        
        if not user_prompt:
            return jsonify({"error": "Prompt is required"}), 400
        
        # Simple mock response for testing
        mock_response = f"Hello! You asked: '{user_prompt}'. This is a test response from your Flask server. The travel assistant would normally provide helpful travel advice here!"
        
        print("Sending response back to frontend")
        return jsonify({
            "prompt": user_prompt, 
            "response": mock_response,
            "status": "success"
        }), 200
        
    except Exception as e:
        error_msg = f"Error: {str(e)}"
        print(f"Error processing request: {error_msg}")
        return jsonify({
            "error": error_msg,
            "status": "error"
        }), 500

if __name__ == '__main__':
    print("=" * 50)
    print("STARTING FLASK SERVER")
    print("=" * 50)
    print("Server will run on: http://localhost:5000")
    print("Health check: http://localhost:5000/health")
    print("CORS: Allowing all origins")
    print("=" * 50)
    
    # Try different host configurations
    try:
        print("Trying to start server on 127.0.0.1:5000")
        app.run(debug=True, host='127.0.0.1', port=5000)
    except Exception as e:
        print(f"Failed to start on 127.0.0.1:5000: {e}")
        print("Trying localhost:5001...")
        app.run(debug=True, host='localhost', port=5001)