import Image from "next/image";
import Link from "next/link";
import { supportPrograms } from "@/data/supportPrograms";

const filters = [
  { label: "지역", icon: "/figma-assets/list-location.svg" },
  { label: "업종", icon: "/figma-assets/list-building.svg" },
  { label: "지원분야", icon: "/figma-assets/list-filter.svg" },
  { label: "정렬", icon: "/figma-assets/list-sort.svg" },
];

export default function SupportProgramListPage() {
  const renderProgramCard = (program: (typeof supportPrograms)[number]) => {
    const cardContent = (
      <>
        {program.featured ? <span className="list-ai-badge">AI 추천</span> : null}
        <div className="program-card-body">
          <div className="program-card-copy">
            <h2>{program.title}</h2>
            <div className="list-tag-row">
              {program.tags.map((tag) => (
                <span className={`list-tag ${tag.tone}`} key={tag.label}>
                  {tag.label}
                </span>
              ))}
            </div>
            <div className={`list-metrics ${program.featured ? "featured" : ""}`}>
              <div>
                <span>지원금</span>
                <strong>{program.supportAmountLabel}</strong>
              </div>
              <div>
                <span>예상금리</span>
                <strong>{program.estimatedRateLabel ?? "-"}</strong>
              </div>
              <div>
                <span>신청마감</span>
                <strong className="deadline">{program.deadlineLabel}</strong>
              </div>
            </div>
          </div>
          <div className={`program-character ${program.imageTone}`} aria-hidden="true">
            <Image src={program.imageSrc} alt="" fill sizes="96px" />
          </div>
        </div>
      </>
    );

    return (
      <Link
        href={`/support-programs/${program.slug}`}
        className={`program-list-card ${program.featured ? "featured" : ""}`}
        key={program.title}
        aria-label={`${program.title} 상세 보기`}
      >
        {cardContent}
      </Link>
    );
  };

  return (
    <main className="landing">
      <div className="mobile-screen program-list-screen">
        <header className="program-list-header">
          <div className="program-list-header-left">
            <Link href="/service" className="icon-button" aria-label="이전 화면으로 이동">
              <Image src="/figma-assets/list-back.svg" alt="" width={24} height={24} />
            </Link>
            <h1>KB BizMate AI</h1>
          </div>
          <div className="program-list-header-actions">
            <button className="icon-button" type="button" aria-label="검색">
              <Image src="/figma-assets/list-search.svg" alt="" width={24} height={24} />
            </button>
            <Link href="/" className="icon-button" aria-label="홈으로 이동">
              <Image src="/figma-assets/list-home.svg" alt="" width={24} height={24} />
            </Link>
            <button className="icon-button" type="button" aria-label="메뉴 열기">
              <Image src="/figma-assets/list-menu.svg" alt="" width={24} height={24} />
            </button>
          </div>
        </header>

        <div className="program-list-content">
          <section className="list-summary-card" aria-label="추천 결과 요약">
            <Image src="/figma-assets/list-bulb.svg" alt="" width={28} height={32} />
            <div>
              <p>사업장 조건에 맞는</p>
              <strong>
                총 <span>7개</span>의 지원사업을 추천했어요.
              </strong>
            </div>
          </section>

          <section className="peer-summary-card" aria-label="비슷한 조건 사업자 신청 현황">
            <div>
              <Image src="/figma-assets/list-bulb.svg" alt="" width={28} height={32} />
              <p>
                비슷한 조건의 사업자는
                <br />
                어떤 지원사업을 신청했나요?
              </p>
            </div>
            <Link href="/support-programs/peer-analysis">보러가기</Link>
          </section>

          <nav className="filter-bar" aria-label="지원사업 필터">
            {filters.map((filter) => (
              <button type="button" key={filter.label}>
                <Image src={filter.icon} alt="" width={16} height={16} />
                {filter.label}
                <Image src="/figma-assets/peer-chevron-down.svg" alt="" width={12} height={12} />
              </button>
            ))}
          </nav>

          <section className="program-card-list" aria-label="추천 지원사업 목록">
            {supportPrograms.map((program) => renderProgramCard(program))}
          </section>

          <section className="list-interest-banner" aria-label="관심사업 알림">
            <div>
              <span>
                <Image src="/figma-assets/list-star.svg" alt="" width={16} height={16} />
              </span>
              <p>
                관심사업 등록하면
                <br />
                신청 마감 전에 알림을 보내드려요.
              </p>
            </div>
            <Link href="/interest">알림 설정</Link>
          </section>
        </div>
      </div>
    </main>
  );
}
