import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = "./data_storage"
os.makedirs(BASE_DIR, exist_ok=True)

gemini_api_key = os.getenv("GEMINI_API_KEY")

if not gemini_api_key:
    raise ValueError("❌ Missing Google Gemini API Key!")

genai.configure(api_key=gemini_api_key)

def get_gemini_model():
    return genai.GenerativeModel("gemini-1.5-pro") 

llm = get_gemini_model()

def generate_response(prompt: str) -> str:
    try:
        response = llm.generate_content(prompt)
        return response.text.strip() if response else "⚠️ No response generated."
    except Exception as e:
        return f"❌ Error generating response: {str(e)}"

if __name__ == "__main__":
    print(generate_response("What is the capital of France?"))
    print(generate_response("Write a short poem about the sea."))
