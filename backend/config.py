import os
from dotenv import load_dotenv
from langchain_huggingface import HuggingFaceEndpoint  
from langchain_core.language_models import BaseLLM

# Load environment variables
load_dotenv()

# Initialize Storage Directory
BASE_DIR = "./data_storage"
os.makedirs(BASE_DIR, exist_ok=True)

def get_llm(repo_id: str) -> BaseLLM:
    api_token = os.getenv("HUGGINGFACEHUB_API_TOKEN")
    if not api_token:
        raise ValueError("❌ Missing Hugging Face API Token!")
    
    try:
        return HuggingFaceEndpoint(
<<<<<<<< HEAD:backend/config.py
            repo_id="deepseek-ai/DeepSeek-R1-Distill-Qwen-32B",  
========
            repo_id=repo_id,  
>>>>>>>> a877ce14984f3d2502b116a50348bf8e47bc6862:config.py
            huggingfacehub_api_token=api_token,
            temperature=0.7,
            max_length=8192,  
            task="text-generation"
        )
    except Exception as e:
        raise ValueError(f"Error initializing LLM ({repo_id}): {str(e)}")

# Initialize models
reasoning_model = get_llm("Qwen/QwQ-32B")
textgen_model = get_llm("describeai/gemini")

# Example usage
def generate_response(prompt: str, use_reasoning: bool = False):
    model = reasoning_model if use_reasoning else textgen_model
    return model.invoke(prompt)

# Example calls
if __name__ == "__main__":
    print(generate_response("What is the capital of France?", use_reasoning=True))
    print(generate_response("Write a short poem about the sea."))
