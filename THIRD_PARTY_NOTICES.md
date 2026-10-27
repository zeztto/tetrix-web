# 제3자 고지

root MIT LICENSE는 직접 작성한 코드에 적용합니다. 다음 원본의 저작권·라이선스를 대체하지 않습니다. 이 프로젝트는 해당 기술의 저작자나 upstream 기여 실적으로 소개하지 않습니다.

## 포함한 UI 기반 코드

`src/components/ui/{button,card,dialog,input}.tsx`는 [shadcn/ui](https://github.com/shadcn-ui/ui)의 MIT UI 패턴·코드를 바탕으로 조정했습니다. Copyright (c) 2023 shadcn. [원문 MIT](THIRD_PARTY_LICENSES/shadcn-ui-MIT.txt)를 유지합니다.

## 사용하는 라이브러리

- React·React DOM: Meta 및 React 기여자의 MIT 라이브러리.
- Radix UI: WorkOS의 MIT primitive. Dialog·Slot과 해당 의존 모듈을 사용합니다.
- Lucide: Lucide 기여자의 ISC 아이콘이며 Feather 기반 아이콘의 MIT 고지가 포함됩니다.
- class-variance-authority 0.7.1: Joe Bell의 Apache-2.0 라이브러리. 해당 Apache 라이선스 원문은 아래 묶음 파일에 포함합니다.
- clsx·tailwind-merge: 각각 원저작자의 MIT 라이브러리.
- Tailwind CSS: Tailwind Labs의 MIT 도구.

설치된 runtime 의존성과 Tailwind의 라이선스 원문을 [npm runtime notices](THIRD_PARTY_LICENSES/npm-runtime-notices.txt)에 묶었습니다. 해당 파일의 package별 copyright와 허가 조건을 유지하세요. 개발 도구의 라이선스도 설치 패키지에서 별도로 확인할 수 있습니다.

확인일: 2026-10-27. 의존성을 변경하면 lockfile·고지·검증 결과를 함께 갱신해야 합니다. 공식 게임 브랜드와의 제휴나 후원을 의미하지 않습니다.
