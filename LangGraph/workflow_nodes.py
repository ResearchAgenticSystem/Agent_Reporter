import os
import json
import uuid
from typing import List, Dict
import requests
from langchain.prompts import PromptTemplate
from state import ResearchState
from config import BASE_DIR, collection
from dataclasses import asdict
from config import llm

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
            snippets = []

            if 'organic' in results:
                for result in results['organic'][:3]:  # Get first 3 results
                    if 'snippet' in result:
                        snippets.append(result['snippet'])
            
            return " ".join(snippets) if snippets else ""
        except Exception as e:
            print(f"⚠️ Error in search: {e}")
            return ""

def get_user_input(state: Dict) -> Dict:
    return asdict(ResearchState(**state))  # Ensure conversion

def get_research(state: Dict) -> Dict:
    research_state = ResearchState(**state)  
    topic = research_state.topic
    
    results = collection.query(query_texts=[topic], n_results=3)

    # ✅ Ensure only relevant results are used
    if results["documents"] and any(results["documents"]):
        retrieved_text = results["documents"][0]
        if isinstance(retrieved_text, list):
            retrieved_text = " ".join(retrieved_text)  # Convert list to string
        # ✅ Check if the retrieved text is actually about the topic
        if topic.lower() in retrieved_text.lower():
            research_state.research_summary = retrieved_text
        else:
            research_state.research_summary = f"No relevant research found for {topic}."
    else:
        research_state.research_summary = f"No research data found for {topic}."

    return asdict(research_state)

def generate_news_article(state: Dict) -> Dict:
    research_state = ResearchState(**state)
    
    if not research_state.research_summary:
        research_state.article = "No research data available."
        return asdict(research_state)  

    # ✅ Debugging log to check research summary before article generation
    print(f"DEBUG: Research Summary for {research_state.topic}:\n{research_state.research_summary}")

    article_prompt = PromptTemplate(
        input_variables=["research_summary", "topic"],
        template="""
        Write a 5-paragraph detailed news article about "{topic}" based on the research summary provided. 
        - **Introduction:** Briefly introduce the topic.
        - **Key Insights:** Highlight 3-4 important points from the research.
        - **Industry Impact:** Explain how it affects the industry.
        - **Future Prospects:** Discuss expected developments.
        - **Conclusion:** Summarize the significance of the topic.
        
        Research Summary:
        {research_summary}
        """
    )

    try:
        # Ensure research summary is a string (not a list)
        summary_text = "\n".join(research_state.research_summary) if isinstance(research_state.research_summary, list) else research_state.research_summary

        prompt_text = article_prompt.format(
            research_summary=summary_text, 
            topic=research_state.topic
        )

        # ✅ Generate article
        response = llm.invoke(prompt_text)

        # ✅ Extract text correctly
        if isinstance(response, dict) and "generated_text" in response:
            research_state.article = response["generated_text"]
        else:
            research_state.article = str(response)

        # ✅ If the article is too short, generate more content
        while len(research_state.article.split()) < 400:
            followup_prompt = f"Continue the article about {research_state.topic}, expanding on the key insights: {research_state.article}"
            followup_response = llm.invoke(followup_prompt)

            if isinstance(followup_response, dict) and "generated_text" in followup_response:
                research_state.article += "\n\n" + followup_response["generated_text"]
            else:
                research_state.article += "\n\n" + str(followup_response)

    except Exception as e:
        research_state.article = f"Error generating article: {str(e)}"
    
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
