from openai import OpenAI
from dataclasses import dataclass, field
from typing import List
import json

# Load configuration and question types
#config = json.load(open("./config.json", "r"))
#client = OpenAI(api_key=config['openai_api_key'])


@dataclass
class CourseSphereUser:
    """
    A quick representation of relevant information tied to the user to be sent to the query manager
    """
    majors: List[str] = field(default_factory=list)
    minors: List[str] = field(default_factory=list)
    courses: List[str] = field(default_factory=list)
    college: str = ""
    year: str = ""
    about: str = ""

# prob good across all colleges.
@dataclass
class Course:
    name: str

#Needs a way to generalize accross all JSONS in course roster, some fields will be optional, some core.
@dataclass
class Professor:
    name: str

class QueryManager:
    """
    A class designed to manage model queries and their returns.
    """

    def __init__(self, query, user_data):
        """
        Initializes a query manager object with fields representing the process of returning
        the response
        :param query: The query to be managed (im running out of ideas)
        """
        assert (query is not None)
        
        self.query = query
        self.user_data = CourseSphereUser(user_data)
        self.query_types_dict = {} #json.load(open("query_types.json", "r"))
        self.prompt = self.generate_prompt()
        self.query_type = self.classify_query_type()
        self.response = self.get_response_to_query()

    def generate_prompt(self) -> str:
        """
        Returns a prompt for the OpenAI model based on the query stored within this object


        :return: A formatted string to be used as a prompt for the OpenAI model.
        """

        return (f"""
        Respond to this prompt with a JSON object ONLY! No other output.
                        
        Consider the following query types with parameters: {str(self.query_types_dict)}
        The keys in the parameter list represent the parameters, and the values of those keys
        represent the data types that those parameters are.
        
        Given the following query: {self.query}, identify which query type it is and what
        the relevant parameters are.
    
        Print the output as a JSON object of the following form:
    
        {{
            "query_type": ....,
            "parameters": ....
        }}
    
        If the query is empty or doesn't make sense, say that it is an unsupported query_type.
        """)

    # This doubles as a classification model, to classify a query as a specific query type.
    def classify_query_type(self) -> dict:
        """
        Uses OpenAI's GPT-3.5 model to get details about the query and determine it's type

        :param query: The query string provided by the user.
        :return: A dictionary containing the query type and parameters.
        """
        return {"not a query": "query"}
        #response = client.completions.create(
            #model="gpt-3.5-turbo-instruct",
            #prompt=self.prompt,
            #max_tokens=1000
        ##)
        #return json.loads(response.to_dict()['choices'][0]['text'])  # questionable warning on pycharm ide

    # The actual LLM stuff, make use of self.user_data, and self.query. 
    def get_response_to_query(self) -> dict:
        """
        """
        hasUserData = (self.user_data is not None) # This will determine if we can send any supporting data for the model to make it's response.
        query_type = self.query_type # This will determine what relevant data is retrieved.
        query = self.query
        return "Fake implementation"
    