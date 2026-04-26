from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

try:
    from backend.config import get_settings
    from backend.routers.brief import router as brief_router
    from backend.routers.globe import router as globe_router
    from backend.routers.internal import router as internal_router
    from backend.routers.pivot import router as pivot_router
except ModuleNotFoundError:
    from config import get_settings
    from routers.brief import router as brief_router
    from routers.globe import router as globe_router
    from routers.internal import router as internal_router
    from routers.pivot import router as pivot_router

settings = get_settings()
app = FastAPI(title="Vigil API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin] if settings.frontend_origin != "*" else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(globe_router)
app.include_router(brief_router)
app.include_router(internal_router)
app.include_router(pivot_router)


@app.get("/health")
async def health():
    return {"status": "ok"}
