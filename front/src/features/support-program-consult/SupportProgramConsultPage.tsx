import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";

const weekdays = [
  { label: "일", sunday: true },
  { label: "월" },
  { label: "화" },
  { label: "수" },
  { label: "목" },
  { label: "금" },
  { label: "토" },
];

type CalendarDate = {
  day?: number;
  key: string;
};

const august2026Dates: CalendarDate[] = [
  ...Array.from({ length: 6 }, (_, index) => ({ key: `blank-${index}` })),
  ...Array.from({ length: 31 }, (_, index) => ({ day: index + 1, key: `day-${index + 1}` })),
];

const times = [
  { time: "09:00", status: "예약 가능" },
  { time: "10:00", status: "예약 가능" },
  { time: "14:00", status: "예약 마감", disabled: true },
  { time: "16:00", status: "예약 가능" },
];

export default function SupportProgramConsultPage() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(19);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const reserveConsultation = () => {
    if (!selectedTime) {
      return;
    }

    router.push({
      pathname: "/support-programs/apply/consult/complete",
      query: {
        day: selectedDate,
        time: selectedTime,
      },
    });
  };

  return (
    <main className="landing">
      <div className="mobile-screen consult-screen">
        <header className="consult-header">
          <div className="consult-header-left">
            <Link href="/support-programs/apply/status" className="icon-button" aria-label="이전 화면으로 이동">
              <Image src="/figma-assets/consult-back.svg" alt="" width={24} height={24} />
            </Link>
            <h1>KB BizMate AI</h1>
          </div>
        </header>

        <div className="consult-content">
          <section className="consult-intro" aria-label="상담 안내">
            <div className="consult-character">
              <Image src="/figma-assets/consult-character.png" alt="" width={73} height={70} priority />
            </div>
            <div className="consult-speech">
              <p>
                예약해 주시면 원하는 시간에 맞추어
                <br />
                유선 상담을 진행합니다.
              </p>
            </div>
          </section>

          <section className="consult-section" aria-labelledby="consult-date-title">
            <div className="consult-title-row">
              <h2 id="consult-date-title">상담 날짜 선택</h2>
              <span>2026년 8월</span>
            </div>
            <div className="consult-calendar" aria-label="상담 날짜">
              {weekdays.map((weekday) => (
                <span className={weekday.sunday ? "sunday" : ""} key={weekday.label}>
                  {weekday.label}
                </span>
              ))}
              {august2026Dates.map((date) => {
                if (!date.day) {
                  return <span aria-hidden="true" className="calendar-blank" key={date.key} />;
                }

                const day = date.day;

                return (
                  <button
                    aria-pressed={selectedDate === day}
                    className={selectedDate === day ? "selected" : ""}
                    key={date.key}
                    onClick={() => setSelectedDate(day)}
                    type="button"
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="consult-section" aria-labelledby="consult-time-title">
            <h2 id="consult-time-title">상담 시간 선택</h2>
            <div className="consult-time-grid">
              {times.map((slot) => (
                <button
                  aria-pressed={selectedTime === slot.time}
                  className={`${slot.disabled ? "disabled" : ""} ${selectedTime === slot.time ? "selected" : ""}`}
                  disabled={slot.disabled}
                  key={slot.time}
                  onClick={() => setSelectedTime(slot.time)}
                  type="button"
                >
                  <strong>{slot.time}</strong>
                  <span>{slot.status}</span>
                </button>
              ))}
            </div>
          </section>

          <aside className="consult-info-box">
            <Image src="/figma-assets/consult-info.svg" alt="" width={18} height={18} />
            <p>
              상담은 고객님의 <strong>AI 분석 포트폴리오</strong>를 기반으로
              <br />
              진행됩니다.
            </p>
          </aside>
        </div>

        <div className="consult-bottom-cta">
          <button className="consult-reserve-button" disabled={!selectedTime} onClick={reserveConsultation} type="button">
            예약하기
          </button>
          <Link href="/support-programs" className="consult-later-button">
            나중에 하기
          </Link>
        </div>
      </div>
    </main>
  );
}
