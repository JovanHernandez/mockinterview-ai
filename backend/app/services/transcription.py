import whisper
import os
import time
import numpy as np
from typing import Union, Dict, List, Optional
import logging
from pydub import AudioSegment

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Dictionary to store loaded models
whisper_models = {}

def get_model(model_name="tiny.en"):
    """Get or load the specified Whisper model"""
    if model_name not in whisper_models:
        logger.info(f"Loading Whisper model: {model_name}")
        whisper_models[model_name] = whisper.load_model(model_name)
    return whisper_models[model_name]

def transcribe_audio(audio_data: Dict[str, Union[np.ndarray, int]], model_name="tiny.en") -> str:
    """
    Transcribe audio using Whisper with in-memory processing
    
    Args:
        audio_data: Dictionary with 'array' (numpy array) and 'sampling_rate' (int) keys
        model_name: Name of the Whisper model to use (tiny.en or base.en)
    
    Returns:
        Transcribed text
    """
    try:
        model = get_model(model_name)
        
        # Validate input format
        if not isinstance(audio_data, dict) or 'array' not in audio_data or 'sampling_rate' not in audio_data:
            raise ValueError("Audio data must be a dictionary with 'array' and 'sampling_rate' keys")

        result = model.transcribe(audio_data['array'])
            
        return result["text"]
    except Exception as e:
        logger.error(f"Transcription error: {str(e)}")
        raise

def process_audio_with_segmentation(audio_data, duration_seconds):
    """
    Process audio with automatic model selection and segmentation based on duration
    
    Args:
        audio_data: Dictionary with 'array' and 'sampling_rate' keys
        duration_seconds: Duration of the audio in seconds
        
    Returns:
        Dict with transcriptions, model used, segments used
    """
    # Select model based on duration
    if duration_seconds < 120:  # < 2 minutes
        model_name = "base.en"
    else:  # >= 2 minutes
        model_name = "tiny.en"
    
    # Determine segmentation based on duration
    if duration_seconds < 60:  # < 1 minute
        num_segments = 1
    elif duration_seconds < 120:  # 1-2 minutes
        num_segments = 2
    elif duration_seconds < 300:  # 2-5 minutes
        num_segments = 3
    else:  # > 5 minutes
        num_segments = 5
    
    logger.info(f"Processing audio: {duration_seconds:.2f}s, model: {model_name}, segments: {num_segments}")
    
    # Process audio in segments
    transcriptions = []
    
    if num_segments == 1:
        # Single segment processing
        text = transcribe_audio(audio_data, model_name)
        if not text or text.strip() == "":
            logger.warning("Whisper returned empty transcription")
            text = "[No speech detected]"
        transcriptions.append(text)
    else:
        # Multi-segment processing
        array = audio_data["array"]
        sample_rate = audio_data["sampling_rate"]
        segment_length = len(array) // num_segments
        overlap_samples = int(1.0 * sample_rate)  # 1 second overlap
        
        for i in range(num_segments):
            start_idx = max(0, i * segment_length - overlap_samples)
            end_idx = min(len(array), (i + 1) * segment_length + overlap_samples)
            
            segment_array = array[start_idx:end_idx]
            segment_data = {
                "array": segment_array,
                "sampling_rate": sample_rate
            }
            
            segment_start_time = time.time()
            text = transcribe_audio(segment_data, model_name)
            segment_time = time.time() - segment_start_time
            
            if not text or text.strip() == "":
                logger.warning(f"Whisper returned empty transcription for segment {i+1}")
                text = "[No speech detected]"
                
            logger.info(f"Segment {i+1}/{num_segments} transcription time: {segment_time:.2f}s")
            transcriptions.append(text)
    
    # Validate final result
    if all(t == "[No speech detected]" for t in transcriptions):
        logger.warning("All segments returned empty transcriptions")
        
    return {
        "transcriptions": transcriptions,
        "model_used": model_name,
        "segments_used": num_segments
    }

