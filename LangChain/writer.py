from langchain.prompts import PromptTemplate
from llm import get_llm

llm = get_llm()

def generate_news_article(research_summary, topic):
    if not research_summary:
        print("⚠️ No research data found. Skipping article generation.")
        return "No research data available."
    print("✍️ Generating News Article...")
    print(f"Debug: Research Summary: {research_summary}")
    
    article_prompt = PromptTemplate(
        input_variables=["research_summary", "topic"],
        template="""
        Write a 5-paragraph scientific news article on "{topic}" based on the research:
        
        {research_summary}
        
        Make sure it is engaging, explains the impact on the industry, and follows a logical structure.
        """
    )
    
    article = llm.invoke(article_prompt.format(research_summary=research_summary, topic=topic))
    print("✅ Article Generated!")
    return article