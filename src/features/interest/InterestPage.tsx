import Image from "next/image";
import Link from "next/link";

const settings = [
  { label: "신청 시작", marker: "D-Day" },
  { label: "신청 마감 D-7", marker: "D-7" },
  { label: "신청 마감 D-3", marker: "D-3" },
  {
    label: "관심 사업 조기 마감",
    icon: "/figma-assets/interest-early.svg",
  },
  { label: "신규 지원사업", marker: "NEW", markerTone: "new" },
  {
    label: "추가 모집",
    icon: "/figma-assets/interest-megaphone.svg",
  },
];

const previewCards = [
  {
    title: "D-3 지원사업이 있어요!",
    subject: "대구 특례보증",
    description: (
      <>
        신청 마감까지
        <br />
        <strong>3일</strong> 남았습니다.
      </>
    ),
  },
  {
    title: "조기 마감 임박",
    subject: "스마트 상점",
    description: "조기 마감될 수 있습니다.",
    warning: true,
  },
];

export default function InterestPage() {
  return (
    <main className="landing">
      <div className="mobile-screen interest-screen">
        <header className="interest-header">
          <div className="interest-header-left">
            <Link href="/service" className="icon-button" aria-label="이전 화면으로 이동">
              <Image src="/figma-assets/interest-header-back.svg" alt="" width={24} height={24} />
            </Link>
            <h1>KB BizMate AI</h1>
          </div>
          <div className="interest-header-actions">
            <button className="icon-button" type="button" aria-label="검색">
              <Image src="/figma-assets/interest-search.svg" alt="" width={24} height={24} />
            </button>
            <Link href="/" className="icon-button" aria-label="홈으로 이동">
              <Image src="/figma-assets/interest-home.svg" alt="" width={24} height={24} />
            </Link>
            <button className="icon-button" type="button" aria-label="메뉴 열기">
              <Image src="/figma-assets/interest-menu.svg" alt="" width={24} height={24} />
            </button>
          </div>
        </header>

        <div className="interest-content">
          <section className="interest-hero" aria-labelledby="interest-hero-title">
            <div className="interest-hero-copy">
              <div className="interest-hero-title-row">
                <div className="interest-hero-icon">
                  <Image src="/figma-assets/interest-hero-bell.svg" alt="" width={24} height={24} />
                </div>
                <h2 id="interest-hero-title">
                  선착순 마감 전에
                  <br />
                  <span>미리</span> 알려드려요!
                </h2>
              </div>
              <p>
                관심사업으로 등록하면
                <br />
                신청 시작부터 마감까지 알려드립니다.
              </p>
            </div>
            <div className="interest-hero-image">
              <Image src="/figma-assets/interest-hero.png" alt="" width={433} height={650} priority />
            </div>
          </section>

          <section className="interest-settings" aria-labelledby="settings-title">
            <h2 id="settings-title">알림 설정</h2>
            <div className="setting-list">
              {settings.map((setting) => (
                <div className="setting-row" key={setting.label}>
                  <div className="setting-label">
                    <div className="setting-icon-box">
                      {setting.icon ? (
                        <Image src={setting.icon} alt="" width={20} height={20} />
                      ) : (
                        <span className={setting.markerTone}>{setting.marker}</span>
                      )}
                    </div>
                    <span>{setting.label}</span>
                  </div>
                  <button className="toggle on" type="button" aria-label={`${setting.label} 알림 켜짐`} />
                </div>
              ))}
            </div>
          </section>

          <section className="interest-preview" aria-labelledby="preview-title">
            <h2 id="preview-title">알림 미리보기</h2>
            <div className="preview-scroll">
              {previewCards.map((card) => (
                <article className="preview-card" key={card.title}>
                  <div className="preview-title">
                    <Image src="/figma-assets/interest-small-bell.svg" alt="" width={12} height={11} />
                    <span>{card.title}</span>
                  </div>
                  <div className="preview-body">
                    {card.warning ? <span className="warning-mark">!</span> : <span className="preview-spacer" />}
                    <div>
                      <h3>{card.subject}</h3>
                      <p>{card.description}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <div className="preview-note">
              <Image src="/figma-assets/interest-info.svg" alt="" width={16} height={16} />
              <span>푸시 알림은 KB스타뱅킹 알림함에서도 확인할 수 있습니다.</span>
            </div>
          </section>
        </div>

        <div className="interest-bottom-actions">
          <Link href="/support-programs" className="primary-action">
            관심 사업 찾아보기
          </Link>
          <Link href="/support-programs" className="secondary-action">
            되돌아 가기
          </Link>
        </div>
      </div>
    </main>
  );
}
