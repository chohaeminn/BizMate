from fastapi import FastAPI
from sqlalchemy import text

from app import models
from app.database import Base, engine
from app.routers import funding_requests, tax_schedules
from app.routers.ai import router as ai_router
from app.routers.portfolios import router as portfolios_router
from app.routers.profiles import router as profiles_router
from app.routers.recommendations import router as recommendations_router
from app.routers.support_programs import router as support_programs_router


# models.py에 정의됐지만 DB에 없는 테이블 생성
Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="BizMate API",
    description="소상공인 지원사업 및 절세 정보 서비스",
    version="0.1.0",
)


app.include_router(profiles_router)
app.include_router(support_programs_router)
app.include_router(recommendations_router)
app.include_router(funding_requests.router)
app.include_router(portfolios_router)
app.include_router(tax_schedules.router)
app.include_router(ai_router)


@app.get("/")
def root():
    return {
        "service": "BizMate",
        "message": "서버가 정상적으로 실행 중입니다.",
    }


@app.get("/health/db")
def database_health():
    try:
        with engine.connect() as connection:
            database_name = connection.execute(
                text("SELECT current_database()")
            ).scalar_one()

        return {
            "status": "connected",
            "database": database_name,
        }

    except Exception as error:
        return {
            "status": "error",
            "detail": str(error),
        }
