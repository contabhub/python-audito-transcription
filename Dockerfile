# Stage 1: Build Frontend
FROM node:18-alpine as build-frontend
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install
COPY frontend .
RUN npm run build

# Stage 2: Runtime
FROM python:3.9-slim
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements
COPY backend/requirements.txt .

# Install dependencies (CPU-only Torch to save space/RAM)
RUN pip install --no-cache-dir torch torchaudio --index-url https://download.pytorch.org/whl/cpu
RUN pip install --no-cache-dir -r requirements.txt

# Pre-download Whisper model (base)
# Note: This increases image size. If deployment fails, remove this and let it download on first run.
RUN python -c "import whisper; whisper.load_model('base')"

# Copy backend code
COPY backend ./backend

# Copy frontend build from stage 1
COPY --from=build-frontend /app/dist ./dist

# Expose port (Internal doc only)
ENV PORT=8000

# Command to run the application (Shell form to expand $PORT)
CMD uvicorn backend.main:app --host 0.0.0.0 --port $PORT
