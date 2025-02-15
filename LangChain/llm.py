from langchain_huggingface.llms import HuggingFaceEndpoint
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def get_llm():
    api_token = os.getenv("HUGGINGFACEHUB_API_TOKEN")
    if not api_token:
        raise ValueError("❌ Missing Hugging Face API Token! Set 'HUGGINGFACEHUB_API_TOKEN' in your environment variables or .env file.")
    os.environ["HUGGINGFACEHUB_API_TOKEN"] = api_token

    return HuggingFaceEndpoint(
        repo_id="mistralai/Mistral-7B-v0.1",
        task="text-generation",
        temperature=0.7,
        model_kwargs={"max_length": 512}  # Ensure max_length is passed correctly
    )