import os
import shutil
import uuid
import subprocess
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
import gdown

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TranscribeRequest(BaseModel):
    drive_link: str
    model_name: str = "base"

def download_from_drive(drive_link: str, output_dir: str) -> str:
    """Extracts file ID and downloads file."""
    try:
        if '/d/' in drive_link:
            file_id = drive_link.split('/d/')[1].split('/')[0]
        elif 'id=' in drive_link:
            file_id = drive_link.split('id=')[1].split('&')[0]
        else:
            raise ValueError("Invalid Google Drive Link")
            
        output_filename = os.path.join(output_dir, f"{uuid.uuid4()}.mp3")
        # gdown might fail if quiet=True and issues occur, so we keep it noisy in logs or handle exception
        url = f'https://drive.google.com/uc?id={file_id}'
        gdown.download(url, output_filename, quiet=False)
        return output_filename
    except Exception as e:
        print(f"Error downloading: {e}")
        raise HTTPException(status_code=400, detail=f"Failed to download file: {str(e)}")

def run_whisper(filepath: str, model_name: str, output_dir: str) -> str:
    """Runs whisper command line."""
    try:
        # We use a unique output dir for this run to avoid collisions
        result = subprocess.run(
            [
                "whisper", filepath,
                "--language", "pt",
                "--model", model_name,
                "--output_dir", output_dir,
                "--output_format", "txt"
            ],
            capture_output=True,
            text=True
        )
        
        if result.returncode != 0:
            print(f"Whisper Error: {result.stderr}")
            raise Exception(f"Whisper failed: {result.stderr}")
            
        # Whisper output filename - usually same as input filename but with .txt
        base_name = os.path.splitext(os.path.basename(filepath))[0]
        txt_file = os.path.join(output_dir, f"{base_name}.txt")
        
        if not os.path.exists(txt_file):
             raise Exception("Transcription output file not found.")
             
        with open(txt_file, "r", encoding="utf-8") as f:
            return f.read()

    except Exception as e:
        print(f"Transcription error: {e}")
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")

@app.post("/api/transcribe")
async def transcribe_endpoint(request: TranscribeRequest):
    # Create temporary directory for this request
    request_id = str(uuid.uuid4())
    tmp_dir = os.path.join("tmp", request_id)
    os.makedirs(tmp_dir, exist_ok=True)
    
    audio_path = None
    try:
        # 1. Download
        audio_path = download_from_drive(request.drive_link, tmp_dir)
        
        # 2. Transcribe
        transcript = run_whisper(audio_path, request.model_name, tmp_dir)
        
        return {"transcript": transcript, "message": "Transcription complete. Please save your text immediately."}
        
    finally:
        # Cleanup
        if os.path.exists(tmp_dir):
            shutil.rmtree(tmp_dir)

@app.get("/health")
def health_check():
    return {"status": "ok"}

# Mount the static files (frontend build)
# We assume 'dist' folder is at the root of the workdir (which will be /app/dist in Docker)
if os.path.exists("dist"):
    app.mount("/", StaticFiles(directory="dist", html=True), name="static")
