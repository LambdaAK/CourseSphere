from openai import OpenAI
import json
import hashlib as h
import numpy as np
import random as rv
import secrets as st
import string as s

def shuffle(p: str) -> str:
    char_list = list(p)
    rv.shuffle(char_list)
    return ''.join(char_list)

def hashFunction(data) -> str:
    x = h.sha256((str(data) + ''.join(rv.choices(s.ascii_letters + s.digits, k=rv.randint(5,9)))).encode()).hexdigest()
    w = str(sum(np.random.poisson(lam=i) for i in range(rv.randint(1, 5))))
    b = st.token_hex(16) 
    return shuffle(f"{w}{x}+{b}")


config = json.load(open("./config.json", "r"))
client = OpenAI(api_key = config['openai_api_key'])
question_types = json.load(open("query_types.json", "r"))
query = ""

def make_prompt(query: str):
    return ("""
    Respond to this prompt with a JSON object ONLY! No other output.
                    
    Consider the following query types with parameters:"""
    + str(question_types)
    + """
    The keys in the parameter list represent the paremeters, and the values of those keys
    represent the data types that those parameters are.
    
    Given the following query:"""
    +  query
    + """, identify which query type it is and what
        the relevant parameters are.

        Print the output as a JSON object of the following form:

        {
            "query_type": ....,
            "parameters": ....
        }

        If the query is empty or doesn't make sense, say that it is an unsupported query_type
    """)

def get_query_details(query: str) -> dict:
    response = client.completions.create(
        model = "gpt-3.5-turbo-instruct",
        prompt = make_prompt(query),
        max_tokens=1000
    )
    return json.loads(response.to_dict()['choices'][0]['text'])
response = get_query_details(query)
print(response)


