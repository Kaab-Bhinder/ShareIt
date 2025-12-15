"""
Uploads Routes
Simple image upload handling and URL generation
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, Request, status
from typing import List
from pathlib import Path
import uuid

router = APIRouter(prefix="/api/uploads", tags=["uploads"])


ALLOWED_EXTS = {".jpg", ".jpeg", ".png", ".webp"}


def get_upload_dir() -> Path:
    # backend/app/routes/uploads.py -> parents[2] == backend/
    backend_root = Path(__file__).resolve().parents[2]
    upload_dir = backend_root / "uploads"
    upload_dir.mkdir(parents=True, exist_ok=True)
    return upload_dir


@router.get("/ping")
def ping():
    return {"status": "ok"}

@router.post("/images")
async def upload_images(request: Request, files: List[UploadFile] = File(...)):
    if not files:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No files provided")

    saved_urls: List[str] = []
    upload_dir = get_upload_dir()

    for f in files:
        suffix = Path(f.filename).suffix.lower()
        if suffix not in ALLOWED_EXTS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported file type: {suffix}. Allowed: {', '.join(sorted(ALLOWED_EXTS))}"
            )
        # Generate unique filename
        new_name = f"{uuid.uuid4().hex}{suffix}"
        dest_path = upload_dir / new_name
        # Save file
        content = await f.read()
        dest_path.write_bytes(content)

        base_url = str(request.base_url).rstrip('/')
        saved_urls.append(f"{base_url}/uploads/{new_name}")

    return {"urls": saved_urls}
