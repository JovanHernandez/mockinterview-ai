from pydantic import BaseModel
from typing import List

class JobDescriptionRequest(BaseModel):
    job_description: str

class QuestionsResponse(BaseModel):
    questions: List[str]
    summarized_job: str = ""
    summarized_background: str = ""  # Add this new field

class QuestionGenerationRequest(BaseModel):
    job_title: str = ""
    job_description: str = ""
    background: str = ""
    interview_type: str = "mixed"
    num_questions: int = 10

class TranscriptionRequest(BaseModel):
    question: str
    # Note: The audio file will be handled separately via Form/File

class EvaluationResult(BaseModel):
    rating: int
    explanation: str
    suggestions: str

class TranscriptionResponse(BaseModel):
    question: str
    answer: str
    evaluation: EvaluationResult

class FeedbackItem(BaseModel):
    rating: int
    explanation: str
    suggestions: str

class SummarizeRequest(BaseModel):
    feedback: List[FeedbackItem]

class SummarizeResponse(BaseModel):
    score_percentage: float
    strengths: List[str]
    areas_for_improvement: List[str]




