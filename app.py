from flask import Flask, render_template, request, send_file, jsonify
from weasyprint import HTML  # Replace pdfkit with WeasyPrint
import tempfile
import os
from main import create_workflow
from state import ResearchState
from dataclasses import asdict
import json
import markdown2  # For converting markdown to HTML

app = Flask(__name__)

def format_article_content(content):
    # Convert markdown to HTML with extra features enabled
    html_content = markdown2.markdown(content, extras=['fenced-code-blocks', 'break-on-newline'])
    return html_content

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate', methods=['POST'])
def generate_report():
    topic = request.form.get('topic', '').strip()
    
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

@app.route('/download/<topic>')
def download_pdf(topic):
    try:
        # Read the stored result
        session_file = os.path.join(tempfile.gettempdir(), f"{topic.replace(' ', '_')}_result.json")
        with open(session_file, 'r') as f:
            result = json.load(f)
            
        # Create HTML content
        html_content = f"""
<html>
    <head>
        <style>
            body {{
                font-family: Arial, sans-serif;
                margin: 40px;
                line-height: 1.6;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
            }}
            .container {{
                border: 2px solid #2c3e50;
                padding: 20px;
                width: 90%;
                max-width: 800px;
                box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1);
                overflow: hidden;
            }}
            h1 {{ 
                color: #2c3e50;
                font-size: 24px;
                margin-bottom: 20px;
                text-align: center;
            }}
            .content {{
                max-height: 100%;
                overflow: auto;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <h1>{topic}</h1>
            <div class="content">
                {result.get('formatted_article', '')}
            </div>
        </div>
    </body>
</html>
"""

        
        # Create a temporary PDF file
        temp_pdf = tempfile.NamedTemporaryFile(suffix='.pdf', delete=False)
        
        # Generate PDF using WeasyPrint
        HTML(string=html_content).write_pdf(temp_pdf.name)
        
        return send_file(
            temp_pdf.name,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=f"{topic.replace(' ', '_')}_report.pdf"
        )
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'❌ Error generating PDF: {str(e)}'
        })

if __name__ == '__main__':
    app.run(debug=True)