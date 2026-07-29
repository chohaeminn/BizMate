import Image from "next/image";
import Link from "next/link";
import { topRecommendedPrograms } from "@/data/supportPrograms";

const heroServices = [
  {
    title: "자금조달 포트폴리오",
    description: "맞춤형 자금 계획 수립",
    icon: "/service/service-portfolio.svg",
    tone: "blue",
  },
  {
    title: "세금 절세 서비스",
    description: "전문가와 함께 세금 절약",
    icon: "/service/service-tax.svg",
    tone: "green",
    href: "/tax-saving",
  },
];

const statusItems = [
  {
    label: "추천사업",
    value: "7",
    unit: "개",
    icon: "/service/service-recommend.svg",
    tone: "green",
  },
  {
    label: "신청마감 임박",
    value: "2",
    unit: "개",
    icon: "/service/service-deadline.svg",
    tone: "red",
  },
  {
    label: "신규등록",
    value: "1",
    unit: "개",
    badge: "NEW",
    tone: "blue",
  },
];

export default function ServicePage() {
  return (
    <main className="landing">
      <div className="mobile-screen service-screen">
        <header className="service-header">
          <div className="service-header-left">
            <Link href="/" className="icon-button" aria-label="이전 화면으로 이동">
              <Image src="/service/service-back.svg" alt="" width={24} height={24} />
            </Link>
            <h1>KB BizMate AI</h1>
          </div>
          <div className="service-header-actions">
            <Link href="/" className="icon-button" aria-label="홈으로 이동">
              <Image src="/service/service-home.svg" alt="" width={24} height={24} />
            </Link>
            <button className="icon-button" type="button" aria-label="메뉴 열기">
              <Image src="/service/service-menu.svg" alt="" width={24} height={24} />
            </button>
          </div>
        </header>

        <div className="service-content">
          <section className="service-hero-grid" aria-label="주요 서비스">
            {heroServices.map((service) => (
              <Link
                href={service.href ?? "#"}
                className={`service-hero-card ${service.tone}`}
                key={service.title}
                aria-label={`${service.title} 이동`}
              >
                <div className="service-hero-icon">
                  <Image src={service.icon} alt="" width={22} height={22} />
                </div>
                <div>
                  <h2>{service.title}</h2>
                  <p>{service.description}</p>
                </div>
              </Link>
            ))}
          </section>

          <section className="recommend-status" aria-labelledby="status-title">
            <div className="section-heading">
              <h2 id="status-title">내 추천 현황</h2>
            </div>
            <div className="status-grid">
              {statusItems.map((item) => (
                <div className="status-item" key={item.label}>
                  <div className={`status-icon ${item.tone}`}>
                    {item.icon ? (
                      <Image src={item.icon} alt="" width={24} height={24} />
                    ) : (
                      <span>{item.badge}</span>
                    )}
                  </div>
                  <p>{item.label}</p>
                  <strong>
                    {item.value}
                    <span>{item.unit}</span>
                  </strong>
                </div>
              ))}
            </div>
          </section>

          <section className="ai-recommendations" aria-labelledby="recommend-title">
            <div className="recommend-heading">
              <h2 id="recommend-title">AI 추천 맞춤 사업 TOP3</h2>
              <Link href="/support-programs" className="recommend-view-all">
                전체보기
                <Image src="/service/service-chevron.svg" alt="" width={12} height={12} />
              </Link>
            </div>

            <div className="recommend-card-list">
              {topRecommendedPrograms.map((recommendation) => (
                <Link
                  href={`/support-programs/${recommendation.slug}`}
                  className={`recommend-card ${recommendation.featured ? "featured" : ""}`}
                  key={recommendation.title}
                  aria-label={`${recommendation.title} 상세 보기`}
                >
                  {recommendation.featured ? (
                    <div className="today-badge">오늘의 추천</div>
                  ) : null}

                  <div className="recommend-main">
                    <div>
                      <h3>{recommendation.title}</h3>
                      <div className="tag-list">
                        {recommendation.tags.map((tag) => (
                          <span className={`tag ${tag.tone}`} key={tag.label}>
                            {tag.label}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className="recommend-chevron-link" aria-hidden="true">
                      <Image
                        src="/service/service-chevron.svg"
                        alt=""
                        width={18}
                        height={18}
                      />
                    </span>
                  </div>

                  <div className="recommend-metrics">
                    <div>
                      <span>지원금</span>
                      <strong>{recommendation.supportAmountLabel}</strong>
                    </div>
                    <div>
                      <span>금리(예상)</span>
                      <strong>{recommendation.estimatedRateLabel ?? "-"}</strong>
                    </div>
                    <div>
                      <span>신청마감</span>
                      <strong className="deadline">{recommendation.deadlineLabel}</strong>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className="notification-banner" aria-label="알림 설정">
            <div className="notification-copy">
              <div className="notification-icon">
                <Image src="/service/service-bell.svg" alt="" width={20} height={20} />
              </div>
              <div>
                <h2>신청 마감 전에 알려드려요!</h2>
                <p>
                  알림 설정 후 관심 사업을 등록하면
                  <br />
                  마감 전에 알림을 보내드려요.
                </p>
              </div>
            </div>
            <Link href="/interest">알림 설정</Link>
          </section>
        </div>

        <div className="home-indicator" aria-hidden="true">
          <Image
            src="/service/service-home-indicator.svg"
            alt=""
            width={128}
            height={4}
          />
        </div>
      </div>
    </main>
  );
}
