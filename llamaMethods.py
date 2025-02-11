from langchain.llms import LlamaCpp
from langchain.callbacks.manager import CallbackManager
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
import PyPDF2
import pytesseract
from PIL import Image

MODEL_PATH = "./models/llama-2-7b-chat.Q4_0.gguf"
n_ctx = 2048

def getModel():
    callbacks = CallbackManager([StreamingStdOutCallbackHandler()])
    model = LlamaCpp(
        model_path=MODEL_PATH,
        temperature=0.5,
        n_gpu_layers=1000,
        max_tokens=1000,
        n_batch=4096,
        n_ctx=n_ctx,
        top_p=1,
        callback_manager=callbacks,
        verbose=True
    )
    return model

def getTextFromPDF(files):
    text = ""
    for file in files:
        if str(file.name).split(".")[-1] == "pdf":
            pdf_reader = PyPDF2.PdfReader(file)
            for page_num in range(len(pdf_reader.pages)):
                text += pdf_reader.pages[page_num].extract_text()
            text = " ".join(text.split())
        elif str(file.name).split(".")[-1] in ["jpg", "jpeg", "png"]:
            photo = Image.open(file)
            text = pytesseract.image_to_string(photo)
    return text

def loadModel(files, params):
    llm = getModel()
    if "question" in params:
        # Q&A Logic
        question = params["question"]
        context = getTextFromPDF(files)
        template = """
            [INST] <<SYS>>
            You are a helpful assistant. Answer the following question based on the provided context:
            Context: {context}
            Question: {question}
            <</SYS>>
            [/INST]
        """
        prompt = PromptTemplate(
            template=template,
            input_variables=["context", "question"]
        )
        llm_chain = LLMChain(
            prompt=prompt,
            llm=llm
        )
        return llm_chain.run(context=context, question=question)
    else:
        # Summarization Logic
        minLength = params["min"]
        maxLength = params["max"]
        template = """
            [INST] <<SYS>>
            Summarize the following text in {min} to {max} words:
            {text}
            <</SYS>>
            [/INST]
        """
        prompt = PromptTemplate(
            template=template,
            input_variables=["text", "min", "max"]
        )
        llm_chain = LLMChain(
            prompt=prompt,
            llm=llm
        )
        context_text = getTextFromPDF(files)
        model_responses = []
        if len(context_text) >= n_ctx:
            for i in range(0, len(context_text), n_ctx):
                model_responses.append(
                    llm_chain.run(
                        text=context_text[i:i + n_ctx],
                        min=minLength - 30,
                        max=maxLength - 30
                    )
                )
        return ''.join(model_responses)
