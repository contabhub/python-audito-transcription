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

# Install system dependencies (ffmpeg is required for Whisper)
RUN apt-get update && apt-get install -y \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Pre-download Whisper model (base) to cache it in the image
RUN python -c "import whisper; whisper.load_model('base')"

# Copy backend code
COPY backend ./backend

# Copy frontend build from stage 1
COPY --from=build-frontend /app/dist ./dist

# Expose port
ENV PORT=8000

# Command to run the application
CMD ["sh", "-c", "uvicorn backend.main:app --host 0.0.0.0 --port $PORT"]
