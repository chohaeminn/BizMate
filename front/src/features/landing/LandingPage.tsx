import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const trustBadges = [
  {
    icon: "/landing/shield.svg",
    label: "KB 데이터 보안",
  },
  {
    icon: "/landing/bolt.svg",
    label: "맞춤형 AI 분석",
  },
];

const features = [
  {
    icon: "/landing/tax.svg",
    arrow: "/landing/arrow-1.svg",
    tone: "yellow",
    title: "스마트 절세",
    description: [
      "복잡한 세무 데이터 자동 분석을 통해 사장님이",
      "놓칠 수 있는 최대 절세 혜택을 찾아드리고",
      "리스크를 사전 점검합니다.",
    ],
    action: "분석 도구 열기",
  },
  {
    icon: "/landing/loan.svg",
    arrow: "/landing/arrow-2.svg",
    tone: "gray",
    title: "내 사업장 자금 설계",
    description: [
      "사업자 신용도와 매출 데이터를 기반으로",
      "나에게 맞는 시중 대출 상품과 지원금을 찾아",
      "자금 포트폴리오를 간편하게 제작합니다.",
    ],
    action: "간편하게 자금 설계 하기",
  },
  {
    icon: "/landing/policy.svg",
    arrow: "/landing/arrow-2.svg",
    tone: "brown",
    title: "내 사업장에 맞는 정책 자금 / 보조금",
    description: [
      "중앙정부부터 지자체까지, 내 사업장에 딱",
      "맞는 정책 자금과 보조금 정보를 놓치지",
      "않게 알림으로 알려드립니다.",
    ],
    action: "지원정책 찾기",
  },
];

const stats = [
  {
    label: "세무 리스크 감소",
    value: 88,
  },
  {
    label: "대출 금리 인하 만족도",
    value: 94,
  },
];

export default function LandingPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  return (
    <main className="landing">
      <div className="mobile-screen">
        <header className="app-header">
          <h1>KB기업모바일브랜치</h1>
          <Image
            src="/landing/header-icons.svg"
            alt=""
            width={123}
            height={24}
            priority
          />
        </header>

        <div className="landing-content">
          <section className="hero-card" aria-labelledby="hero-title">
            <div className="hero-copy">
              <p className="eyebrow">AI 맞춤형 자금 비서</p>
              <h2 id="hero-title">KB BizMate AI로 사업 자금 고민 끝!</h2>
              <p className="hero-description">
                절세·대출·지원정책을 한 번에, 사업자 데이터를 바탕으로 가장
                유리한 자금관리 방법을 찾아드립니다.
              </p>

              <div className="trust-badge-list">
                {trustBadges.map((badge) => (
                  <div className="trust-badge" key={badge.label}>
                    <Image src={badge.icon} alt="" width={16} height={20} />
                    <span>{badge.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="hero-image-wrap">
              <Image
                src="/landing/hero.png"
                alt=""
                width={704}
                height={412}
                className="hero-image"
                priority
              />
            </div>
          </section>

          <section className="social-proof" aria-label="이용자 현황">
            <div className="avatar-stack" aria-hidden="true">
              <Image src="/landing/avatar-1.png" alt="" width={40} height={40} />
              <Image src="/landing/avatar-2.png" alt="" width={40} height={40} />
              <Image src="/landing/avatar-3.png" alt="" width={40} height={40} />
              <span>+2k</span>
            </div>
            <p>
              이미 <strong>2,384명의 사장님</strong>이
              <br />
              KB BizMate AI로 자금을 관리하고 있어요.
            </p>
          </section>

          <section className="feature-section" aria-labelledby="feature-title">
            <h2 id="feature-title">BizMate 핵심 서비스</h2>
            <div className="feature-list">
              {features.map((feature) => (
                <article className="feature-card" key={feature.title}>
                  <div className={`feature-icon ${feature.tone}`}>
                    <Image src={feature.icon} alt="" width={20} height={20} />
                  </div>
                  <h3>{feature.title}</h3>
                  <p>
                    {feature.description.map((line) => (
                      <span key={line}>
                        {line}
                        <br />
                      </span>
                    ))}
                  </p>
                  <a href="#" aria-label={`${feature.action} 페이지로 이동`}>
                    {feature.action}
                    <Image src={feature.arrow} alt="" width={12} height={12} />
                  </a>
                </article>
              ))}
            </div>
          </section>

          <section className="stats-section" aria-labelledby="stats-title">
            <h2 id="stats-title">
              데이터로 증명하는
              <br />
              금융 효율화
            </h2>
            <p>
              KB BizMate AI는 단순한 조언이 아닌, 실제 금융 데이터를 바탕으로
              구체적인 실행계획을 제시합니다. 92%의 사용자가 도입 후 자금
              운용의 효율성이 증가했다고 답했습니다.
            </p>
            <div className="stat-list">
              {stats.map((stat) => (
                <div className="stat-row" key={stat.label}>
                  <div className="stat-label">
                    <span>{stat.label}</span>
                    <strong>{stat.value}%</strong>
                  </div>
                  <div className="stat-track">
                    <div
                      className="stat-fill"
                      style={{ width: `${stat.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="sticky-cta">
          <Link
            href="/persona"
            aria-label={isAnalyzing ? "자금관리 분석 중" : "내 자금관리 분석 시작하기"}
            aria-busy={isAnalyzing}
            onClick={() => setIsAnalyzing(true)}
          >
            <Image src="/landing/cta.svg" alt="" width={18} height={18} />
            <span>{isAnalyzing ? "페르소나 불러오는 중..." : "내 자금관리 분석 시작하기"}</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
