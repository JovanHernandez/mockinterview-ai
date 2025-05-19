from fastapi import APIRouter, UploadFile, File, HTTPException
from ...services import audio_processing, transcription
import logging
from typing import Dict, List, Any
import time

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/transcribe")
async def transcribe_audio_segments(answer: UploadFile = File(...)):
    """
    Transcribe uploaded audio file with automatic model selection
    
    Args:
        answer: Uploaded audio file
    
    Returns:
        Dict with transcriptions, model used, segments used, and audio duration
    """
    try:
        # Read the uploaded file content
        content = await answer.read()
        
        # Validate file size
        if len(content) < 1000:  # Arbitrary small size check
            raise HTTPException(
                status_code=400, 
                detail=f"Audio file is too small ({len(content)} bytes). Please upload a valid audio recording."
            )
            
        # Convert to audio array in memory
        try:
            audio_data = audio_processing.convert_to_wav(content)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
        
        # Determine audio duration (samples / sample_rate)
        duration_seconds = len(audio_data["array"]) / audio_data["sampling_rate"]
        
        # Validate duration
        if duration_seconds < 0.5:  # Less than half a second is suspicious
            raise HTTPException(
                status_code=400, 
                detail=f"Audio duration too short ({duration_seconds:.2f}s). Please upload a valid audio recording."
            )
        
        # Process audio with segmentation
        result = transcription.process_audio_with_segmentation(audio_data, duration_seconds)
        
        # Add duration to result
        result["audio_duration_seconds"] = round(duration_seconds, 2)
        
        return result
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Transcription error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))



