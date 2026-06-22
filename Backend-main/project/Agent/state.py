


from typing import Optional , TypedDict
from pydantic import BaseModel , Field


# Model or class: State.

# Utility functions and helper code.

# State: Class definition.
class State(TypedDict):
    question : str
    email : str
    category: Optional[str]
    answer: Optional[str]
    translated_question: Optional[str]
    answer_english:      Optional[str]


# Model or class: QuestionClassifier.
# QuestionClassifier: Model class for database operations.
class QuestionClassifier(BaseModel):
     category: str = Field(
     description="""
     Classify the user question into exactly one of these categories:

     - ANSWERABLE: General questions about the research management platform.
      Examples: 'What funding opportunities are available?',
                'What documents do I need to submit?',
                'What are the regulations for international research?',
                'How do I apply for a grant?'

     - NEED_HUMAN: Specific or sensitive questions that require 
      a human expert to answer accurately.
      Examples: 'My funding application was rejected, what do I do?',
                'I have a dispute about my research contract',
                'Why was my project not approved?'

     - NOT_SERIOUS: Unprofessional, off-topic, or irrelevant questions
      that have nothing to do with research management.
      Examples: 'Hello', 'What day is today?',
                'Tell me a joke', 'What is the weather?'

     Reply with only one word: ANSWERABLE, NEED_HUMAN, or NOT_SERIOUS.
     """
)
