from langgraph.graph.state import StateGraph
from config import llm
from state import ResearchState
from dataclasses import asdict
from workflow_nodes import (
    get_user_input,
    get_research,
    generate_news_article,
    save_output,
    display_output
)

def create_workflow():
    workflow = StateGraph(state_schema=dict)  # Explicitly set state as dictionary
    
    workflow.add_node("user_input", get_user_input)
    workflow.add_node("research_retrieval", get_research)
    workflow.add_node("article_generation", generate_news_article)
    workflow.add_node("storage", save_output)
    workflow.add_node("output", display_output)
    
    workflow.add_edge("user_input", "research_retrieval")
    workflow.add_edge("research_retrieval", "article_generation")
    workflow.add_edge("article_generation", "storage")
    workflow.add_edge("storage", "output")
    
    workflow.set_entry_point("user_input")
    workflow.set_finish_point("output")
    
    return workflow.compile()

if __name__ == "__main__":
    topic = input("Enter the topic you want to research: ").strip()
    try:
        executor = create_workflow()
        state = ResearchState(topic=topic, llm=llm)
        state_dict = asdict(state)  # Ensure correct conversion to dictionary
        state_dict.pop("llm", None)  # Remove non-serializable field

        
        print(f"DEBUG: state_dict type -> {type(state_dict)}")  # Add this line
        print(f"DEBUG: state_dict content -> {state_dict}")  # Add this line
        state_obj = ResearchState(**state_dict)  # Convert dictionary back to object
        state_dict = asdict(state_obj)

        # Ensure all values in the dictionary are serializable (convert objects to strings if needed)
        state_dict = {key: str(value) if not isinstance(value, (str, int, float, bool, list, dict)) else value for key, value in state_dict.items()}

        result = executor.invoke(state_dict)
        print(result["message"])  # Access the message from the result dictionary
    except Exception as e:
        print(f"Error running workflow: {str(e)}")
