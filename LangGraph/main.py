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
        state_dict = asdict(state)  
        state_dict.pop("llm", None)  

        result = executor.invoke(state_dict)
        print(result["message"])  
    except Exception as e:
        print(f"Error running workflow: {str(e)}")
