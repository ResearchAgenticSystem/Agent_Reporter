from flask import Flask, render_template, request, send_file, jsonify
from weasyprint import HTML  # Replace pdfkit with WeasyPrint
import tempfile
import os
from flask_cors import CORS
from main import create_workflow
from state import ResearchState
from dataclasses import asdict
import json
import markdown2  # For converting markdown to HTML

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
        return jsonify(
            {
                "article": "</think>\n\n**Title: The Legacy of Sheldon Lee Cooper: A Look at the Impact of 'The Big Bang Theory' on Popular Culture**\n\n**Introduction**\n\nIn the realm of television history, few characters have captured the hearts and minds of audiences as profoundly as Sheldon Lee Cooper, Ph.D., Sc.D., from the CBS series *The Big Bang Theory*. Airing from 2007 to 2019, the show not only entertained millions but also sparked a cultural phenomenon that continues to resonate today. Sheldon, with his quirky personality and brilliant mind, became an icon, embodying the complexities of genius and the challenges of social interaction. This article delves into the legacy of Sheldon Cooper, exploring his impact on popular culture, the scientific community, and the broader societal perception of scientists.\n\n**Key Insights**\n\nSheldon Cooper, portrayed by Jim Parsons, was a fictional character whose brilliance in theoretical particle physics was matched only by his social awkwardness. As a former senior theoretical particle physicist at the California Institute of Technology (Caltech), Sheldon's expertise in string theory and its alter ego M-theory made him a fascinating character. The show often highlighted his intellectual prowess, juxtaposed with his everyday struggles, creating a unique blend of comedy and insight into the world of academia.\n\nOne of the most significant aspects of Sheldon's character was his ability to make complex scientific concepts accessible to a mainstream audience. The show frequently referenced real-world scientific theories and phenomena, sparking interest in physics and encouraging viewers to explore the subject further. This was particularly impactful in an era where science communication was increasingly important, and *The Big Bang Theory* played a role in bridging the gap between the scientific community and the general public.\n\n**Industry Impact**\n\nThe success of *The Big Bang Theory* had a profound impact on the entertainment industry and beyond. The show became a cultural touchstone, influencing how scientists are portrayed in media and inspiring a new wave of interest in STEM (Science, Technology, Engineering, and Mathematics) fields. Sheldon Cooper, with his meticulous attention to detail and unwavering dedication to his work, became a symbol of the dedication required in scientific research.\n\nMoreover, the show's portrayal of the lives of physicists, while exaggerated for comedic effect, provided a glimpse into the world of academia and research. It highlighted the importance of collaboration, the challenges of funding and recognition, and the often solitary nature of scientific work. This humanized the scientific process, making it relatable to a broader audience and challenging stereotypes about scientists being aloof or unapproachable",
                "sources": [
                    "Google: Sheldon Lee Cooper, Ph.D., Sc.D., is a fictional character...",
                    "Wikipedia: No Wikipedia page found for 'sheldon cooper'. Try refining your search.",
                    "Arxiv: <?xml version=\"1.0\" encoding=\"UTF-8\"?>..."
                ],
                "success": True,
                "topic": "sheldon cooper"
            }
        )
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'❌ Error generating report: {str(e)}'
        })


if __name__ == '__main__':
    app.run(debug=True)