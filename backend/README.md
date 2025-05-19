# 🧠 MockInterview.AI – Backend

This is the **Python FastAPI backend** for the MockInterview.AI platform. It handles:

- Transcribing user voice responses using **OpenAI Whisper**
- Analyzing audio delivery features (e.g., pauses, tone) using **pyAudioAnalysis**
- Scoring answers with **OpenAI GPT**
- Returning detailed feedback for each interview response

---

## ⚙️ Tech Stack

- **FastAPI** – Web framework
- **Whisper** – Speech-to-text transcription
- **pyAudioAnalysis** – Audio feature extraction
- **OpenAI API** – LLM-based answer evaluation
- **FFmpeg** – Audio processing (**[required – install here](https://www.gyan.dev/ffmpeg/builds/)**)
- **Docker** – Containerized deployment (via root `docker-compose.yml`)

---


## Getting Started
### 1. Create and Activate the Virtual Environment
Create virtual environment
```bash
python -m venv venv
```

Activate the virtual environment:
```bash
source venv/bin/activate
```
For windows:
```bash
venv\Scripts\activate
```
Finally install required libraries
```bash
pip install -r requirements.txt
```
To deactivate the virtual environment:
```bash
deactivate
```
### 2. Create .env file
Add the following to the .env file:
```bash
OPENAI_API_KEY=your_openai_api_key
```
### 3. Run the application locally
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```


