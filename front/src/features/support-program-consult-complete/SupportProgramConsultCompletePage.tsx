import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";

const advisorName = "기업금융 전문 000 파트너";

function getReservationDate(dayParam: string | string[] | undefined, timeParam: string | string[] | undefined) {
  const dayValue = Array.isArray(dayParam) ? dayParam[0] : dayParam;
  const timeValue = Array.isArray(timeParam) ? timeParam[0] : timeParam;
  const day = Number(dayValue);
  const safeDay = Number.isInteger(day) && day >= 1 && day <= 31 ? day : 19;
  const safeTime = timeValue && /^\d{2}:\d{2}$/.test(timeValue) ? timeValue : "10:00";

  return `2026년 8월 ${safeDay}일 ${safeTime}`;
}

export default function SupportProgramConsultCompletePage() {
  const router = useRouter();
  const reservationDate = getReservationDate(router.query.day, router.query.time);

  return (
    <main className="landing">
      <div className="mobile-screen consult-complete-screen">
        <header className="consult-complete-header">
          <div className="consult-complete-header-left">
            <Link href="/support-programs/apply/consult" className="icon-button" aria-label="이전 화면으로 이동">
              <Image src="/consult-complete/consult-complete-back.svg" alt="" width={24} height={24} />
            </Link>
            <h1>KB BizMate AI</h1>
          </div>
          <div className="consult-complete-header-actions">
            <button className="icon-button" type="button" aria-label="검색">
              <Image src="/consult-complete/consult-complete-search.svg" alt="" width={24} height={24} />
            </button>
            <Link href="/" className="icon-button" aria-label="홈으로 이동">
              <Image src="/consult-complete/consult-complete-home.svg" alt="" width={24} height={24} />
            </Link>
            <button className="icon-button" type="button" aria-label="메뉴 열기">
              <Image src="/consult-complete/consult-complete-menu.svg" alt="" width={24} height={24} />
            </button>
          </div>
        </header>

        <div className="consult-complete-content">
          <section className="consult-complete-hero" aria-labelledby="consult-complete-title">
            <div className="consult-complete-characters">
              <Image src="/consult-complete/consult-complete-characters.png" alt="" width={352} height={206} priority />
            </div>
            <h2 id="consult-complete-title">상담 예약이 완료되었습니다!</h2>
            <p>
              전문 상담사가 고객님의 AI 분석 포트폴리오를
              <br />
              꼼꼼히 검토한 후 연락드릴 예정입니다.
            </p>
          </section>

          <section className="consult-complete-details" aria-label="예약 상세 정보">
            <article className="consult-complete-detail-card">
              <span className="consult-complete-detail-icon">
                <Image src="/consult-complete/consult-complete-calendar.svg" alt="" width={37} height={43} />
              </span>
              <div>
                <p>예약 일시</p>
                <strong>{reservationDate}</strong>
              </div>
            </article>

            <article className="consult-complete-detail-card">
              <span className="consult-complete-detail-icon">
                <Image src="/consult-complete/consult-complete-advisor.svg" alt="" width={39} height={43} />
              </span>
              <div>
                <p>배정 상담사</p>
                <strong>{advisorName}</strong>
              </div>
            </article>
          </section>

          <aside className="consult-complete-notice">
            <Image src="/consult-complete/consult-complete-notice.svg" alt="" width={15} height={17} />
            <p>예약 취소 및 변경은 상담 1시간 전까지만 가능합니다.</p>
          </aside>
        </div>

        <div className="consult-complete-bottom-cta">
          <Link href="/service">홈으로 돌아가기</Link>
        </div>
      </div>
    </main>
  );
}
