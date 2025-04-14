import openai
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import sounddevice as sd
import numpy as np
import io
import wave

app = FastAPI()

# Allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

openai.api_key = "your_openai_api_key"  # Replace with your OpenAI Whisper API key

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("🔗 Client connected for live transcription...")

    try:
        while True:
            audio_chunk = await websocket.receive_bytes()
            audio_file = io.BytesIO(audio_chunk)
            
            # Whisper API call
            response = openai.Audio.transcribe("whisper-1", audio_file)
            transcript = response.get("text", "")

            # Send back transcribed text
            await websocket.send_text(transcript)

    except Exception as e:
        print("❌ Error:", e)
        await websocket.close()
