from flask import Flask, request, jsonify, render_template
from config import llm
from state import ResearchState
from dataclasses import asdict
from main import create_workflow
import os

app = Flask(__name__)
app.config['JSONIFY_PRETTYPRINT_REGULAR'] = True

# Compile the workflow once and reuse it
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
        state_dict.pop("llm", None)  # Remove non-serializable field

        # Add any additional preprocessing here
        state_dict = {
            key: str(value) if not isinstance(value, (str, int, float, bool, list, dict)) 
            else value 
            for key, value in state_dict.items()
        }

        # Execute the workflow
        result = executor.invoke(state_dict)

        return jsonify({
            "topic": topic,
            "report": result.get("final_report", "No report generated.")
        })

    except Exception as e:
        app.logger.error(f"Error generating report: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)

