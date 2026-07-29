from __future__ import annotations

from datetime import date

from sqlalchemy import select

from app.database import SessionLocal
from app.models import SupportProgram


# 정리 원칙
# 1) support_amount는 "개별 사업자가 받을 수 있는 최대 금액"으로 저장
# 2) 무료, 사업별 상이, 투자 매칭, 전체 사업예산만 제시된 경우 0으로 저장
# 3) 종료일이 "예산 소진 시" 또는 "세부공고 참조"이면 None
# 4) "2026-01 ~"처럼 월만 있는 경우 해당 월 1일로 정규화
# 5) 이 파일은 제목(title)을 기준으로 upsert하므로 여러 번 실행해도 중복 생성되지 않음

PROGRAMS = [
    {
        "title": "2026년 중소벤처기업부 소상공인 지원사업 통합 공고",
        "organization_name": "중소벤처기업부",
        "region_name": "전국",
        "target_industry": "전 업종",
        "support_type": "바우처·융자·사업화",
        "support_amount": 100_000_000,
        "application_start_date": date(2026, 1, 5),
        "application_end_date": None,
        "description": "7개 분야 26개 사업을 포함한 통합 공고입니다. 총사업 규모는 약 1조 3,410억 원이며, 세부 사업별 지원 조건·금액·마감일이 다릅니다. support_amount에는 안내된 최대 지원액 1억 원을 저장했습니다.",
        "source_url": "https://www.mss.go.kr",
    },
    {
        "title": "2026년 중소벤처기업부 소상공인 정책자금 융자사업 공고",
        "organization_name": "중소벤처기업부",
        "region_name": "전국",
        "target_industry": "전 업종",
        "support_type": "정책자금 융자",
        "support_amount": 500_000_000,
        "application_start_date": date(2026, 1, 5),
        "application_end_date": None,
        "description": "일반·특별·긴급 경영안정자금, 대환대출, 재도전특별자금 등을 지원합니다. 지원 한도는 사업별로 약 3천만 원부터 최대 5억 원까지이며 예산 소진 시 종료될 수 있습니다.",
        "source_url": "https://ols.semas.or.kr",
    },
    {
        "title": "소상공인 경영안정 바우처 지원사업",
        "organization_name": "중소벤처기업부",
        "region_name": "전국",
        "target_industry": "전 업종",
        "support_type": "바우처",
        "support_amount": 250_000,
        "application_start_date": date(2026, 2, 9),
        "application_end_date": date(2026, 12, 18),
        "description": "전기·가스·수도요금, 4대 보험료, 연료비 등 경영 고정비 부담 완화를 위한 바우처를 1개사당 최대 25만 원 지원합니다.",
        "source_url": "https://소상공인경영안정바우처.kr",
    },
    {
        "title": "2026년 희망리턴패키지 재기사업화 소상공인 모집공고",
        "organization_name": "소상공인시장진흥공단",
        "region_name": "전국",
        "target_industry": "전 업종",
        "support_type": "재기지원",
        "support_amount": 20_000_000,
        "application_start_date": date(2026, 1, 30),
        "application_end_date": date(2026, 2, 27),
        "description": "폐업 또는 폐업 예정 소상공인의 재창업과 사업화를 지원합니다. 사업화 자금은 최대 2,000만 원이며 자부담 조건이 적용될 수 있습니다. 점포 철거비는 별도 기준에 따라 최대 600만 원까지 지원될 수 있습니다.",
        "source_url": "https://www.sbiz24.kr",
    },
    {
        "title": "2026년 소상공인 도약 지원 사업",
        "organization_name": "소상공인시장진흥공단",
        "region_name": "전국",
        "target_industry": "전 업종",
        "support_type": "사업화·멘토링",
        "support_amount": 100_000_000,
        "application_start_date": date(2026, 4, 1),
        "application_end_date": date(2026, 4, 24),
        "description": "로컬크리에이터와 성장 가능성이 높은 소상공인을 대상으로 사업화 자금, 멘토링 및 성장 프로그램을 지원합니다. 세부 유형에 따라 최대 1억 원까지 지원될 수 있습니다.",
        "source_url": "https://www.sbiz24.kr",
    },
    {
        "title": "2026년 스마트상점 기술보급사업",
        "organization_name": "소상공인시장진흥공단",
        "region_name": "전국",
        "target_industry": "소매·서비스업",
        "support_type": "스마트기술 도입",
        "support_amount": 7_000_000,
        "application_start_date": date(2026, 3, 13),
        "application_end_date": date(2026, 4, 1),
        "description": "키오스크, 테이블오더, 서빙로봇 등 매장 운영에 필요한 스마트기술 도입 비용을 지원합니다. 국비 지원 한도는 최대 700만 원으로 정리했습니다.",
        "source_url": "https://www.sbiz.or.kr/smst",
    },
    {
        "title": "2026년 소상공인 온라인판로 지원사업",
        "organization_name": "한국중소벤처기업유통원",
        "region_name": "전국",
        "target_industry": "전 업종",
        "support_type": "온라인 판로개척",
        "support_amount": 0,
        "application_start_date": date(2026, 3, 12),
        "application_end_date": None,
        "description": "상품 개선, 상세페이지 제작, 온라인 쇼핑몰 입점·판매 및 라이브커머스 등을 지원합니다. 세부 사업별 지원금이 달라 support_amount는 0으로 저장했습니다.",
        "source_url": "https://fanfandaero.kr",
    },
    {
        "title": "2026년 혁신 소상공인 창업지원",
        "organization_name": "소상공인시장진흥공단",
        "region_name": "전국",
        "target_industry": "전 업종",
        "support_type": "예비창업 지원",
        "support_amount": 0,
        "application_start_date": date(2026, 1, 1),
        "application_end_date": None,
        "description": "예비창업자를 선발해 창업교육과 사업화 자금을 지원하는 사업입니다. 구체적인 개인별 지원금과 마감일은 세부 공고를 확인해야 하므로 support_amount는 0, 종료일은 null로 저장했습니다.",
        "source_url": "https://www.sbiz24.kr",
    },
    {
        "title": "2026년 로컬 크리에이터 육성",
        "organization_name": "소상공인시장진흥공단",
        "region_name": "전국",
        "target_industry": "지역특화 업종",
        "support_type": "지역상권 활성화",
        "support_amount": 0,
        "application_start_date": date(2026, 1, 1),
        "application_end_date": None,
        "description": "지역 자원을 기반으로 한 소상공인의 브랜드 개발, 사업화 및 판로 확대를 지원합니다. 지원금과 마감일은 세부 공고별로 달라 0과 null로 저장했습니다.",
        "source_url": "https://www.sbiz24.kr",
    },
    {
        "title": "2026년 로컬브랜드 창출",
        "organization_name": "소상공인시장진흥공단",
        "region_name": "전국",
        "target_industry": "지역특화 업종",
        "support_type": "지역상권 활성화",
        "support_amount": 0,
        "application_start_date": date(2026, 1, 1),
        "application_end_date": None,
        "description": "지역 특화 브랜드 개발과 공동 마케팅 등을 지원합니다. 개인별 지원금과 종료일이 명확하지 않아 support_amount는 0, 종료일은 null로 저장했습니다.",
        "source_url": "https://www.sbiz24.kr",
    },
    {
        "title": "2026년 강한 소상공인 성장지원",
        "organization_name": "소상공인시장진흥공단",
        "region_name": "전국",
        "target_industry": "전 업종",
        "support_type": "성장 지원",
        "support_amount": 0,
        "application_start_date": date(2026, 4, 1),
        "application_end_date": date(2026, 4, 24),
        "description": "오디션 방식으로 성장 가능성이 높은 소상공인을 선발해 사업화와 성장 프로그램을 지원합니다. 제시된 231.4억 원은 전체 사업 규모이므로 개별 지원금 대신 0으로 저장했습니다.",
        "source_url": "https://www.sbiz24.kr",
    },
    {
        "title": "2026년 우리동네 크라우드 펀딩",
        "organization_name": "소상공인시장진흥공단",
        "region_name": "전국",
        "target_industry": "전 업종",
        "support_type": "크라우드펀딩",
        "support_amount": 0,
        "application_start_date": date(2026, 1, 1),
        "application_end_date": None,
        "description": "지역 기반 크라우드펀딩 플랫폼과 연계하고 펀딩 성공 시 발생하는 수수료 등을 지원합니다. 정액 지원금이 아니므로 support_amount는 0으로 저장했습니다.",
        "source_url": "https://www.sbiz24.kr",
    },
    {
        "title": "2026년 혁신 소상공인 투자연계",
        "organization_name": "소상공인시장진흥공단",
        "region_name": "전국",
        "target_industry": "전 업종",
        "support_type": "투자연계",
        "support_amount": 0,
        "application_start_date": date(2026, 1, 1),
        "application_end_date": None,
        "description": "민간 투자기관과 연계해 유망 소상공인의 투자 유치를 지원합니다. 정해진 현금 지원 한도가 아니라 투자 매칭 방식이므로 support_amount는 0으로 저장했습니다.",
        "source_url": "https://www.sbiz24.kr",
    },
    {
        "title": "2026년 글로벌 소상공인 육성",
        "organization_name": "소상공인시장진흥공단",
        "region_name": "전국",
        "target_industry": "수출 가능 업종",
        "support_type": "수출 지원",
        "support_amount": 0,
        "application_start_date": date(2026, 1, 1),
        "application_end_date": None,
        "description": "수출형 브랜드 전환, 제품 개발, 패키징 및 디자인 등을 지원합니다. 제시된 95.2억 원은 전체 사업 규모이므로 개별 지원금은 0으로 저장했습니다.",
        "source_url": "https://www.sbiz24.kr",
    },
    {
        "title": "2026년 혁신 소상공인 AI 활용 지원",
        "organization_name": "소상공인시장진흥공단",
        "region_name": "전국",
        "target_industry": "전 업종",
        "support_type": "AI·디지털 전환",
        "support_amount": 0,
        "application_start_date": date(2026, 1, 1),
        "application_end_date": None,
        "description": "AI를 활용한 제품·서비스 개발, 비용 절감 및 업무 효율화를 지원합니다. 제시된 143.6억 원은 전체 사업 규모이므로 개별 지원금은 0으로 저장했습니다.",
        "source_url": "https://www.sbiz24.kr",
    },
    {
        "title": "2026년 백년소상공인 육성",
        "organization_name": "소상공인시장진흥공단",
        "region_name": "전국",
        "target_industry": "전 업종",
        "support_type": "장기경영 지원",
        "support_amount": 0,
        "application_start_date": date(2026, 2, 5),
        "application_end_date": date(2026, 3, 10),
        "description": "백년가게와 백년소공인을 신규 지정하고 장기 경영, 홍보 및 판로 확대 등을 지원합니다. 세부 지원금이 사업별로 달라 support_amount는 0으로 저장했습니다.",
        "source_url": "https://www.sbiz24.kr",
    },
    {
        "title": "2026년 소상공인 온·오프라인 교육",
        "organization_name": "소상공인시장진흥공단",
        "region_name": "전국",
        "target_industry": "전 업종",
        "support_type": "교육",
        "support_amount": 0,
        "application_start_date": date(2026, 1, 1),
        "application_end_date": date(2026, 12, 31),
        "description": "소상공인의 경영 역량 강화를 위한 온·오프라인 교육 프로그램을 무료로 제공합니다. 무료 사업이므로 support_amount는 0으로 저장했습니다.",
        "source_url": "https://www.sbiz24.kr",
    },
    {
        "title": "2026년 소상공인 고용보험료 지원",
        "organization_name": "근로복지공단",
        "region_name": "전국",
        "target_industry": "전 업종",
        "support_type": "고용지원",
        "support_amount": 0,
        "application_start_date": date(2026, 1, 1),
        "application_end_date": None,
        "description": "소상공인의 고용 부담 완화를 위해 고용보험료 일부를 지원합니다. 보험료와 지원율에 따라 금액이 달라 support_amount는 0으로 저장했으며 예산 소진 시 종료될 수 있습니다.",
        "source_url": "https://www.work24.go.kr",
    },
    {
        "title": "2026년 희망리턴패키지 원스톱폐업지원",
        "organization_name": "소상공인시장진흥공단",
        "region_name": "전국",
        "target_industry": "전 업종",
        "support_type": "폐업지원",
        "support_amount": 6_000_000,
        "application_start_date": date(2026, 1, 27),
        "application_end_date": None,
        "description": "폐업 절차 상담, 점포 철거 및 재기 연계를 원스톱으로 지원합니다. 점포 철거비 기준 최대 600만 원을 support_amount에 저장했습니다.",
        "source_url": "https://www.sbiz24.kr",
    },
    {
        "title": "2026년 소상공인 재기사업화 지원",
        "organization_name": "소상공인시장진흥공단",
        "region_name": "전국",
        "target_industry": "전 업종",
        "support_type": "재기지원",
        "support_amount": 20_000_000,
        "application_start_date": date(2026, 1, 30),
        "application_end_date": date(2026, 2, 27),
        "description": "폐업 소상공인의 재창업과 사업화를 지원하며 최대 2,000만 원의 사업화 자금을 지원합니다. 자부담 조건이 적용될 수 있습니다.",
        "source_url": "https://www.sbiz24.kr",
    },
    {
        "title": "2026년 소공인 특화 지원 - 스마트제조",
        "organization_name": "소상공인시장진흥공단",
        "region_name": "전국",
        "target_industry": "제조업",
        "support_type": "스마트제조",
        "support_amount": 0,
        "application_start_date": date(2026, 3, 1),
        "application_end_date": None,
        "description": "소공인의 스마트제조 설비 도입과 생산 공정 개선을 지원합니다. 세부 지원금과 마감일은 개별 공고를 확인해야 하므로 0과 null로 저장했습니다.",
        "source_url": "https://www.sbiz24.kr",
    },
    {
        "title": "2026년 소공인 특화 지원 - 클린제조",
        "organization_name": "소상공인시장진흥공단",
        "region_name": "전국",
        "target_industry": "제조업",
        "support_type": "클린제조",
        "support_amount": 0,
        "application_start_date": date(2026, 3, 1),
        "application_end_date": None,
        "description": "소공인 작업장의 안전성과 쾌적성을 높이기 위한 클린제조 환경 개선을 지원합니다. 세부 지원금과 마감일은 개별 공고를 확인해야 합니다.",
        "source_url": "https://www.sbiz24.kr",
    },
    {
        "title": "2026년 소공인 특화 지원 - 판로개척",
        "organization_name": "소상공인시장진흥공단",
        "region_name": "전국",
        "target_industry": "제조업",
        "support_type": "판로개척",
        "support_amount": 0,
        "application_start_date": date(2026, 3, 1),
        "application_end_date": None,
        "description": "소공인의 국내외 판로개척, 홍보 및 마케팅 활동을 지원합니다. 세부 지원금과 마감일은 개별 공고를 확인해야 합니다.",
        "source_url": "https://www.sbiz24.kr",
    },
    {
        "title": "2026년 글로컬 상권 조성",
        "organization_name": "소상공인시장진흥공단",
        "region_name": "전국",
        "target_industry": "지역상권",
        "support_type": "상권 활성화",
        "support_amount": 0,
        "application_start_date": date(2026, 3, 1),
        "application_end_date": None,
        "description": "지역 관광·문화 자원과 연계한 상권 활성화를 지원합니다. 상권별 지원 규모와 일정이 달라 support_amount는 0, 종료일은 null로 저장했습니다.",
        "source_url": "https://www.sbiz24.kr",
    },
    {
        "title": "2026년 로컬거점 상권 지원",
        "organization_name": "소상공인시장진흥공단",
        "region_name": "전국",
        "target_industry": "지역상권",
        "support_type": "상권 활성화",
        "support_amount": 0,
        "application_start_date": date(2026, 3, 1),
        "application_end_date": None,
        "description": "지역 특화산업 및 제조업과 연계한 거점 상권 육성을 지원합니다. 상권별 지원 규모와 마감일이 달라 0과 null로 저장했습니다.",
        "source_url": "https://www.sbiz24.kr",
    },
    {
        "title": "2026년 유망 골목상권 지원",
        "organization_name": "소상공인시장진흥공단",
        "region_name": "전국",
        "target_industry": "지역상권",
        "support_type": "상권 활성화",
        "support_amount": 0,
        "application_start_date": date(2026, 3, 1),
        "application_end_date": None,
        "description": "골목상권의 조직화, 협업과 역량 강화를 지원합니다. 상권별 지원금과 종료일은 세부 공고에 따라 달라 0과 null로 저장했습니다.",
        "source_url": "https://www.sbiz24.kr",
    },
    {
        "title": "2026년 소상공인 온누리상품권 발행",
        "organization_name": "소상공인시장진흥공단",
        "region_name": "전국",
        "target_industry": "전통시장·골목상권",
        "support_type": "소비활성화",
        "support_amount": 0,
        "application_start_date": date(2026, 1, 1),
        "application_end_date": date(2026, 12, 31),
        "description": "전통시장과 골목상권의 소비 및 매출 기반 강화를 위한 온누리상품권 발행 사업입니다. 5조 5,000억 원은 전체 발행 규모이며 개별 사업자 지원금이 아니므로 0으로 저장했습니다.",
        "source_url": "https://www.sbiz24.kr",
    },
    {
        "title": "2026년 소상공인 대환대출 지원",
        "organization_name": "소상공인시장진흥공단",
        "region_name": "전국",
        "target_industry": "전 업종",
        "support_type": "대환대출",
        "support_amount": 50_000_000,
        "application_start_date": date(2026, 1, 5),
        "application_end_date": None,
        "description": "고금리 대출을 정책자금으로 대환하도록 지원합니다. 최대 5,000만 원 한도로 정리했으며 예산 소진 시 종료될 수 있습니다.",
        "source_url": "https://ols.semas.or.kr",
    },
    {
        "title": "2026년 소상공인 장애인기업지원자금",
        "organization_name": "소상공인시장진흥공단",
        "region_name": "전국",
        "target_industry": "전 업종",
        "support_type": "장애인기업 지원",
        "support_amount": 100_000_000,
        "application_start_date": date(2026, 1, 5),
        "application_end_date": None,
        "description": "장애인 사업주가 운영하는 소상공인을 대상으로 저금리 정책자금을 지원합니다. 최대 1억 원 한도로 정리했으며 실제 금리와 조건은 공고를 확인해야 합니다.",
        "source_url": "https://ols.semas.or.kr",
    },
    {
        "title": "2026년 소상공인 청년고용연계자금",
        "organization_name": "소상공인시장진흥공단",
        "region_name": "전국",
        "target_industry": "전 업종",
        "support_type": "청년고용 지원",
        "support_amount": 70_000_000,
        "application_start_date": date(2026, 1, 5),
        "application_end_date": None,
        "description": "청년을 고용하거나 청년 고용 창출에 기여하는 소상공인을 위한 저금리 정책자금입니다. 최대 7,000만 원 한도로 정리했으며 예산 소진 시 종료될 수 있습니다.",
        "source_url": "https://ols.semas.or.kr",
    },
]


def upsert_support_programs() -> None:
    db = SessionLocal()
    created_count = 0
    updated_count = 0

    try:
        for data in PROGRAMS:
            existing = db.scalar(
                select(SupportProgram).where(
                    SupportProgram.title == data["title"]
                )
            )

            if existing is None:
                db.add(SupportProgram(**data))
                created_count += 1
                continue

            for field, value in data.items():
                setattr(existing, field, value)
            updated_count += 1

        db.commit()
        print(
            f"지원사업 반영 완료: 신규 {created_count}건, "
            f"수정 {updated_count}건, 총 {len(PROGRAMS)}건"
        )

    except Exception as error:
        db.rollback()
        print(f"지원사업 반영 실패: {error}")
        raise

    finally:
        db.close()


if __name__ == "__main__":
    upsert_support_programs()
