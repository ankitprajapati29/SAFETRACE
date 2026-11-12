
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.rule_engine import analyze_message as run_analysis

router = APIRouter(prefix="/api", tags=["Analysis"])


class AnalyzeRequest(BaseModel):
    message: str = Field(min_length=1, max_length=10000)


class AnalyzeResponse(BaseModel):
    analysis: str


@router.post("/analyze", response_model=AnalyzeResponse)
def analyze_message(request: AnalyzeRequest):
    message = request.message.strip()

    if not message:
        raise HTTPException(
            status_code=400,
            detail="Please provide a non-empty message.",
        )

    try:
        result = run_analysis(message)

        if not result.get("success"):
            raise HTTPException(
                status_code=400,
                detail=result.get("message", "Unable to analyze message."),
            )

        threats = result.get("detected_threats", [])
        recommendations = result.get("recommendations", [])

        threat_text = (
            "\n".join(
                f"- {threat['category']}: {threat['description']}"
                for threat in threats
            )
            if threats
            else "No known fraud indicators detected."
        )

        recommendation_text = (
            "\n".join(f"- {item}" for item in recommendations)
            if recommendations
            else "- Verify suspicious messages independently."
        )

        analysis = (
            f"SAFETRACE Analysis\n"
            f"Risk Score: {result['risk_score']}/100\n"
            f"Risk Level: {result['risk_level']}\n\n"
            f"Detected Threats:\n{threat_text}\n\n"
            f"Recommendations:\n{recommendation_text}"
        )

        return AnalyzeResponse(analysis=analysis)

    except HTTPException:
        raise
    except Exception as exc:
        print(f"Analysis failed: {type(exc).__name__}: {exc}")
        raise HTTPException(
            status_code=500,
            detail="Message analysis failed. Please try again.",
        ) from exc
