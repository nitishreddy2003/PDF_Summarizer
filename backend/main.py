from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from llamaMethods import PDFSummarizer


app = FastAPI()

# Enable CORS for React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # restrict in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pdf_summarizer = PDFSummarizer()

@app.post("/summarize/")
async def summarize(
    files: List[UploadFile] = File(...),
    length: str = Form(...)
):
    params = {
        "Short": {"min": 20, "max": 50},
        "Medium": {"min": 50, "max": 100},
        "Long": {"min": 100, "max": 200}
    }.get(length, {"min": 50, "max": 100})
    
    # response = loadModel(files, params)
    # return {"summary": response}

    text = pdf_summarizer.get_text_from_files(files)

    # Summarize the extracted text with length params
    summary = pdf_summarizer.summarize_text(text, params["min"], params["max"])

    return {"summary": summary}

@app.post("/question/")
async def ask_question(
    files: List[UploadFile] = File(...),
    question: str = Form(...)
):
    # response = loadModel(files, {"question": question})
    # return {"answer": response}

    text = pdf_summarizer.get_text_from_files(files)

    # Get answer based on extracted text and question
    answer = pdf_summarizer.answer_question(text, question)

    return {"answer": answer}
