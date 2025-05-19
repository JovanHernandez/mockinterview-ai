from fastapi import APIRouter
from .rate import router as rate_router
from .questions import router as questions_router
from .summary import router as summary_router
from .transcribe import router as transcribe_router

router = APIRouter()

router.include_router(rate_router, tags=["rate"])
router.include_router(questions_router, tags=["questions"])
router.include_router(summary_router, tags=["summary"])
router.include_router(transcribe_router, tags=["transcribe"])


