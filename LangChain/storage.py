import chromadb
import uuid
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Custom directory for storing outputs
BASE_DIR = "./data_storage"  # Change this to your preferred directory
VECTOR_DB_PATH = os.path.join(BASE_DIR, "vector_db")

# Ensure directory exists
os.makedirs(BASE_DIR, exist_ok=True)

# Initialize the vector database with a new path
db = chromadb.PersistentClient(path=VECTOR_DB_PATH)
collection = db.get_or_create_collection("news_research")

def save_to_vector_db(topic, research_summary):
    """Save research summary to the vector database"""
    if not research_summary:
        print(f"⚠️ Not saving empty research for topic: {topic}")
        return

    print(f"📌 Saving research to DB for topic: {topic}")
    print(f"Debug: Document: {research_summary}")
    print(f"Debug: Metadata: { {'topic': topic} }")
    print(f"Debug: ID: {str(uuid.uuid4())}")
    collection.add(
        documents=[research_summary],
        metadatas=[{"topic": topic}],
        ids=[str(uuid.uuid4())]  # Generate a unique ID to avoid duplication errors
    )
    print(f"✅ Research saved successfully!")

def retrieve_from_vector_db(topic):
    """Retrieve research summary from the vector database"""
    print(f"📤 Retrieving research from DB for topic: {topic}")
    results = collection.query(query_texts=[topic], n_results=3)
    print(f"Debug: Query results: {results}")
    
    if not results["documents"] or not any(results["documents"]):
        print("⚠️ No stored research found.")
        return None

    print(f"📤 Retrieved research: {results['documents']}")
    return results["documents"][0]  # Return first result to ensure proper retrieval

def save_output(topic, article, research_summary):
    """Save generated article and research summary to a custom directory"""
    safe_topic = topic.replace(" ", "_")
    article_path = os.path.join(BASE_DIR, f"{safe_topic}.md")
    json_path = os.path.join(BASE_DIR, f"{safe_topic}.json")

    # Save article
    with open(article_path, "w", encoding="utf-8") as f:
        f.write(f"# {topic}\n\n{article}")

    # Save JSON data
    json_data = {
        "topic": topic,
        "research_summary": research_summary,
        "article": article
    }
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(json_data, f, indent=4)

    print(f"📄 Files saved: {article_path}, {json_path}")