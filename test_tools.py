import os
from dotenv import load_dotenv; load_dotenv()
from langchain_mistralai import ChatMistralAI
from langchain.agents import create_agent
from tools import web_search, get_weather

llm = ChatMistralAI(model="mistral-small-latest", temperature=0)
agent = create_agent(llm, tools=[web_search, get_weather])
print("Invoking agent...")
try:
    print(agent.invoke({"messages": [("user", "What is the weather in Delhi?")]}))
except Exception as e:
    print("Error:", e)
