import csv
from datetime import datetime
from pathlib import Path

from app.database import Base, SessionLocal, engine
from app.models import TaxSchedule


CSV_PATH = Path(__file__).parent / "국세청_세무일정_20260101.csv"


def seed_tax_schedules() -> None:
    Base.metadata.create_all(bind=engine)

    if not CSV_PATH.exists():
        print(f"CSV 파일을 찾을 수 없습니다: {CSV_PATH}")
        return

    db = SessionLocal()

    inserted_count = 0
    skipped_count = 0

    try:
        with CSV_PATH.open(
            mode="r",
            encoding="cp949",
            newline="",
        ) as csv_file:
            reader = csv.DictReader(csv_file)

            for row in reader:
                title = row["세무내용"].strip()
                note = row["비고"].strip() or None
                schedule_date_text = row["세무일정(년월일)"].strip()

                schedule_date = datetime.strptime(
                    schedule_date_text,
                    "%Y-%m-%d",
                ).date()

                existing_schedule = (
                    db.query(TaxSchedule)
                    .filter(
                        TaxSchedule.title == title,
                        TaxSchedule.schedule_date == schedule_date,
                    )
                    .first()
                )

                if existing_schedule is not None:
                    skipped_count += 1
                    continue

                tax_schedule = TaxSchedule(
                    title=title,
                    note=note,
                    schedule_date=schedule_date,
                )

                db.add(tax_schedule)
                inserted_count += 1

        db.commit()

        total_count = db.query(TaxSchedule).count()

        print(f"신규 등록: {inserted_count}건")
        print(f"중복 제외: {skipped_count}건")
        print(f"전체 세무일정: {total_count}건")

    except Exception as error:
        db.rollback()
        print(f"세무일정 등록 실패: {error}")
        raise

    finally:
        db.close()


if __name__ == "__main__":
    seed_tax_schedules()