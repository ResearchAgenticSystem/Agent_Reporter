<<<<<<< HEAD
from flask import Flask, request, jsonify, render_template, send_file
=======
from flask import Flask, request, jsonify, render_template
>>>>>>> 9791ae470f178e839d8efe96fd29d3f1a8866b61
from config import llm
from state import ResearchState
from dataclasses import asdict
from main import create_workflow
import os
<<<<<<< HEAD
import pdfkit
=======
>>>>>>> 9791ae470f178e839d8efe96fd29d3f1a8866b61

app = Flask(__name__)
app.config['JSONIFY_PRETTYPRINT_REGULAR'] = True

<<<<<<< HEAD
=======
# Compile the workflow once and reuse it
>>>>>>> 9791ae470f178e839d8efe96fd29d3f1a8866b61
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
<<<<<<< HEAD

        # Remove non-serializable objects (like LLM)
        state_dict.pop("llm", None)

        # Ensure JSON serializability
        def make_serializable(obj):
            if isinstance(obj, (str, int, float, bool, list, dict)):
                return obj
            return str(obj)  # Convert non-serializable objects to string
        
        state_dict = {key: make_serializable(value) for key, value in state_dict.items()}
=======
        state_dict.pop("llm", None)  # Remove non-serializable field

        # Add any additional preprocessing here
        state_dict = {
            key: str(value) if not isinstance(value, (str, int, float, bool, list, dict)) 
            else value 
            for key, value in state_dict.items()
        }
>>>>>>> 9791ae470f178e839d8efe96fd29d3f1a8866b61

        # Execute the workflow
        result = executor.invoke(state_dict)

<<<<<<< HEAD
        # Debugging log
        app.logger.info(f"Workflow result: {result}")

        # Ensure 'final_report' exists
        final_report = result.get("final_report", "No report generated.")

        return jsonify({
            "topic": topic,
            "report": final_report
=======
        return jsonify({
            "topic": topic,
            "report": result.get("final_report", "No report generated.")
>>>>>>> 9791ae470f178e839d8efe96fd29d3f1a8866b61
        })

    except Exception as e:
        app.logger.error(f"Error generating report: {str(e)}")
        return jsonify({"error": str(e)}), 500

<<<<<<< HEAD

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
=======
# Gunicorn will look for 'app' at the module level
if __name__ == "__main__":
    from waitress import serve
    serve(app, host="0.0.0.0", port=5000)
>>>>>>> 9791ae470f178e839d8efe96fd29d3f1a8866b61
