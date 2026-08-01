import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const personaSessionKey = "bizmate-persona-inputs-v1";

type BusinessProfile = {
  id: string;
  business_name: string;
  region_name: string | null;
  industry_name: string | null;
  annual_sales: number;
};

const personaMeta: Record<string, { role: string; age: string; icon: string; need: string }> = {
  "채움미술학원": {
    role: "미술학원 원장님",
    age: "56세",
    icon: "🎨",
    need: "시설 개선과 교육 장비 지원이 필요해요.",
  },
  "마산평광주유소": {
    role: "주유소 사장님",
    age: "63세",
    icon: "⛽",
    need: "노후 설비를 안전하고 친환경적으로 바꾸고 싶어요.",
  },
  "인스턴트웹이브": {
    role: "IT 스타트업 대표님",
    age: "33세",
    icon: "💻",
    need: "개발과 시장 출시를 위한 빠른 자금이 필요해요.",
  },
};

type ProfileInput = {
  businessName: string;
  industryName: string;
  monthlySales: string;
};

function formatMonthlySales(value: number) {
  return `${Math.round(value / 10_000)}`;
}

function createInitialInputs(profiles: BusinessProfile[]) {
  return Object.fromEntries(
    profiles.map((profile) => [
      profile.id,
      {
        businessName: profile.business_name,
        industryName: profile.industry_name ?? "",
        monthlySales: formatMonthlySales(Math.round(profile.annual_sales / 12)),
      },
    ]),
  ) as Record<string, ProfileInput>;
}

function loadPersonaInputs() {
  if (typeof window === "undefined") return {};
  try {
    const stored = window.sessionStorage.getItem(personaSessionKey);
    return stored ? JSON.parse(stored) as Record<string, ProfileInput> : {};
  } catch {
    return {};
  }
}

function savePersonaInputs(inputs: Record<string, ProfileInput>) {
  window.sessionStorage.setItem(personaSessionKey, JSON.stringify(inputs));
}

export default function PersonaSelectionPage({ profiles }: { profiles: BusinessProfile[] }) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [profileInputs, setProfileInputs] = useState(() => createInitialInputs(profiles));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setProfileInputs((current) => ({
      ...current,
      ...loadPersonaInputs(),
    }));
  }, []);

  const updateProfileInput = (
    profileId: string,
    field: keyof ProfileInput,
    value: string,
  ) => {
    setProfileInputs((current) => {
      const next = {
        ...current,
        [profileId]: {
          businessName: current[profileId]?.businessName ?? "",
          industryName: current[profileId]?.industryName ?? "",
          monthlySales: current[profileId]?.monthlySales ?? "",
          [field]: value,
        },
      };
      savePersonaInputs(next);
      return next;
    });
  };

  const selectPersona = (profile: BusinessProfile) => {
    const input = profileInputs[profile.id] ?? {
      businessName: profile.business_name,
      industryName: profile.industry_name ?? "",
      monthlySales: formatMonthlySales(Math.round(profile.annual_sales / 12)),
    };
    const businessName = input.businessName.trim();
    const industryName = input.industryName.trim();
    const monthlySales = Number(input.monthlySales.replace(/[^\d.]/g, ""));

    if (!businessName || !industryName || !Number.isFinite(monthlySales) || monthlySales < 0) {
      setErrorMessage("사업장명, 업종, 월매출을 입력해 주세요.");
      return;
    }

    const nextInputs = {
      ...profileInputs,
      [profile.id]: {
        businessName,
        industryName,
        monthlySales: String(Math.round(monthlySales)),
      },
    };

    setSelectedId(profile.id);
    setErrorMessage(null);
    savePersonaInputs(nextInputs);
    document.cookie = `bizmate_profile_id=${encodeURIComponent(profile.id)}; Path=/; SameSite=Lax`;
    void router.push("/service");
  };

  return (
    <main className="landing">
      <div className="mobile-screen persona-screen">
        <header className="persona-header">
          <Link href="/" aria-label="이전 화면으로 이동">
            <Image src="/service/service-back.svg" alt="" width={24} height={24} />
          </Link>
          <h1>분석할 사업자를 선택해 주세요</h1>
          <p>DB에 저장된 값을 기본으로 불러오고, 수정값은 현재 브라우저 세션에만 저장됩니다.</p>
        </header>

        <div className="persona-list">
          {profiles.map((profile) => {
            const meta = personaMeta[profile.business_name] ?? {
              role: "소상공인 대표님",
              age: "",
              icon: "🏪",
              need: "맞춤 금융 분석이 필요해요.",
            };
            const selected = selectedId === profile.id;
            const input = profileInputs[profile.id] ?? {
              businessName: profile.business_name,
              industryName: profile.industry_name ?? "",
              monthlySales: formatMonthlySales(Math.round(profile.annual_sales / 12)),
            };

            return (
              <article className={`persona-card ${selected ? "selected" : ""}`} key={profile.id}>
                <div className="persona-avatar" aria-hidden="true">{meta.icon}</div>
                <div className="persona-copy">
                  <span>{profile.region_name} · {meta.age}</span>
                  <h2>{meta.role}</h2>
                  <label>
                    <span>사업장</span>
                    <input
                      value={input.businessName}
                      onChange={(event) => updateProfileInput(profile.id, "businessName", event.target.value)}
                      placeholder="사업장명을 입력해 주세요"
                    />
                  </label>
                  <label>
                    <span>업종</span>
                    <input
                      value={input.industryName}
                      onChange={(event) => updateProfileInput(profile.id, "industryName", event.target.value)}
                      placeholder="업종을 입력해 주세요"
                    />
                  </label>
                  <label>
                    <span>월매출</span>
                    <div className="persona-money-input">
                      <input
                        value={input.monthlySales}
                        inputMode="numeric"
                        onChange={(event) => updateProfileInput(profile.id, "monthlySales", event.target.value)}
                        placeholder="월매출을 입력해 주세요"
                      />
                      <small>만원</small>
                    </div>
                  </label>
                  <p>{meta.need}</p>
                  <div>
                    <span>{input.industryName || "업종 미입력"}</span>
                    <span>월매출 {Number(input.monthlySales || 0).toLocaleString("ko-KR")}만원</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => selectPersona(profile)}
                  disabled={selected}
                >
                  {selected ? (
                    <>
                      <span>분석중</span>
                      <span className="persona-button-spinner" aria-hidden="true" />
                    </>
                  ) : (
                    "선택"
                  )}
                </button>
              </article>
            );
          })}
          {errorMessage ? <p className="persona-error">{errorMessage}</p> : null}
          {!profiles.length ? <p className="persona-empty">등록된 사업자 정보를 불러오지 못했습니다.</p> : null}
        </div>
      </div>
    </main>
  );
}
