from uuid import UUID

from app.database import SessionLocal
from app.models import SupportProgram


DELETE_ID = UUID("aa1cc9e9-84b3-4f5d-a88d-bc40ca1b73de")


def delete_duplicate() -> None:
    db = SessionLocal()

    try:
        program = (
            db.query(SupportProgram)
            .filter(SupportProgram.id == DELETE_ID)
            .first()
        )

        if program is None:
            print("삭제할 지원사업을 찾지 못했습니다.")
            return

        print(f"삭제 대상: {program.title} / {program.id}")

        db.delete(program)
        db.commit()

        print("중복 데이터 삭제 완료")

    except Exception as error:
        db.rollback()
        print(f"삭제 실패: {error}")
        raise

    finally:
        db.close()


if __name__ == "__main__":
    delete_duplicate()