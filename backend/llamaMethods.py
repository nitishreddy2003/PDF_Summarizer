from langchain_community.llms import LlamaCpp
from langchain.callbacks.manager import CallbackManager
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from langchain.text_splitter import RecursiveCharacterTextSplitter
import PyPDF2
import pytesseract
from PIL import Image
import logging
from typing import List, Dict, Any
from io import BytesIO

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

MODEL_PATH = "D:/majorProject/pdf-summarizer/backend/models/llama-2-7b-chat.Q4_0.gguf"
N_CTX = 2048
MAX_CHUNK_SIZE = 1500  # Leave room for prompt tokens

class PDFSummarizer:
    def __init__(self):
        self.model = None
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=MAX_CHUNK_SIZE,
            chunk_overlap=200,
            length_function=len,
        )

    def get_model(self):
        """Initialize and return the Llama model."""
        if self.model is None:
            try:
                callbacks = CallbackManager([StreamingStdOutCallbackHandler()])
                self.model = LlamaCpp(
                    model_path=MODEL_PATH,
                    temperature=0.5,
                    n_gpu_layers=1000,
                    max_tokens=1000,
                    n_batch=4096,
                    n_ctx=N_CTX,
                    top_p=1,
                    callback_manager=callbacks,
                    verbose=True
                )
                logger.info("Model loaded successfully")
            except Exception as e:
                logger.error(f"Failed to load model: {e}")
                raise
        return self.model

    def extract_text_from_pdf(self, file) -> str:
        """Extract text from PDF file."""
        try:
            text = ""
            file.file.seek(0)  # Reset stream position
            contents = file.file.read()
            pdf_reader = PyPDF2.PdfReader(BytesIO(contents))

            for page in pdf_reader.pages:
                page_text = page.extract_text()
                if page_text and page_text.strip():
                    text += page_text + " "

            text = " ".join(text.split())
            logger.info(f"Extracted {len(text)} characters from PDF")
            return text

        except Exception as e:
            logger.error(f"Error extracting text from PDF: {e}")
            raise

    def extract_text_from_image(self, file) -> str:
        """Extract text from image using OCR."""
        try:
            file.file.seek(0)
            image = Image.open(file.file)
            text = pytesseract.image_to_string(image)
            logger.info(f"Extracted {len(text)} characters from image")
            return text.strip()
        except Exception as e:
            logger.error(f"Error extracting text from image: {e}")
            raise

    def get_text_from_files(self, files) -> str:
        """Extract text from multiple files."""
        combined_text = ""

        for file in files:
            try:
                filename = getattr(file, 'filename', getattr(file, 'name', 'unknown'))
                file_extension = filename.split(".")[-1].lower()

                if file_extension == "pdf":
                    text = self.extract_text_from_pdf(file)
                elif file_extension in ["jpg", "jpeg", "png", "bmp", "tiff"]:
                    text = self.extract_text_from_image(file)
                else:
                    logger.warning(f"Unsupported file type: {file_extension}")
                    continue

                combined_text += text + " "

            except Exception as e:
                logger.error(f"Error processing file {filename}: {e}")
                continue

        return combined_text.strip()

    def summarize_text(self, text: str, min_length: int, max_length: int) -> str:
        """Summarize text with specified length constraints."""
        llm = self.get_model()

        template = """
        [INST] <<SYS>>
        You are a helpful assistant. Summarize the following text concisely in {min} to {max} words. 
        Focus on the main points and key information.
        <</SYS>>
        
        Text to summarize: {text}
        [/INST]
        """

        prompt = PromptTemplate(
            template=template,
            input_variables=["text", "min", "max"]
        )

        llm_chain = LLMChain(prompt=prompt, llm=llm)

        text_chunks = self.text_splitter.split_text(text)
        summaries = []

        for i, chunk in enumerate(text_chunks):
            try:
                logger.info(f"Processing chunk {i+1}/{len(text_chunks)}")

                chunk_min = max(50, min_length // len(text_chunks))
                chunk_max = max(100, max_length // len(text_chunks))

                summary = llm_chain.run(
                    text=chunk,
                    min=chunk_min,
                    max=chunk_max
                )
                summaries.append(summary.strip())

            except Exception as e:
                logger.error(f"Error summarizing chunk {i+1}: {e}")
                continue

        if len(summaries) > 1:
            combined_summary = " ".join(summaries)
            if len(combined_summary.split()) > max_length:
                final_summary = llm_chain.run(
                    text=combined_summary,
                    min=min_length,
                    max=max_length
                )
                return final_summary.strip()
            return combined_summary

        return summaries[0] if summaries else "Unable to generate summary."

    def answer_question(self, text: str, question: str) -> str:
        """Answer a question based on the provided text."""
        llm = self.get_model()

        template = """
        [INST] <<SYS>>
        You are a helpful assistant. Answer the following question based ONLY on the provided context. 
        If the answer cannot be found in the context, say "I cannot find the answer in the context."
        <</SYS>>

        Context: {text}

        Question: {question}
        [/INST]
        """

        prompt = PromptTemplate(
            template=template,
            input_variables=["text", "question"]
        )

        llm_chain = LLMChain(prompt=prompt, llm=llm)

        try:
            answer = llm_chain.run(text=text, question=question)
            return answer.strip()
        except Exception as e:
            logger.error(f"Error answering question: {e}")
            return "An error occurred while trying to answer the question."
