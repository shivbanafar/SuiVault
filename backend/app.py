from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os

app = Flask(__name__)
CORS(app)

# Configure Gemini API
# You'll need to set your API key as an environment variable or replace with your actual key
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', 'your-gemini-api-key-here')
genai.configure(api_key=GEMINI_API_KEY)

# Initialize the model
model = genai.GenerativeModel('gemini-1.5-flash-latest')

def get_sealvault_response(user_prompt):
    """Get response from Gemini with enterprise document management context"""
    system_prompt = """You are SealVault's enterprise assistant, focused on providing clear, concise guidance for document management and security. Keep responses direct and actionable.

    Platform Overview:
    SealVault is a decentralized enterprise document management platform built on Sui blockchain that enables:
    - Secure storage of sensitive documents (contracts, HR records, compliance docs)
    - Blockchain-based access control and audit trails
    - End-to-end encryption for all documents
    - Smart contract-based permissions management

    Core Focus:
    - Enterprise document security and management
    - Blockchain-based access control and audit trails
    - Compliance and governance
    - Practical implementation guidance

    Response Guidelines:
    - Keep responses concise and to the point
    - Use bullet points for multiple items
    - Focus on actionable information
    - Avoid unnecessary explanations
    - Maintain professional but conversational tone
    - Break down complex topics into simple steps
    - Use clear headings for different topics
    - Include specific examples when relevant

    Key Topics (respond directly to user queries about):
    - Document security and encryption
    - Access control and permissions
    - Audit trails and compliance
    - Document management workflows
    - Integration and deployment
    - Best practices and troubleshooting

    Remember:
    - Prioritize clarity over comprehensiveness
    - Focus on practical, implementable solutions
    - Use enterprise-appropriate language
    - Reference specific features when relevant
    - Keep technical explanations simple"""
    
    full_prompt = f"{system_prompt}\n\nUser question: {user_prompt}"
    
    try:
        response = model.generate_content(full_prompt)
        return response.text
    except Exception as e:
        print(f"Gemini API error: {e}")
        return "I'm having trouble connecting to the SealVault knowledge base right now. Please try again in a moment!"

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
        
        # Get response from Gemini
        ai_response = get_sealvault_response(user_prompt)
        
        print("Sending Gemini response back to frontend")
        return jsonify({
            "prompt": user_prompt, 
            "response": ai_response,
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
    print("STARTING FLASK SERVER WITH GEMINI")
    print("=" * 50)
    print("Server will run on: http://localhost:5000")
    print("Health check: http://localhost:5000/health")
    print("CORS: Allowing all origins")
    print(f"Gemini API Key configured: {'Yes' if GEMINI_API_KEY != 'your-gemini-api-key-here' else 'No - Please set GEMINI_API_KEY'}")
    print("=" * 50)
    
    app.run(debug=True, host='127.0.0.1', port=5000)