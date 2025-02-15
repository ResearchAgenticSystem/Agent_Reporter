import os
import chromadb
from dotenv import load_dotenv
from langchain_huggingface import HuggingFaceEndpoint  # Updated import
from langchain_core.language_models import BaseLLM

# Load environment variables
load_dotenv()

# Initialize Vector DB
BASE_DIR = "./data_storage"
VECTOR_DB_PATH = os.path.join(BASE_DIR, "vector_db")
os.makedirs(BASE_DIR, exist_ok=True)
db = chromadb.PersistentClient(path=VECTOR_DB_PATH)
collection = db.get_or_create_collection("news_research")

def get_llm() -> BaseLLM:
    api_token = os.getenv("HUGGINGFACEHUB_API_TOKEN")
    if not api_token:
        raise ValueError("❌ Missing Hugging Face API Token!")
    
    try:
        return HuggingFaceEndpoint(
            repo_id="mistralai/Mistral-7B-Instruct",
            huggingfacehub_api_token=api_token,
            temperature=0.7,
            max_length=4096,  # ✅ Increased from 2048 to 4096
            task="text-generation"
        )
    except Exception as e:
        raise ValueError(f"Error initializing LLM: {str(e)}")


llm = get_llm()
