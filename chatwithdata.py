from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import openai
import os
import sqlite3
from langchain.chat_models import ChatOpenAI
from langchain.prompts import ChatPromptTemplate, HumanMessagePromptTemplate, MessagesPlaceholder
from langchain.tools import Tool, StructuredTool
from langchain.agents import OpenAIFunctionsAgent, AgentExecutor
from langchain.schema import SystemMessage
from langchain.memory import ConversationBufferMemory
from pydantic.v1 import BaseModel
from typing import List, Union, Tuple
from pymongo import MongoClient
import requests

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Activate CORS for all routes

client = MongoClient('mongodb+srv://houssemzorgui10:5plXOI0r7RkgVfd7@cluster0.b8jhtwq.mongodb.net/Pim2024-Sim-2?retryWrites=true&w=majority')
db = client['Pim2024-Sim-2']  # Remplacez 'mydatabase' par le nom de votre base de données
conversation_collection = db['conversation']





# Function to get file path from Node.js server
def get_file_path_from_nodejs(file_id):
    # URL of the API to retrieve the file path from the ID
    url = f"http://localhost:3000/files/file/{file_id}"
    
    # Send a GET request to retrieve the file path
    response = requests.get(url)
    
    # Check if the request was successful
    if response.status_code == 200:
        # Extract the file path from the JSON response
        file_path = response.json().get('filePath')
        return file_path
    else:
        # If the request failed, print an error message
        print(f"Failed to get file path. Status code: {response.status_code}")
        return file_id

# Path to database
file_id = sys.argv[1] if len(sys.argv) > 1 else None

if file_id:
    db_path = get_file_path_from_nodejs(file_id)
    if db_path:
        print(f"File path set to: {db_path}")
else:
    print("Please provide a file ID as an argument.")



# Définissez une fonction pour insérer la conversation dans la collection MongoDB
def save_conversation(file_id, user_input, output):
    conversation_collection.insert_one({'file_id': file_id, 'user_input': user_input, 'output': output})

# Set up your OpenAI API key. You need an API key from OpenAI to use GPT models.
api_key = "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"

# Initialize chat with OpenAI
chat = ChatOpenAI(openai_api_key=api_key)

# Define a function to Execute SQLite Queries
def run_sqlite_query(query: str) -> Union[str, List[Tuple]]:
    """Execute a SQLite query and fetch the results."""
    with sqlite3.connect(db_path) as conn:
        cursor = conn.cursor()
        try:
            cursor.execute(query)
            return cursor.fetchall()
        except sqlite3.OperationalError as err:
            return f"The following error occurred: {str(err)}"

# Create Schema Definition for Query Arguments
class RunQueryArgsSchema(BaseModel):
    query: str  

# Creating a Tool to Run SQLite Queries
run_query_tool = Tool.from_function(
    name="run_query",
    description="Run sqlite query",
    func=run_sqlite_query,
    args_schema=RunQueryArgsSchema    
)

# Define a function to retrieve table names from a database
def list_tables():
    rows = run_sqlite_query("SELECT name FROM sqlite_master WHERE type='table';")
    return "\n".join(row[0] for row in rows if row[0] is not None)

tables = list_tables()

# Define a function for detailing table schemas
def describe_tables(table_names):
    tables = ', '.join("'" + table + "'" for table in table_names)
    rows = run_sqlite_query(f"SELECT sql FROM sqlite_master WHERE type='table' and name IN ({tables});")
    return "\n".join(row[0] for row in rows if row[0] is not None)
    
# Construct a tool leveraging the describe_tables function for database introspection
class DescribeTablesArgsSchema(BaseModel):
    table_names: List[str]

describe_tables_tool = Tool.from_function(
    name="describe_table",
    description="Given a list of table names returns a squema of the tables",
    func=describe_tables,
    args_schema=DescribeTablesArgsSchema
)

# Define a function for generating HTML reports based on query results
def write_report(filename, html):
    with open(filename, 'w') as f:
        f.write(html)

# Create a reporting tool that utilizes the write_report function for output formatting
class WriteReportsArgsSchema(BaseModel):
    filename: str
    html: str
    
write_report_tool = StructuredTool.from_function(
    name="write_report",
    description="write html file to disk. Use this tools whenever someone asks for a report",
    func=write_report,
    args_schema=WriteReportsArgsSchema
)

# List all tools designed for database querying and report generation
tools = [run_query_tool, describe_tables_tool, write_report_tool]

# Allocate memory for storing conversational context and history
memory = ConversationBufferMemory(
    memory_key="chat_history",
    return_messages=True
)

# Designs a prompt template for guiding conversational agent interactions
prompt = ChatPromptTemplate(
    messages=[
        SystemMessage(content=(
            "You are an AI that has access to a SQLite database.\n{tables}.\n"
            f"The database has tables of: {tables}\n"
            "Do not make any assumptions about what tables or columns exist "
            "Instead, use the 'describe_tables' function"
        )),
        MessagesPlaceholder(variable_name="chat_history"),
        HumanMessagePromptTemplate.from_template("{input}"),
        MessagesPlaceholder(variable_name="agent_scratchpad")
    ]
)  

# Create an agent
agent = OpenAIFunctionsAgent(
    llm=chat,
    prompt=prompt,
    tools=tools
)

# Deploys an agent executor to facilitate the execution of defined operations and user queries
agent_executor = AgentExecutor(
    agent=agent,
    tools=tools,
    handle_parsing_errors=True,
    memory=memory
)

# Define endpoint for interacting with the chat agent
@app.route('/chat', methods=['POST'])
def chat():
    # Obtenir l'entrée utilisateur à partir des données JSON de la requête
    user_input = request.json.get('user_input')
    
    # Obtenez le file_id à partir des données JSON de la requête
    file_id = request.json.get('file_id')

    print(f"User input: {user_input}")
    print(f"File ID: {file_id}")

    # Exécuter l'agent de chat
    response = agent_executor(user_input)

    # Enregistrer la conversation dans MongoDB
    save_conversation(file_id, user_input, response['output'])

    # Construire la réponse JSON
    json_response = {
        'output': response['output']
        # Autres champs que vous souhaitez inclure dans la réponse...
    }

    # Renvoyer la réponse JSON
    return jsonify(json_response)
# Define endpoint for retrieving conversations by file_id
@app.route('/conversations', methods=['GET'])
def get_conversations():
    # Récupérer l'ID du fichier à partir des paramètres de requête
    file_id = request.args.get('file_id')

    # Récupérer les conversations associées à l'ID du fichier
    conversations = list(conversation_collection.find({'file_id': file_id}))

    # Convertir les ID BSON en chaînes
    for conversation in conversations:
        conversation['_id'] = str(conversation['_id'])

    return jsonify(conversations)



# Run the Flask app
if __name__ == '__main__':
    app.run(debug=True)
