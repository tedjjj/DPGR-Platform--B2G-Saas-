
import os
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.document_loaders import PyPDFLoader, TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS

# Chemin absolu vers le dossier Agent

# Utility tools and helper functions.

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../Agent"))
VECTORSTORE_DIR = os.path.join(BASE_DIR, "vestorestore")


# Method: build_vectorstore.
# Function: build_vectorstore.
def build_vectorstore(pdf_folder: str):
    embedding = HuggingFaceEmbeddings(
        model_name="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
    )
    all_docs = []

    for filename in os.listdir(pdf_folder):
        filepath = os.path.join(pdf_folder, filename)
        if filename.endswith(".pdf"):
            loader = PyPDFLoader(filepath)
            all_docs.extend(loader.load())
        elif filename.endswith(".txt"):
            loader = TextLoader(filepath, encoding="utf-8")
            all_docs.extend(loader.load())

    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=100)
    chunks = splitter.split_documents(all_docs)

    vestorestore = FAISS.from_documents(chunks, embedding)
    os.makedirs(VECTORSTORE_DIR, exist_ok=True)
    vestorestore.save_local(VECTORSTORE_DIR)
    print(f"Vectorstore built with {len(chunks)} chunks")


# Method: load_vectorstore.
# Function: load_vectorstore.
def load_vectorstore():
    if not os.path.exists(VECTORSTORE_DIR):
        raise RuntimeError(
            f"Vectorstore not found at {VECTORSTORE_DIR}. "
            f"Run `python setup.py` first to build it."
        )

    embedding = HuggingFaceEmbeddings(
        model_name="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
    )
    vestorestore = FAISS.load_local(
        VECTORSTORE_DIR,
        embedding,
        allow_dangerous_deserialization=True
    )
    return vestorestore
