# Russian UI Plan

Russian localization should be added through the existing i18next locale structure.

## Current State

- Locale files exist for `en-US` and `zh-CN`.
- UI strings are mostly referenced with `t(...)` keys.
- A Russian locale can start as a full JSON copy translated from `en-US` and then be refined screen by screen.

## Implementation Path

- Add `src/renderer/src/i18n/locales/ru-RU.json`.
- Register `ru-RU` in `src/renderer/src/i18n/index.ts`.
- Ensure settings language picker exposes Russian if language options are hardcoded elsewhere.
- Translate provider/login copy carefully, especially warnings about Gmail and phone-only providers.
- Add or update tests if locale loading is covered.

## Quality Bar

- Keep JSON key structure identical across locale files.
- Do not translate provider brand names.
- Prefer concise Russian UI text over literal machine translation.
