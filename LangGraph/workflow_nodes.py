import os
import json
import requests
from typing import Dict
from langchain.prompts import PromptTemplate
from state import ResearchState
from config import BASE_DIR, llm
from dataclasses import asdict

class ResearchTool:
    def __init__(self):
        self.api_key = os.getenv("SERPER_API_KEY")
        if not self.api_key:
            raise ValueError("Missing SERPER_API_KEY in environment variables")
        
        self.api_url = "https://google.serper.dev/search"
        self.headers = {
            'X-API-KEY': self.api_key,
            'Content-Type': 'application/json'
        }

    def search(self, query: str) -> str:
        try:
            payload = json.dumps({"q": query})
            response = requests.post(self.api_url, headers=self.headers, data=payload)
            response.raise_for_status()
            
            results = response.json()
            snippets = [result['snippet'] for result in results.get('organic', [])[:3] if 'snippet' in result]
            
            return " ".join(snippets) if snippets else ""
        except Exception as e:
            print(f"⚠️ Error in search: {e}")
            return ""

def get_user_input(state: Dict) -> Dict:
    return asdict(ResearchState(**state))

def get_research(state: Dict) -> Dict:
    research_state = ResearchState(**state)  
    topic = research_state.topic
    
    print(f"🔎 Fetching research from Google Search for: {topic}...")
    search_tool = ResearchTool()
    research_state.research_summary = search_tool.search(topic)
    
    return asdict(research_state)

def generate_news_article(state: Dict) -> Dict:
    research_state = ResearchState(**state)

    if not research_state.research_summary.strip():
        research_state.article = "No research data available."
        return asdict(research_state)  

    print(f"📝 Research found, processing with AI agent...")

    article_prompt = f"""
    Write a well-structured news article on "{research_state.topic}" based on the research summary:
    
    {research_state.research_summary}
    
    Ensure the article follows this structure:

    **Title:** A compelling title.
    
    **Introduction:** Provide background and context.
    
    **Key Insights:** Highlight important aspects.
    
    **Industry Impact:** Explain the significance.
    
    **Future Prospects:** Discuss upcoming developments.
    
    **Conclusion:** Summarize key takeaways.
    
    Generate at least 700 words.
    
    Format the article in markdown.
    """

    response = llm.invoke(article_prompt)
    article_text = response.get("text", "").strip() if isinstance(response, dict) else str(response).strip()

    # If the article is too short, retry with an expansion prompt
    while len(article_text.split()) < 400:
        print("⚠️ Article too short, requesting additional content...")
        followup_prompt = f"Continue writing and expand the following article:\n\n{article_text}"
        followup_response = llm.invoke(followup_prompt)
        additional_text = followup_response.get("text", "").strip() if isinstance(followup_response, dict) else str(followup_response).strip()

        if additional_text not in article_text:
            article_text += "\n\n" + additional_text
        else:
            print("⚠️ No new content generated, stopping expansion.")
            break

    research_state.article = article_text
    return asdict(research_state)




def save_output(state: Dict) -> Dict:
    research_state = ResearchState(**state)
    topic = research_state.topic.replace(" ", "_")
    article = research_state.article
    research_summary = research_state.research_summary

    article_path = os.path.join(BASE_DIR, f"{topic}.md")
    json_path = os.path.join(BASE_DIR, f"{topic}.json")

    os.makedirs(BASE_DIR, exist_ok=True)

    try:
        with open(article_path, "w", encoding="utf-8") as f:
            f.write(f"# {topic}\n\n{article}")

        json_data = {
            "topic": topic,
            "research_summary": research_summary,
            "article": article
        }
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(json_data, f, indent=4)

        research_state.output_saved = True
        research_state.message = "✅ Research and article saved successfully!"
    except Exception as e:
        research_state.output_saved = False
        research_state.message = f"Error saving output: {str(e)}"
    
    return asdict(research_state)

def display_output(state: Dict) -> Dict:
    research_state = ResearchState(**state)
    if not research_state.message:
        research_state.message = "✅ Process completed!"
    return asdict(research_state)
