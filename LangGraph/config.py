import os
from dotenv import load_dotenv
from langchain_huggingface import HuggingFaceEndpoint  
from langchain_core.language_models import BaseLLM

# Load environment variables
load_dotenv()

# Initialize Storage Directory
BASE_DIR = "./data_storage"
os.makedirs(BASE_DIR, exist_ok=True)

def get_llm() -> BaseLLM:
    api_token = os.getenv("HUGGINGFACEHUB_API_TOKEN")
    if not api_token:
        raise ValueError("❌ Missing Hugging Face API Token!")
    
    try:
        return HuggingFaceEndpoint(
<<<<<<< HEAD
            repo_id="deepseek-ai/deepseek-llm-r1-7b",  
=======
            repo_id="mistralai/Mistral-7B-Instruct-v0.3",
>>>>>>> 9791ae470f178e839d8efe96fd29d3f1a8866b61
            huggingfacehub_api_token=api_token,
            temperature=0.7,
            max_length=4096,
            task="text-generation"
        )
    except Exception as e:
        raise ValueError(f"Error initializing LLM: {str(e)}")

llm = get_llm()
