# Tetrix Web

React·TypeScript로 만든 브라우저 낙하 블록 게임입니다. 충돌·회전·라인 제거·점수·피스 공급을 별도 모듈로 나누고, UI와 핵심 동작을 회귀 테스트로 확인합니다.

문서·코드 버전: **0.1.0**

## 주요 구현

- 10×20 보드, 7종 피스, 회전과 wall kick, 고스트 피스, 홀드, 다음 피스 표시
- 라인 제거·레벨·combo·back-to-back·드롭 점수
- 키보드와 터치·pointer·키보드로 활성화 가능한 화면 버튼
- 시작·일시정지·재시작과 이 브라우저의 상위 10개 기록
- 게임별 난수 상태를 포함하는 결정적인 reducer와 seven-bag 공급
- 손상되거나 크기가 과도한 저장 데이터, 저장소 차단·용량 부족의 실패 처리

공식 게임 제품이나 해당 권리자와 제휴한 프로젝트가 아니며, 특정 게임 규격의 인증이나 완전한 호환성을 주장하지 않습니다.

## 실행

Node.js **24.22.1 이상 25 미만**과 npm을 사용합니다. lockfile은 npm용입니다.

```sh
git clone https://github.com/zeztto/tetrix-web.git
cd tetrix-web
npm ci --ignore-scripts
npm run dev -- --host 127.0.0.1
```

개발 서버가 출력한 로컬 주소를 엽니다. 정적 build와 로컬 preview:

```sh
npm run build
npm run preview -- --host 127.0.0.1
```

운영 배포·도메인·서버 계정 설정은 포함하지 않습니다. `npm run dev`는 개발용이며 인터넷에 직접 노출하지 마세요.

## 검사

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm audit --omit=dev --audit-level=low
npm audit --audit-level=low
```

확인한 환경·범위는 [검증 기록](docs/verification.md), 보안 경계는 [SECURITY.md](SECURITY.md)를 참고하세요. 정적 검사·자동 테스트·브라우저 검증은 서로 다른 확인 단계입니다.

## 구조

| 경로 | 책임 |
| --- | --- |
| `src/lib/` | 보드·충돌·회전·라인·점수·state-owned randomizer·저장 검증 |
| `src/hooks/` | 순수 game reducer, animation loop, 키보드·순위표 상태 |
| `src/components/game/` | 보드와 피스, 입력 버튼, 기록·게임 종료 화면 |
| `src/components/ui/` | shadcn/ui에서 가져와 조정한 기본 UI |
| `src/__tests__/` | 엔진·저장소·StrictMode·입력·화면 흐름 회귀 |

## 데이터와 한계

- 점수와 입력한 이름은 `tetris_leaderboard`라는 localStorage 키에만 저장합니다. 정적 앱 코드에 서버 전송·추적·인증 기능은 없습니다.
- 기록은 기기·브라우저 간 공유되지 않으며, 사용자가 변경·삭제할 수 있습니다. 저장소가 차단되면 게임은 계속할 수 있지만 점수 저장은 실패할 수 있습니다.
- 피스 순서를 위한 PRNG는 게임 재현용이며 암호학적 보안·금전 추첨·공정한 온라인 순위 인증용이 아닙니다.
- 모든 브라우저·장치·게임 규격·접근성 요구의 완전한 지원을 보증하지 않습니다.
- 실제 사용자 기록·운영 설정·과거 Git 이력·비공개 자료·원본 로그는 포함하지 않습니다.

## 라이선스

직접 작성한 코드의 라이선스는 [MIT](LICENSE)입니다. UI 기반 코드·아이콘·라이브러리의 권리는 각각의 원저작자에게 있으며, [제3자 고지](THIRD_PARTY_NOTICES.md)와 [라이선스 원문](THIRD_PARTY_LICENSES/npm-runtime-notices.txt)을 함께 제공합니다.
