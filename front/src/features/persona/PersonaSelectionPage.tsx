import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { BusinessProfile } from "@/data/supportPrograms";

const personaMeta: Record<string, { role: string; age: string; icon: string; need: string }> = {
  채움미술학원: { role: "미술학원 원장님", age: "56세", icon: "🎨", need: "시설 개선과 교육 장비 지원이 필요해요." },
  마산행복주유소: { role: "주유소 사장님", age: "63세", icon: "⛽", need: "노후 설비를 안전하고 친환경적으로 바꾸고 싶어요." },
  넥스트웨이브랩: { role: "IT 스타트업 대표님", age: "33세", icon: "💻", need: "개발과 시장 출시를 위한 빠른 자금이 필요해요." },
};

function formatSales(value: number) {
  return `${(value / 100_000_000).toLocaleString("ko-KR", { maximumFractionDigits: 1 })}억 원`;
}

export default function PersonaSelectionPage({ profiles }: { profiles: BusinessProfile[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectPersona = (profile: BusinessProfile) => {
    setSelectedId(profile.id);
    document.cookie = `bizmate_profile_id=${encodeURIComponent(profile.id)}; Path=/; SameSite=Lax`;
    window.sessionStorage.clear();
  };

  return (
    <main className="landing">
      <div className="mobile-screen persona-screen">
        <header className="persona-header">
          <Link href="/" aria-label="이전 화면으로 이동"><Image src="/service/service-back.svg" alt="" width={24} height={24} /></Link>
          <h1>분석할 사업자를 선택해 주세요</h1>
          <p>선택한 사업자 정보로 지원사업·자금조달·절세 혜택을 분석합니다.</p>
        </header>
        <div className="persona-list">
          {profiles.map((profile) => {
            const meta = personaMeta[profile.business_name] ?? { role: "소상공인 대표님", age: "", icon: "🏪", need: "맞춤 금융 분석이 필요해요." };
            const selected = selectedId === profile.id;
            return (
              <Link href="/service" className={`persona-card ${selected ? "selected" : ""}`} key={profile.id} onClick={() => selectPersona(profile)} aria-label={`${meta.role} 선택 후 분석`}>
                <div className="persona-avatar" aria-hidden="true">{meta.icon}</div>
                <div className="persona-copy">
                  <span>{profile.region_name} · {meta.age}</span>
                  <h2>{meta.role}</h2>
                  <strong>{profile.business_name}</strong>
                  <p>{meta.need}</p>
                  <div><span>{profile.industry_name}</span><span>연매출 {formatSales(profile.annual_sales)}</span></div>
                </div>
                <b>{selected ? "분석 중..." : "선택"}</b>
              </Link>
            );
          })}
          {!profiles.length ? <p className="persona-empty">등록된 사업자 정보를 불러오지 못했습니다.</p> : null}
        </div>
      </div>
    </main>
  );
}
