from flask import Flask, render_template, request, send_file, jsonify

import tempfile
import os
from flask_cors import CORS
from main import create_workflow
from state import ResearchState
from dataclasses import asdict
import json


app = Flask(__name__)
CORS(app)
def format_article_content(content):
    # Convert markdown to HTML with extra features enabled
    html_content = markdown2.markdown(content, extras=['fenced-code-blocks', 'break-on-newline'])
    return html_content

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate', methods=['GET'])
def generate_report():
    topic = request.args.get('topic', '').strip()
    
    if not topic:
        return jsonify({
            'success': False,
            'message': '❌ Error: Topic cannot be empty.'
        })

    try:
        # Create and execute workflow
        executor = create_workflow()
        state = ResearchState(topic=topic)
        result = executor.invoke(asdict(state))
        
        # Format the article content
        formatted_article = format_article_content(result.get('article', ''))
        
        # Store the result for PDF generation
        session_file = os.path.join(tempfile.gettempdir(), f"{topic.replace(' ', '_')}_result.json")
        with open(session_file, 'w') as f:
            json.dump({**result, 'formatted_article': formatted_article}, f)
            
        return jsonify({
            'success': True,
            'message': result.get('message', '✅ Report generated successfully!'),
            'topic': topic,
            'article': formatted_article
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'❌ Error generating report: {str(e)}'
        })

@app.route('/generate-beta', methods=['GET'])
def generate_beta():
    topic = request.args.get('topic', '').strip()
    
    if not topic:
        return jsonify({
            'success': False,
            'message': '❌ Error: Topic cannot be empty.'
        })

    try:
        # Create and execute workflow
        executor = create_workflow()
        state = ResearchState(topic=topic)
        result = executor.invoke(asdict(state))
        
        # Extract sources from research summary
        sources = result.get("research_summary", "").split("\n\n")  # Splitting by double newline
        
        return jsonify({
            'success': True,
            'topic': topic,
            'sources': sources,  # List of research sources
            'article': result.get('article', '')
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'❌ Error generating report: {str(e)}'
        })


import time


@app.route('/generate-test', methods=['GET'])
def generate_test():
    topic = request.args.get('topic', '').strip()
    
    if not topic:
        return jsonify({
            'success': False,
            'message': '❌ Error: Topic cannot be empty.'
        })

    try:
        time.sleep(5)  # Add delay of 5 seconds
        return jsonify({
            'success': True,
            'topic': topic,
            'sources': [],  # List of research sources
            'article': ''
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'❌ Error generating report: {str(e)}'
        })



if __name__ == '__main__':
    app.run(debug=True)