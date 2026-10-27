# 검증 기록

버전: **0.1.0** · 확인일: **2026-10-27**

## 실행한 검사

Node.js 24.22.1 환경에서 다음 명령을 실행했습니다.

| 검사 | 결과 |
| --- | --- |
| `npm ci --ignore-scripts` | PASS. dependency lifecycle script 실행 없이 설치 |
| `npm run lint` | PASS. ESLint 10.13.0과 정식 지원 peer 조합 |
| `npm run typecheck` | PASS |
| `npm test` | PASS. 13개 파일, 175개 테스트 |
| `npm run build` | PASS. Vite 7.3.7 정적 build |
| `npm audit --omit=dev --json` | 알려진 취약점 0 |
| `npm audit --json` | 알려진 취약점 0 |

새 공개용 회귀를 적용하기 전 12개 테스트의 실패로 공유 큐·저장소 문제를 확인했고, 수정 후 통과했습니다. 이후 StrictMode·UI 흐름·입력·홀드 충돌의 회귀를 추가했습니다.

## 회귀 범위

- 같은 state·action을 재실행해도 피스와 큐가 같으며, reducer에서 외부 난수를 소비하지 않음
- 두 게임의 독립성, 여러 bag 경계의 seven-bag 구성
- StrictMode의 시작·홀드가 미리 표시한 피스를 정확히 한 개씩 소비
- initial hold·swap hold의 spawn 충돌과 보드 보존, 게임 종료 후 drop·lock 거부
- 잘못된 JSON·스키마·숫자·날짜·큰 값과 저장소 read/write/clear 거부
- 점수 저장 실패를 성공으로 표시하지 않음
- pointer 취소·비활성화·창 blur의 반복 입력 정리
- focused control의 Space 기본 활성화와 일시정지 키보드 재개
- 게임 종료 후 순위표를 닫아도 재시작 경로가 유지됨

## 확인의 경계

이 문서는 코드·자동 테스트·build·의존성 검사 기록입니다. GitHub CI 성공, 공개 설정 변경, main merge, 운영 배포, 모든 브라우저·실기기의 검증을 대신하지 않습니다. 브라우저 실동작과 최종 게시 여부는 별도 확인해야 합니다. dependency advisory 결과는 검사 시점 기준이며 이후 바뀔 수 있습니다.
