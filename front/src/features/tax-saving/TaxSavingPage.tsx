import Image from "next/image";
import Link from "next/link";

const calendarDays = [
  { day: "28", muted: true },
  { day: "29", muted: true },
  { day: "30", muted: true },
  { day: "1" },
  { day: "2" },
  { day: "3" },
  { day: "4" },
  { day: "5" },
  { day: "6" },
  { day: "7" },
  { day: "8" },
  { day: "9" },
  { day: "10", marker: "blue" },
  { day: "11" },
  { day: "12" },
  { day: "13" },
  { day: "14" },
  { day: "15" },
  { day: "16" },
  { day: "17" },
  { day: "18", marker: "yellow" },
  { day: "19" },
  { day: "20" },
  { day: "21" },
  { day: "22" },
  { day: "23", marker: "blue" },
  { day: "24" },
  { day: "25", selected: true },
  { day: "26" },
  { day: "27" },
  { day: "28" },
  { day: "29" },
  { day: "30" },
  { day: "31" },
  { day: "1", muted: true },
];

const keySchedules = [
  { label: "부가가치세 신고 마감", date: "7.25", tone: "red" },
  { label: "카드매출 입금", date: "7.27", tone: "blue" },
  { label: "세무사 상담", date: "7.28", tone: "yellow" },
];

const upcomingSchedules = [
  {
    dday: "D-10",
    date: "7.25 (금)",
    title: "부가가치세 확정신고",
    amount: "1,450,000원",
    tone: "red",
  },
  {
    dday: "D-36",
    date: "8.20 (목)",
    title: "원천세 신고/납부",
    amount: "230,000원",
    tone: "blue",
  },
  {
    dday: "D-68",
    date: "9.21 (월)",
    title: "2기 부가가치세 예정신고",
    amount: "1,320,000원",
    tone: "blue",
  },
];

export default function TaxSavingPage() {
  return (
    <main className="landing">
      <div className="mobile-screen tax-saving-screen">
        <header className="tax-saving-header">
          <div className="tax-saving-header-left">
            <Link href="/service" className="icon-button" aria-label="이전 화면으로 이동">
              <Image src="/tax-saving/tax-back.svg" alt="" width={24} height={24} />
            </Link>
            <h1>KB BizMate AI - 스마트 절세</h1>
          </div>
        </header>

        <div className="tax-saving-content">
          <section className="tax-dday-card" aria-labelledby="tax-dday-title">
            <div className="tax-dday-summary">
              <div className="tax-dday-box">
                <span>D-DAY</span>
                <strong>D-10</strong>
                <p>2026.07.25 마감</p>
              </div>

              <div className="tax-dday-detail">
                <span className="tax-urgent-badge">마감 임박</span>
                <h2 id="tax-dday-title">제1기 부가가치세 확정신고</h2>
                <p>신고/납부 마감일 2026.07.25 (금)</p>
                <div className="tax-dday-metrics">
                  <div>
                    <span>AI 예상 납부 세액</span>
                    <strong>1,450,000원</strong>
                  </div>
                  <div>
                    <span>절세 가능 금액</span>
                    <strong className="saving">↓ 45,000원</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="tax-ai-tip">
              <div className="tax-ai-copy">
                <p>
                  지금 준비하면
                  <br />
                  세금 <strong>45,000원</strong>을
                  <br />
                  절약할 수 있어요!
                </p>
                <Link href="/tax-saving/guide" className="tax-ai-guide-link">
                  AI 절세 가이드 보기
                  <Image src="/tax-saving/tax-chevron-right.svg" alt="" width={12} height={12} />
                </Link>
              </div>
              <div className="tax-character-crop" aria-hidden="true">
                <Image
                  src="/tax-saving/tax-saving-character.png"
                  alt=""
                  width={372}
                  height={555}
                  priority
                />
              </div>
            </div>
          </section>

          <section className="tax-calendar-card" aria-labelledby="tax-calendar-title">
            <div className="tax-section-heading">
              <h2 id="tax-calendar-title">세무/금융 캘린더</h2>
              <div className="tax-month-control" aria-label="월 선택">
                <button type="button" aria-label="이전 달">
                  <Image src="/tax-saving/tax-chevron-left.svg" alt="" width={16} height={16} />
                </button>
                <strong>
                  2026년
                  <br />
                  7월
                </strong>
                <button type="button" aria-label="다음 달">
                  <Image src="/tax-saving/tax-calendar-next.svg" alt="" width={16} height={16} />
                </button>
              </div>
              <button className="tax-today-button" type="button">
                오늘
              </button>
            </div>

            <div className="tax-weekdays" aria-hidden="true">
              {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>

            <div className="tax-calendar-grid">
              {calendarDays.map((day, index) => (
                <div
                  className={`tax-date ${day.muted ? "muted" : ""} ${day.selected ? "selected" : ""}`}
                  key={`${day.day}-${index}`}
                >
                  <span>{day.day}</span>
                  {day.marker ? <i className={day.marker} /> : null}
                </div>
              ))}
            </div>

            <div className="tax-legend">
              <span>
                <i className="red" />
                세무 마감일
              </span>
              <span>
                <i className="blue" />
                정산/입금일
              </span>
              <span>
                <i className="yellow" />
                메모 일정
              </span>
            </div>
          </section>

          <section className="tax-day-card" aria-labelledby="tax-day-title">
            <div className="tax-day-title">
              <h2 id="tax-day-title">7월 25일 (금) 일정</h2>
              <span>세무 마감일</span>
            </div>

            <div className="tax-deadline-detail">
              <h3>제1기 부가가치세 확정신고 마감일</h3>
              <p>예상 납부 세액</p>
              <strong>1,450,000원</strong>
              <Link href="/tax-saving/vat-guide" className="tax-deadline-guide-link">
                상세 가이드 보기
                <Image src="/tax-saving/tax-chevron-right.svg" alt="" width={12} height={12} />
              </Link>
            </div>

            <div className="tax-key-schedules">
              <h3>주요 일정</h3>
              {keySchedules.map((item) => (
                <div className="tax-key-row" key={item.label}>
                  <span>
                    <i className={item.tone} />
                    {item.label}
                  </span>
                  <time>{item.date}</time>
                </div>
              ))}
            </div>
          </section>

          <section className="tax-upcoming" aria-labelledby="tax-upcoming-title">
            <h2 id="tax-upcoming-title">다가오는 세무 일정</h2>
            <div className="tax-upcoming-scroll">
              {upcomingSchedules.map((item) => (
                <article className="tax-upcoming-card" key={item.title}>
                  <div className="tax-upcoming-top">
                    <span className={item.tone}>{item.dday}</span>
                    <time>{item.date}</time>
                  </div>
                  <h3>{item.title}</h3>
                  <p>예상 납부 세액</p>
                  <strong>{item.amount}</strong>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
