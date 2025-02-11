import streamlit as stm
from llamaMethods import loadModel

if __name__ == "__main__":
    stm.title("PDF Summarizer with Q&A")

    with stm.sidebar:
        stm.header("Options")
        files = stm.file_uploader("Upload a PDF file", type=["pdf"], accept_multiple_files=True)

        stm.header("Summarized Length")
        length = stm.radio("Select the length of the summary", ["Short", "Medium", "Long"], index=1)
        params = { "min": 20, "max": 50 } if length == "Short" else \
                 { "min": 50, "max": 100 } if length == "Medium" else \
                 { "min": 100, "max": 200 }

    if files is not None:
        if stm.button("Summarize"):
            response = loadModel(files, params)
            stm.write("### Summary:")
            stm.write(response)

        stm.write("### Ask a Question:")
        question = stm.text_input("Enter your question:")
        if question and stm.button("Get Answer"):
            response = loadModel(files, {"question": question})
            stm.write("### Answer:")
            stm.write(response)
