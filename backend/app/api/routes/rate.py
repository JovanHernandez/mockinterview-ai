from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from ...services import audio_processing, transcription, evaluation
import logging
import time
from typing import Dict, List, Any

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/rate")
async def rate_answer(
    question: str = Form(...), 
    answer: UploadFile = File(...), 
    job_description: str = Form("Some technical job"),
    background: str = Form("")
):
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
        
        # Clean and merge transcriptions
        raw_transcript = " ".join(result["transcriptions"])
        cleaned_transcript = evaluation.clean_transcript(
            result["transcriptions"], 
            question, 
            job_description, 
            background
        )
        
        logger.info(f"Raw transcript length: {len(raw_transcript)} chars, Cleaned transcript length: {len(cleaned_transcript)} chars")
        
        # Analyze audio features
        audio_metrics = audio_processing.analyze_audio(audio_data)
        
        # Evaluate the answer using the cleaned transcript
        evaluation_result = evaluation.evaluate_answer(question, cleaned_transcript, audio_metrics, job_description)
        
        return {
            "question": question,
            "answer": cleaned_transcript,
            "evaluation": evaluation_result
        }
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Error rating answer: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))






