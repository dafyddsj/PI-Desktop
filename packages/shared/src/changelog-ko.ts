import type { ChangelogEntry } from "./changelog.js";

export const koEntries: ChangelogEntry[] = [
  {
    "version": "0.1.0",
    "highlights": [
      "PI-Desktop을 기반으로 한 첫 EXplore Agent 릴리스입니다.",
      "에이전트 설정, 로그인, 프롬프트, 지침은 ~/.explore/agent와 각 프로젝트의 .explore 폴더에 저장되며 pi CLI 설치와 분리됩니다.",
      "앱 데이터(세션, 로그, 공급자 키)는 ~/.explore/app에 저장됩니다.",
    ],
  },
];
