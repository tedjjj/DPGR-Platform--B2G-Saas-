
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langgraph.graph import START , END , StateGraph
from .tools import  *
from .state import *
from .prompt import *

# Graph or workflow graph definitions for processing pipelines.

load_dotenv()

llm = ChatGroq(model="llama-3.3-70b-versatile")


# Method: classify_agent.
# Function: classify_agent.
def classify_agent(state: dict)->dict:
    question = state["question"]
    resp = llm.with_structured_output(QuestionClassifier).invoke(
        [
            {"role":"system" , "content": classifier_prompt()},
            {"role":"user" , "content": question}

        ]
    )
    print(f"DEBUG — Question: {question}")
    print(f"DEBUG — Category: {resp.category}")
    return {"category" : resp.category}


# Method: translate_question_node.
# Function: translate_question_node.
def translate_question_node(state: dict) -> dict:
    question = state["question"]
    response = llm.invoke([
        {"role": "system", "content": "Translate the following question to English. Return only the translated text nothing else."},
        {"role": "user",   "content": question}
    ])
    return {"translated_question": response.content}



# Method: rag_agent.
# Function: rag_agent.
def rag_agent(state:dict)->dict:
    question = state.get("translated_question")
    vectorstore = load_vectorstore()

    retriever = vectorstore.as_retriever(
        search_kwargs = {"k": 5 }
    )
    docs = retriever.invoke(question)
    context = "\n\n".join(doc.page_content for doc in docs)
    # -------------------------------------------------------
    answer = llm.invoke([
        {"role":"system" , "content": rag_prompt(context,question)},
        {"role":"user" , "content": question}
    ])

    if "INSUFFICIENT_CONTEXT" in answer.content:
        return {"category" : "NEED_HUMAN"}

    return {"answer_english" : answer.content, "category" : "ANSWERABLE"}


# Method: translate_answer_node.
# Function: translate_answer_node.
def translate_answer_node(state: dict) -> dict:
    english_answer = state.get("answer_english")
    original_question = state["question"]

    response = llm.invoke([
        {"role": "system", "content": """
        The user asked a question and you have an English answer.
        Translate the answer to the same language as the original question.
        If the question was in Arabic reply in Arabic.
        If the question was in French reply in French.
        If the question was in English keep the answer in English.
        Return only the translated answer nothing else.
        """},
        {"role": "user", "content": f"Original question: {original_question}\nEnglish answer: {english_answer}"}
    ])
    return {"answer": response.content}


# Method: save_human_agent.
# Function: save_human_agent.
def save_human_agent(State: dict) -> dict:
    # On retourne juste un marqueur, c'est views.py qui sauvegarde en DB
    return {"answer": "NEED_HUMAN"}

# Method: reject_node.
# Function: reject_node.
def reject_node(State:dict)-> dict:
    response = llm.invoke([{"role":"system" , "content":off_topic_prompt()}])
    return {"answer" : response.content}


# Method: route.
# Function: route.
def route(state: dict) -> str:
    return state["category"]

# ---------------------------------------------------
graph = StateGraph(State)

graph.add_node("save_to_latter",save_human_agent)
graph.add_node("reject",reject_node)
graph.add_node("classify",classify_agent)
graph.add_node("rag",rag_agent)
graph.add_node("translate_question", translate_question_node)
graph.add_node("translate_answer",  translate_answer_node)

graph.add_edge(START,"classify")

graph.add_conditional_edges(
    "classify",
    route ,
    {
        "ANSWERABLE": "translate_question" ,
        "NEED_HUMAN":"save_to_latter",
        "NOT_SERIOUS":"reject",
    }

)
graph.add_edge("translate_question", "rag")

graph.add_conditional_edges(
    "rag",
    route,
    {
        "NEED_HUMAN": "save_to_latter",
        "ANSWERABLE": "translate_answer",
    }

)


graph.add_edge("translate_answer", END)
graph.add_edge("save_to_latter", END)
graph.add_edge("reject", END)


chatbot = graph.compile()

# Method: ask.
# Function: ask.
def ask(question: str, email: str) -> dict:
    result = chatbot.invoke({
        "question": question,
        "email":    email,
        "category": None,
        "answer":   None,
        "translated_question": None,
        "answer_english": None
    })

    # Nettoyage des sauts de ligne
    answer_text = result.get("answer", "No answer available")
    answer_text = answer_text.replace("\\n", "\n")  # transforme les \n en vrais sauts de ligne

    return {
        "question": question,
        "answer": answer_text,
        "category": result.get("category")
    }

# Main entry point for script execution.
if __name__ == "__main__":
    print(ask("كيف يتم صرف المنحة? ", "user@test.com"))


