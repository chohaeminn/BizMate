from fastapi import FastAPI
from sqlalchemy import text

from app.database import engine
from app.routers.profiles import router as profiles_router
from app.routers.support_programs import router as support_programs_router


app = FastAPI(
    title="BizMate API",
    description="소상공인 지원사업 및 절세 정보 서비스",
    version="0.1.0",
)


app.include_router(profiles_router)
app.include_router(support_programs_router)


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