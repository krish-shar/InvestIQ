from dotenv import load_dotenv
import os
from config import config

# SAMBA_NOVA_API_KEY = os.getenv("SAMBA_NOVA_API_KEY")
SAMBA_NOVA_API_KEY = config["SAMBA_API"]

config_list = [{
    "model": "Meta-Llama-3.1-70B-Instruct", 
    "api_key": SAMBA_NOVA_API_KEY, 
    "base_url": "https://api.sambanova.ai/v1"}]

os.environ["SAMBA_NOVA_API_KEY"] = SAMBA_NOVA_API_KEY
os.environ["OPENAI_API_KEY"] = SAMBA_NOVA_API_KEY

import datetime

from autogen import ConversableAgent
from autogen.coding import LocalCommandLineCodeExecutor
import autogen


# Create a local command line code executor.
executor = LocalCommandLineCodeExecutor(
    timeout=10,  # Timeout for each code execution in seconds.
    work_dir="generation",  # Use the temporary directory to store the code files.
)
code_executor_agent = ConversableAgent(
    "code_executor_agent",
    llm_config=False,  # Turn off LLM for this agent.
    code_execution_config={"executor": executor},  # Use the local command line code executor.
    human_input_mode="NEVER",  # Always take human input for this agent for safety.
    is_termination_msg=lambda msg: "silence" in msg["content"].lower() or "" == msg["content"],
)

import datetime

from autogen import ConversableAgent
from autogen.coding import LocalCommandLineCodeExecutor


# Create a local command line code executor.
executor = LocalCommandLineCodeExecutor(
    timeout=10,  # Timeout for each code execution in seconds.
    work_dir="generation",  # Use the temporary directory to store the code files.
)
code_executor_agent = ConversableAgent(
    "code_executor_agent",
    llm_config=False,  # Turn off LLM for this agent.
    code_execution_config={"executor": executor},  # Use the local command line code executor.
    human_input_mode="NEVER",  # Always take human input for this agent for safety.
    is_termination_msg=lambda msg: "silence" in msg["content"].lower() or "" == msg["content"] or "feel free to ask." in msg["content"] or  "done" in msg["content"].lower(),
)

date = datetime.datetime.now().strftime("%Y-%m-%d")
code_writer_system_message = f"""
If you recieve an empty message, reply with "done"
Today is {date}.
You are an expert algorithmic trader.
You have been asked to write a Python script that implements a simple trading strategy.
The script should use yfinance to get historical stock price data and pandas to analyze the data.
You will be generating a graph that shows the stock price and the described trading strategy.
You are going to show the buy and sell signals on the graph as well.
You are to compare the performance of the trading strategy against the buy-and-hold strategy.
You will default to using SPY as the stock symbol unless stated otherwise.
You are to save the graph as a PNG file called "output.png" ensure to include the stock name in the header.
Put all the code used to generate the graph in a markdown file called "output.md".
You are to start from 2023 and end in 2024 unless stated otherwise.
No need to create a csv file for the stock data, you can use the yfinance library to get the data.
Create a file called output.md that contains all the code used to create the graph.
Ensure there are enough buy and sell signals to show the trading strategy.
Ensure there are not too many buy and sell signals.
You can use the following code as a starting point:

```python
import yfinance as yf
import pandas as pd
import matplotlib

# Get the stock data
stock = yf.Ticker("SPY")
data = stock.history(start="2023-01-01", end="{date}")

# Implement the trading strategy
# Your code
```
Reply 'TERMINATE' in the end when everything is done.
When you made the readme file, you can reply 'DONE' to end the conversation.
"""

code_writer_agent = ConversableAgent(
    "code_writer_agent",
    system_message=code_writer_system_message,
    llm_config={"config_list": config_list},
    code_execution_config=False,  # Turn off code execution for this agent.
    # end of conversation when the agent says 'DONE'
    is_termination_msg=lambda msg: "done" in msg["content"].lower() or "feel free to ask." in msg["content"] or "terminate" in msg["content"].lower(),
    human_input_mode="NEVER",  # Always take human input for this agent for safety.

)

def write_algorithm(prompt):
    chat_result = code_writer_agent.initiate_chat(
        code_executor_agent,
        message=prompt,
    )
    return chat_result


if __name__ == "__main__":
    print("Starting the conversation.")
    write_algorithm("20 day short term moving average and 50 day long term moving average.")
    print("Conversation ended.")

