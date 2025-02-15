from langchain.tools import Tool
from crewai_tools import SerperDevTool
from langchain.agents import initialize_agent, AgentType
from langchain.prompts import PromptTemplate
from storage import save_to_vector_db, retrieve_from_vector_db
from llm import get_llm

# Initialize LLM
llm = get_llm()

# Research Agent
search_tool = Tool(
    name="Serper Search",
    func=lambda query: SerperDevTool().run(query),  # Wrap the tool in a lambda
    description="Performs a Google search and retrieves relevant web results."
)

research_agent = initialize_agent(
    tools=[search_tool],
    llm=llm,
    agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
    verbose=True,
    handle_parsing_errors=True  # Handle parsing errors
)

def get_research(topic):
    print(f"📤 Retrieving research from DB for topic: {topic}")
    past_research = retrieve_from_vector_db(topic)
    if not past_research:
        print("⚠️ No research data found. Performing fresh search.")
    
    if past_research:
        return past_research

    queries = [
        f"What are the latest breakthroughs in {topic}?",
        f"What are the pros and cons of {topic}?",
        f"How is {topic} affecting the tech industry?"
    ]

    research_results = []
    for query in queries:
        print(f"🔍 Querying: {query}")
        try:
            result = research_agent.invoke({"input": query})
            print(f"✅ Search result: {result}")
            if isinstance(result, dict) and "output" in result:
                research_results.append(result["output"])
            else:
                print(f"⚠️ Unexpected result format: {result}")
        except Exception as e:
            print(f"⚠️ Error retrieving search results: {e}")

    if not research_results:
        print("⚠️ No research results found. Returning default summary.")
        return f"No research data found for {topic}."

    summary_prompt = PromptTemplate(
        input_variables=["research_results"],
        template="Summarize the following research data in a concise and informative manner:\n{research_results}"
    )
    # Join the research results into a single string
    summary = llm.invoke(summary_prompt.format(research_results="\n".join(research_results)))
    print(f"📌 Saving research to DB for topic: {topic}: {summary}")
    save_to_vector_db(topic, summary)
    return summary