from typing import Dict, Any

class InsightSerializer:
    @staticmethod
    def serialize(raw_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validates and normalizes the Gemini output.
        Ensures every response matches the target schema.
        """
        if not raw_data or not isinstance(raw_data, dict):
            return {
                "summary": "Insights unavailable.",
                "key_findings": [],
                "recommendations": [],
                "limitations": []
            }
            
        summary = raw_data.get("summary", "")
        if not isinstance(summary, str):
            summary = str(summary)
            
        key_findings = raw_data.get("key_findings", [])
        if not isinstance(key_findings, list):
            key_findings = [str(key_findings)]
            
        recommendations = raw_data.get("recommendations", [])
        if not isinstance(recommendations, list):
            recommendations = [str(recommendations)]
            
        limitations = raw_data.get("limitations", [])
        if not isinstance(limitations, list):
            limitations = [str(limitations)]
            
        return {
            "summary": summary,
            "key_findings": [str(k) for k in key_findings if k],
            "recommendations": [str(r) for r in recommendations if r],
            "limitations": [str(l) for l in limitations if l]
        }
