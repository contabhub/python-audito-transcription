# 🎙️ Premium AI Audio Transcriber

A high-performance, aesthetically pleasing web application that transcribes audio and video files from Google Drive using OpenAI's Whisper model. Built with **FastAPI**, **React**, and **Tailwind CSS**.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.9+-blue.svg)
![React](https://img.shields.io/badge/react-18-cyan.svg)

## ✨ Features

- **🚀 Modern & Premium UI**: Glassmorphism design, smooth animations, and a dark-themed interface built with Tailwind CSS and Framer Motion.
- **🤖 Powered by OpenAI Whisper**: High-accuracy transcription support for Portuguese (and other languages).
- **☁️ Google Drive Integration**: Directly download and transcribe files from public Drive links.
- **⚡ Fast Backend**: Async processing with FastAPI.
- **🐳 Docker Ready**: Multi-stage build optimized for deployment on platforms like Render.
- **🔒 Privacy Focused**: Files are processed ephemerally and deleted immediately after transcription.

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Framer Motion, Lucide Icons.
- **Backend**: FastAPI, Python 3.9+, Uvicorn.
- **AI Model**: OpenAI Whisper (Local execution).
- **Core Libraries**: `gdown` (Drive downloads), `ffmpeg-python` (Audio processing).

## 🚀 Getting Started

### Prerequisites

- [Docker](https://www.docker.com/) (Recommended for easy setup)
- OR [Python 3.9+](https://www.python.org/) and [Node.js 18+](https://nodejs.org/)
- **FFmpeg** must be installed on your system if running locally without Docker.

### 🏃‍♂️ Running Locally (Manual)

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/contabhub/python-audito-transcription.git
    cd python-audito-transcription
    ```

2.  **Backend Setup:**
    ```bash
    # Create virtual environment
    python -m venv venv
    
    # Activate (Windows)
    .\venv\Scripts\Activate
    # Activate (Mac/Linux)
    source venv/bin/activate
    
    # Install dependencies
    pip install -r backend/requirements.txt
    
    # Run Server
    uvicorn backend.main:app --reload --port 8000
    ```

3.  **Frontend Setup:**
    Open a new terminal:
    ```bash
    cd frontend
    npm install
    npm run dev
    ```
    Access the app at `http://localhost:5173`.

### 🐳 Running with Docker

```bash
docker build -t transcriber-app .
docker run -p 8000:8000 transcriber-app
```
Access at `http://localhost:8000`.

## 📦 Deployment (Render)

This project is optimized for [Render](https://render.com/).

1.  Create a new **Web Service** on Render.
2.  Connect this GitHub repository.
3.  Choose **Docker** as the Runtime.
4.  Render will automatically build and deploy.
    *   *Note*: The first build may take a few minutes to download the Whisper model.

## ⚠️ Important Notes

- **Resource Usage**: The "base" Whisper model is used by default. For larger models (small, medium), ensure your deployment environment has sufficient RAM (2GB+ recommended).
- **Ephemeral Storage**: Transcriptions are **not saved** in a database. You must download the generated text file immediately.

## 📄 License

This project is licensed under the MIT License.
