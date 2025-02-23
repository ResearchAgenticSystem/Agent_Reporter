from flask import Flask, request, jsonify, render_template, send_file
from config import llm
from state import ResearchState
from dataclasses import asdict
from main import create_workflow
import os
import pdfkit

app = Flask(__name__)
app.config['JSONIFY_PRETTYPRINT_REGULAR'] = True

executor = create_workflow()

@app.route("/")
def home():
    return render_template('index.html')

@app.route("/generate_report", methods=["POST"])
def generate_report():
    try:
        data = request.get_json()
        topic = data.get("topic", "").strip()

        if not topic:
            return jsonify({"error": "Topic is required"}), 400

        # Create ResearchState object
        state = ResearchState(topic=topic, llm=llm)
        state_dict = asdict(state)

        # Remove non-serializable objects (like LLM)
        state_dict.pop("llm", None)

        # Ensure JSON serializability
        def make_serializable(obj):
            if isinstance(obj, (str, int, float, bool, list, dict)):
                return obj
            return str(obj)  # Convert non-serializable objects to string
        
        state_dict = {key: make_serializable(value) for key, value in state_dict.items()}

        # Execute the workflow
        result = executor.invoke(state_dict)

        # Debugging log
        app.logger.info(f"Workflow result: {result}")

        # Ensure 'final_report' exists
        final_report = result.get("final_report", "No report generated.")

        return jsonify({
            "topic": topic,
            "report": final_report
        })

    except Exception as e:
        app.logger.error(f"Error generating report: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route("/download_pdf", methods=["POST"])
def download_pdf():
    try:
        data = request.get_json()
        topic = data.get("topic", "").strip()
        report = data.get("report", "").strip()

        if not topic or not report:
            return jsonify({"error": "Topic and report are required"}), 400

        # Define PDF file path
        pdf_path = os.path.join("data_storage", f"{topic}.pdf")
        os.makedirs("data_storage", exist_ok=True)

        # First replace newlines in the report
        formatted_report = report.replace('\n', '<br>')
        
        # Then use the formatted report in the HTML template
        html_content = f"""
        <html>
        <head><title>{topic} - Report</title></head>
        <body>
            <h1>{topic}</h1>
            <p>{formatted_report}</p>
        </body>
        </html>
        """

        # Generate PDF
        pdfkit.from_string(html_content, pdf_path)
        return send_file(pdf_path, as_attachment=True)

    except Exception as e:
        app.logger.error(f"Error generating PDF: {str(e)}")
        return jsonify({"error": str(e)}), 500


# Gunicorn will look for 'app' at the module level
if __name__ == "__main__":
    app.run(debug = True)