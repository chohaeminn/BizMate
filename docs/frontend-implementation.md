# Frontend Implementation

## Current Scope

Figma 기반 모바일 화면과 주요 전환 흐름을 Next.js Pages Router로 구현했습니다.

- `/`: 메인 랜딩 화면
- `/service`: 서비스 입장 및 AI 추천 대시보드 화면
- `/interest`: 관심사업 등록 및 알림 설정 안내 화면
- `/support-programs`: 맞춤 지원사업 전체보기 화면
- `/support-programs/peer-analysis`: 유사 사업자 분석 화면
- `/support-programs/[slug]`: 지원사업 상세 화면
- `/support-programs/apply`: 비대면 신청 안내 화면
- `/support-programs/apply/complete`: 신청 완료 화면
- `/support-programs/apply/status`: 신청 현황 화면
- `/support-programs/apply/consult`: 추가 상담 예약 화면
- `/support-programs/apply/consult/complete`: 상담 예약 완료 화면
- `/tax-saving`: 스마트 절세 캘린더 화면
- `/tax-saving/guide`: AI 절세 추천 및 실시간 예상 세액 화면

## Folder Structure

```text
src/
  features/
    landing/
      LandingPage.tsx
    service/
      ServicePage.tsx
    interest/
      InterestPage.tsx
    support-program-list/
    support-program-detail/
    support-program-peer-analysis/
    support-program-apply/
    support-program-apply-complete/
    support-program-apply-status/
    support-program-consult/
    support-program-consult-complete/
  pages/
    _app.tsx
    index.tsx
    service.tsx
    interest.tsx
    support-programs/
    api/
      azure-openai/
        draft.ts
        status.ts
  styles/
    globals.css
    landing.css
    service.css
    interest.css
    support-program-*.css
  lib/
    azureOpenAI.ts
  data/
    supportPrograms.ts
public/
  landing/
  service/
  tax-saving/
  interest/
  support-program-list/
  support-program-detail/
  peer-analysis/
  apply/
  apply-complete/
  apply-status/
  consult/
  consult-complete/
```

백엔드는 별도 파트에서 관리하므로, 프론트엔드 화면 컴포넌트는 `src/features`에 둡니다. Next 라우팅은 `src/pages`에서 담당합니다.

## Styling Policy

- `src/styles/globals.css`: 디자인 토큰, 리셋, 공통 모바일 프레임, 공통 아이콘 버튼만 관리합니다.
- `src/styles/landing.css`: 메인 랜딩 전용 스타일입니다.
- `src/styles/service.css`: 서비스 대시보드 전용 스타일입니다.
- `src/styles/interest.css`: 관심사업 등록 화면 전용 스타일입니다.
- `src/styles/support-program-*.css`: 지원사업 목록/상세/신청/상담 화면별 스타일입니다.
- Tailwind는 사용하지 않습니다. Figma에서 받은 Tailwind 형태의 참고 코드를 현재 프로젝트의 일반 CSS로 변환했습니다.
- Figma asset URL은 만료될 수 있으므로 `public/{page-or-flow}`에 내려받아 로컬 정적 asset으로 사용합니다.
- 새 Figma 화면을 추가할 때는 기존 파일을 한 폴더에 섞지 않고 화면 또는 플로우 단위 하위 폴더를 먼저 만든 뒤 참조 경로를 연결합니다.

## Responsive Design

Figma 기준은 약 `389px-390px` 모바일 폭이지만, 실제 구현은 모바일 기기 폭 차이를 흡수하도록 만들었습니다.

- 공통 화면 컨테이너는 `width: min(100%, 430px)`입니다.
- `320px`대 작은 모바일에서는 화면 폭 전체를 사용합니다.
- 큰 모바일 또는 데스크톱 미리보기에서는 `430px` 이상 늘어나지 않고 중앙에 고정됩니다.
- 좌우 여백은 `--side-gutter` CSS 변수로 관리합니다.
- 기본 여백은 `16px`, `359px` 이하 compact 구간에서는 `12px`입니다.
- 카드 라운드는 `--card-radius`로 관리합니다.
- 하단 고정 버튼은 브라우저 전체 폭이 아니라 모바일 컨테이너 폭 안에서만 fixed 되도록 `width: min(100%, var(--screen-max))`와 `left: 50%`, `transform: translateX(-50%)`를 사용합니다.
- 히어로 이미지는 고정 높이보다 `aspect-ratio`와 `object-fit`을 우선 사용해 화면 폭 변화에도 이미지 비율이 깨지지 않게 했습니다.

## Page Flow

```text
/ landing
  하단 CTA: 내 자금관리 분석 시작하기
  -> /service

/service
  AI 추천 맞춤 사업 TOP3
  -> /support-programs/{slug}
  전체보기
  -> /support-programs
  알림 설정
  -> /interest

/interest
  관심 사업 찾아보기 / 되돌아 가기
  -> /support-programs

/support-programs
  추천 카드 클릭
  -> /support-programs/{slug}
  보러가기
  -> /support-programs/peer-analysis

/support-programs/{slug}
  신청하기
  -> /support-programs/apply

/support-programs/apply
  비대면 신청하기
  -> /support-programs/apply/complete

/support-programs/apply/complete
  신청현황 보기
  -> /support-programs/apply/status

/support-programs/apply/status
  추가 상담하기
  -> /support-programs/apply/consult
  홈으로 돌아가기
  -> /service

/support-programs/apply/consult
  예약하기
  -> /support-programs/apply/consult/complete?day={day}&time={time}
  나중에 하기
  -> /support-programs

/tax-saving
  AI 절세 가이드 보기
  -> /tax-saving/guide
```

## Integration Notes

현재 화면 데이터는 Figma 시안 기반의 정적 데이터입니다. 백엔드 API 연동 시 아래 데이터 영역부터 실제 응답으로 교체하면 됩니다.

- `/service`: 추천 현황, AI 추천 맞춤 사업 TOP3, 알림 배너 상태
- `/support-programs`: 지원사업 목록, 필터, 유사 사업자 분석 진입 카드
- `/support-programs/[slug]`: 지원사업 상세, 관심사업 등록 상태, 신청 CTA
- `/support-programs/apply/*`: 신청 진행 상태와 제출 서류 상태
- `/support-programs/apply/consult/*`: 상담 예약 가능 일정, 예약 완료 데이터
- `/interest`: 관심사업 알림 안내 상태
- `/`: 이용자 수, 핵심 서비스 카드, 통계 지표

API 호출 로직은 화면 컴포넌트 내부에 직접 두기보다 추후 `src/services` 또는 `src/lib/api` 계층으로 분리하는 방향을 권장합니다.
