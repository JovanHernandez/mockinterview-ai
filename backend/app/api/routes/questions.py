from fastapi import APIRouter, HTTPException
from ...models.schemas import QuestionGenerationRequest, QuestionsResponse
from ...services import evaluation

router = APIRouter()

@router.post("/generate-questions", response_model=QuestionsResponse)
async def generate_questions(request: QuestionGenerationRequest):
    try:
        # Summarize job description and background if provided
        summarized_job = evaluation.summarize_job_description(request.job_description) if request.job_description else ""
        summarized_background = evaluation.summarize_background(request.background) if request.background else ""
        
        # Generate questions using the summarized content
        questions = evaluation.generate_interview_questions(
            job_title=request.job_title,
            job_description=summarized_job,
            background=summarized_background,
            interview_type=request.interview_type,
            num_questions=request.num_questions
        )
        
        # Return questions along with summarized job and background
        return {
            "questions": questions, 
            "summarized_job": summarized_job,
            "summarized_background": summarized_background
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


