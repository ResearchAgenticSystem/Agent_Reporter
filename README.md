# Multi-Agent Model

This project is a multi-agent system built using [LangGraph](https://github.com/langchain-ai/langgraph). It consists of three agents:

- **Researcher Agent**: Gathers information and insights.
- **Reporter Agent**: Summarizes and structures the collected information.
- **Storage Agent**: Saves the processed data for future use.

## Features

- Modular architecture with configurable agents.
- Workflow-based execution using LangGraph.
- Persistent state management.
- Configurable settings via a config file.

## Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/yourusername/multi-agent-model.git
   cd multi-agent-model
   ```

2. Create a virtual environment (optional but recommended):
   ```sh
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```

3. Install dependencies:
   ```sh
   pip install -r requirements.txt
   ```

## Usage

1. Configure the system using `config.yaml`.
2. Run the main script:
   ```sh
   python main.py
   ```

## Project Structure
```
.
├── config.yaml        # Configuration file for agents and workflows
├── main.py            # Entry point to execute the multi-agent system
├── workflow.py        # Defines the agent workflow and interactions
├── state.py           # Manages persistent state
├── agents/            # Directory containing agent implementations
│   ├── researcher.py
│   ├── reporter.py
│   ├── storage.py
│   └── __init__.py
├── requirements.txt   # Dependencies list
└── README.md          # Project documentation
```

## Configuration
Modify `config.yaml` to adjust agent parameters and workflow settings. Example:
```yaml
agents:
  researcher:
    model: "gpt-4"
  reporter:
    format: "markdown"
  storage:
    database: "data/storage.db"
```

## License
This project is licensed under the MIT License.

## Contributions
Feel free to open issues or submit pull requests to enhance the project!
