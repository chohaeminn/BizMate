import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type TaxSchedule = {
  id: string;
  title: string;
  note: string | null;
  schedule_date: string;
};

function parseDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function dateKey(date: Date) {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
}

function formatDate(value: string, withYear = false) {
  const date = parseDate(value);
  const prefix = withYear ? `${date.getFullYear()}.` : "";
  return `${prefix}${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")} (${["일", "월", "화", "수", "목", "금", "토"][date.getDay()]})`;
}

function getDday(value: string, today: Date) {
  const target = parseDate(value);
  const base = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const days = Math.round((target.getTime() - base.getTime()) / 86_400_000);
  return days === 0 ? "D-DAY" : `D-${days}`;
}

function buildCalendar(year: number, month: number) {
  const first = new Date(year, month, 1);
  const start = new Date(year, month, 1 - first.getDay());
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
}

export default function TaxSavingPage() {
  const [today] = useState(() => new Date());
  const [displayMonth, setDisplayMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(() => dateKey(today));
  const [monthSchedules, setMonthSchedules] = useState<TaxSchedule[]>([]);
  const [yearSchedules, setYearSchedules] = useState<TaxSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setErrorMessage("");
    const year = displayMonth.getFullYear();
    const month = displayMonth.getMonth() + 1;
    void Promise.all([
      fetch(`/api/tax-schedules?year=${year}&month=${month}`, { signal: controller.signal }),
      fetch(`/api/tax-schedules?year=${year}`, { signal: controller.signal }),
    ])
      .then(async ([monthResponse, yearResponse]) => {
        if (!monthResponse.ok || !yearResponse.ok) {
          throw new Error(`세무일정 조회 실패 (${monthResponse.status}/${yearResponse.status})`);
        }
        return Promise.all([
          monthResponse.json() as Promise<TaxSchedule[]>,
          yearResponse.json() as Promise<TaxSchedule[]>,
        ]);
      })
      .then(([monthData, yearData]) => {
        setMonthSchedules(monthData);
        setYearSchedules(yearData);
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        console.error(error);
        setErrorMessage("세무일정을 불러오지 못했어요.");
      })
      .finally(() => setIsLoading(false));
    return () => controller.abort();
  }, [displayMonth]);

  const schedulesByDate = useMemo(() => {
    const grouped = new Map<string, TaxSchedule[]>();
    for (const schedule of monthSchedules) {
      grouped.set(schedule.schedule_date, [...(grouped.get(schedule.schedule_date) ?? []), schedule]);
    }
    return grouped;
  }, [monthSchedules]);
  const calendarDays = useMemo(
    () => buildCalendar(displayMonth.getFullYear(), displayMonth.getMonth()),
    [displayMonth],
  );
  const selectedSchedules = schedulesByDate.get(selectedDate) ?? [];
  const upcomingSchedules = useMemo(() => yearSchedules
    .filter((schedule) => parseDate(schedule.schedule_date) >= new Date(today.getFullYear(), today.getMonth(), today.getDate()))
    .slice(0, 12), [yearSchedules, today]);
  const nextSchedule = upcomingSchedules.find((schedule) => schedule.title.includes("부가가치세"))
    ?? upcomingSchedules[0]
    ?? null;

  const moveMonth = (offset: number) => {
    const next = new Date(displayMonth.getFullYear(), displayMonth.getMonth() + offset, 1);
    setDisplayMonth(next);
    setSelectedDate(dateKey(next));
  };
  const moveToday = () => {
    setDisplayMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(dateKey(today));
  };

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
                <strong>{nextSchedule ? getDday(nextSchedule.schedule_date, today) : "-"}</strong>
                <p>{nextSchedule ? `${formatDate(nextSchedule.schedule_date, true)} 마감` : "예정 일정 없음"}</p>
              </div>

              <div className="tax-dday-detail">
                <span className="tax-urgent-badge">{nextSchedule ? "다가오는 일정" : "일정 없음"}</span>
                <h2 id="tax-dday-title">{nextSchedule?.title ?? "등록된 세무일정이 없습니다"}</h2>
                <p>{nextSchedule?.note ?? "다른 달의 일정을 확인해 주세요."}</p>
                <div className="tax-dday-metrics tax-dday-db-source">
                  <div>
                    <span>일정 기준</span>
                    <strong>DB 세무일정</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="tax-ai-tip">
              <div className="tax-ai-copy">
                <p>다가오는 신고·납부 일정을<br /><strong>미리 확인하고 준비</strong>해 보세요.</p>
                <Link href="/tax-saving/guide" className="tax-ai-guide-link">
                  AI 절세 가이드 보기
                  <Image src="/tax-saving/tax-chevron-right.svg" alt="" width={12} height={12} />
                </Link>
              </div>
              <div className="tax-character-crop" aria-hidden="true">
                <Image src="/tax-saving/tax-saving-character.png" alt="" width={372} height={555} priority />
              </div>
            </div>
          </section>

          <section className="tax-calendar-card" aria-labelledby="tax-calendar-title">
            <div className="tax-section-heading">
              <h2 id="tax-calendar-title">세무/금융 캘린더</h2>
              <div className="tax-month-control" aria-label="월 선택">
                <button type="button" aria-label="이전 달" onClick={() => moveMonth(-1)}>
                  <Image src="/tax-saving/tax-chevron-left.svg" alt="" width={16} height={16} />
                </button>
                <strong>{displayMonth.getFullYear()}년<br />{displayMonth.getMonth() + 1}월</strong>
                <button type="button" aria-label="다음 달" onClick={() => moveMonth(1)}>
                  <Image src="/tax-saving/tax-calendar-next.svg" alt="" width={16} height={16} />
                </button>
              </div>
              <button className="tax-today-button" type="button" onClick={moveToday}>오늘</button>
            </div>

            <div className="tax-weekdays" aria-hidden="true">
              {["일", "월", "화", "수", "목", "금", "토"].map((day) => <span key={day}>{day}</span>)}
            </div>

            <div className="tax-calendar-grid" aria-busy={isLoading}>
              {calendarDays.map((date) => {
                const key = dateKey(date);
                const hasSchedule = schedulesByDate.has(key);
                return (
                  <button
                    type="button"
                    className={`tax-date ${date.getMonth() !== displayMonth.getMonth() ? "muted" : ""} ${selectedDate === key ? "selected" : ""}`}
                    key={key}
                    onClick={() => {
                      if (date.getMonth() !== displayMonth.getMonth()) setDisplayMonth(new Date(date.getFullYear(), date.getMonth(), 1));
                      setSelectedDate(key);
                    }}
                    aria-label={`${key}${hasSchedule ? `, 일정 ${schedulesByDate.get(key)?.length}개` : ""}`}
                  >
                    <span>{date.getDate()}</span>
                    {hasSchedule ? <i className="red" /> : null}
                  </button>
                );
              })}
            </div>

            <div className="tax-legend"><span><i className="red" />DB 세무일정</span></div>
            {errorMessage ? <p className="tax-calendar-error" role="alert">{errorMessage}</p> : null}
          </section>

          <section className="tax-day-card" aria-labelledby="tax-day-title">
            <div className="tax-day-title">
              <h2 id="tax-day-title">{formatDate(selectedDate, true)} 일정</h2>
              <span>{selectedSchedules.length ? `${selectedSchedules.length}건` : "일정 없음"}</span>
            </div>

            {selectedSchedules.length ? selectedSchedules.map((schedule, index) => (
              <div className="tax-deadline-detail" key={schedule.id}>
                <h3>{schedule.title}</h3>
                <p>{schedule.note || "세부 내용은 국세청 공고를 확인해 주세요."}</p>
                {index === 0 ? (
                  <Link href="/tax-saving/vat-guide" className="tax-deadline-guide-link">
                    상세 가이드 보기
                    <Image src="/tax-saving/tax-chevron-right.svg" alt="" width={12} height={12} />
                  </Link>
                ) : null}
              </div>
            )) : <p className="tax-empty-schedule">선택한 날짜에 등록된 세무일정이 없습니다.</p>}
          </section>

          <section className="tax-upcoming" aria-labelledby="tax-upcoming-title">
            <h2 id="tax-upcoming-title">다가오는 세무 일정</h2>
            <div className="tax-upcoming-scroll">
              {upcomingSchedules.map((item) => (
                <article className="tax-upcoming-card" key={item.id}>
                  <div className="tax-upcoming-top">
                    <span className="red">{getDday(item.schedule_date, today)}</span>
                    <time dateTime={item.schedule_date}>{formatDate(item.schedule_date)}</time>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.note || "상세 일정 확인 필요"}</p>
                </article>
              ))}
              {!isLoading && !upcomingSchedules.length ? <p className="tax-empty-schedule">다가오는 일정이 없습니다.</p> : null}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
