import os
import numpy as np
import ffmpeg
import logging
from typing import Union, Dict, List, Optional, Tuple, BinaryIO
import io
import tempfile

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def convert_to_wav(audio_content: bytes) -> Dict[str, Union[np.ndarray, int]]:
    """
    Convert audio content to WAV format in memory
    
    Args:
        audio_content: Raw bytes of the audio file
    
    Returns:
        Dict with 'array' (numpy array) and 'sampling_rate' (16000)
    """
    try:
        # Validate input
        if len(audio_content) < 1000:  # Arbitrary small size check
            raise ValueError(f"Audio content is too small ({len(audio_content)} bytes), possibly corrupted")
        
        logger.info(f"Processing audio content of size: {len(audio_content)} bytes")
        
        # Create a temporary file for input
        # This is necessary because some audio formats can't be reliably processed through pipes
        with tempfile.NamedTemporaryFile(delete=False, suffix='.webm') as temp_in:
            temp_in.write(audio_content)
            temp_in_path = temp_in.name
        
        try:
            # Use ffmpeg with file input but pipe output
            out, err = (
                ffmpeg
                .input(temp_in_path)
                .output('pipe:', format='wav', acodec='pcm_s16le', ac=1, ar=16000)
                .run(capture_stdout=True, capture_stderr=True)
            )
            
            # Log ffmpeg output for debugging
            logger.debug(f"FFmpeg stderr: {err.decode('utf-8', errors='replace')}")
            
            # Verify output size
            if len(out) < 44:  # WAV header is 44 bytes
                logger.error(f"FFmpeg produced invalid output (size: {len(out)} bytes)")
                raise ValueError("FFmpeg produced invalid output, possibly due to unsupported audio format")
                
            # Convert to numpy array (skip the 44-byte WAV header)
            audio_array = np.frombuffer(out[44:], np.int16).astype(np.float32) / 32768.0
            
            # Validate array size
            if len(audio_array) < 16000:  # At least 1 second of audio at 16kHz
                logger.warning(f"Audio array suspiciously small: {len(audio_array)} samples, expected at least 16000")
                if len(audio_array) < 100:  # Arbitrary threshold for "too small"
                    raise ValueError(f"Converted audio is too short ({len(audio_array)} samples), possibly corrupted")
            
            duration_seconds = len(audio_array) / 16000
            logger.info(f"Successfully converted audio to numpy array, shape: {audio_array.shape}, duration: {duration_seconds:.2f}s")
            
            return {
                "array": audio_array,
                "sampling_rate": 16000
            }
        finally:
            # Clean up the temporary file
            if os.path.exists(temp_in_path):
                os.unlink(temp_in_path)
                
    except ffmpeg.Error as e:
        stderr = e.stderr.decode('utf-8', errors='replace')
        logger.error(f"FFmpeg error: {stderr}")
        raise ValueError(f"FFmpeg conversion failed: {stderr}")
    except Exception as e:
        logger.error(f"Failed to process audio: {str(e)}")
        raise ValueError(f"Failed to process audio: {str(e)}")

def analyze_audio(audio_data: Union[str, Dict[str, Union[np.ndarray, int]]]) -> Dict[str, float]:
    """
    Extract audio features for analysis
    
    Args:
        audio_data: Either a file path or a dict with 'array' and 'sampling_rate'
    
    Returns:
        Dict with audio metrics
    """
    try:
        from pyAudioAnalysis import audioBasicIO, ShortTermFeatures
        
        if isinstance(audio_data, dict):
            # Already have numpy array
            x = audio_data["array"]
            Fs = audio_data["sampling_rate"]
        else:
            # Load from file path
            Fs, x = audioBasicIO.read_audio_file(audio_data)
            x = x.astype(float)
            if x.ndim > 1:
                x = x.mean(axis=1)  # Convert to mono if stereo
        
        if x is None or len(x) == 0:
            raise Exception("Failed to read audio data or empty data.")

        features, _ = ShortTermFeatures.feature_extraction(x, Fs, int(0.05 * Fs), int(0.025 * Fs))
        avg_energy = float(np.mean(features[1]))  # Energy
        silence_ratio = float(np.mean(features[0] < 0.01))  # Zero Crossing Rate threshold
        
        return {
            "energy": avg_energy,
            "silence_ratio": silence_ratio
        }
    except Exception as e:
        logger.error(f"Audio analysis error: {str(e)}")
        raise

def cleanup_files(files: List[str]) -> None:
    """Clean up temporary files if they exist"""
    for file_path in files:
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                logger.debug(f"Removed temporary file: {file_path}")
        except Exception as e:
            logger.warning(f"Failed to remove file {file_path}: {str(e)}")


