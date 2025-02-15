from researcher import get_research
from writer import generate_news_article
from storage import save_output

def main():
    topic = input("Enter the topic you want to research: ").strip()
    print(f"Debug: Topic: {topic}")
    
    research_summary = get_research(topic)
    print(f"Debug: Research Summary: {research_summary}")
    
    article = generate_news_article(research_summary, topic)
    print(f"Debug: Generated Article: {article}")
    
    save_output(topic, article, research_summary)

# Run the system
if __name__ == "__main__":
    main()