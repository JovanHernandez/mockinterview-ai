from fastapi import APIRouter, HTTPException
from ...models.schemas import SummarizeRequest, SummarizeResponse
from ...services import evaluation

router = APIRouter()

@router.post("/summarize", response_model=SummarizeResponse)
async def summarize_feedback(request: SummarizeRequest):
    try:
        if not request.feedback or len(request.feedback) == 0:
            raise HTTPException(status_code=400, detail="No feedback items provided")
            
        summary = evaluation.summarize_feedback(request.feedback)
        return summary
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))