import streamlit as st
from main import get_research, generate_news_article

st.title("AI-Powered News Generator")

topic = st.text_input("Enter your topic:")

if st.button("Generate News Article"):
    try:
        research = get_research(topic)
        if not research:
            st.warning("No research data found for the given topic.")
        else:
            article = generate_news_article(research, topic)
            st.write(article)
    except Exception as e:
        st.error(f"An error occurred: {e}")