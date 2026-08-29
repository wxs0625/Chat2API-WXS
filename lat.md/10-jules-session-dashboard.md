# Jules Session Dashboard

This file tracks active and important Jules sessions so the orchestrator can monitor them without relying on the web UI.

## Active Sessions

| Session ID | Task | Scope | State | PR | Last Checked | Next Action |
| --- | --- | --- | --- | --- | --- | --- |

## Open PRs

| PR | Title | State | Branch | Notes | Next Action |
| --- | --- | --- | --- | --- | --- |
| `#1` | Add implementation plan for Google Gemini provider | Open draft | `google-gemini-plan-2815913142746213638` | Based on older `main`; plan needs update against current docs and architecture before merge. | Review and update after current implementation PRs settle. |

## Completed / Canceled Sessions

| Session ID | Task | Outcome |
| --- | --- | --- |
| `15060948750619103072` | Add provider login capability labels | Completed; draft PR `#3` reviewed, refactored, and merged into `main` as `b1efb45`. |
| local | Improve Z.ai captcha-assisted login | Completed directly by orchestrator; browser-assisted request-body capture for `captcha_verify_param` merged as `479bc2d`. |
| `6183751859949730638` | Add Russian localization | Completed; draft PR `#2` merged into `main` as `27f2f90`. |
| `2815913142746213638` | Research Gemini Code Assist integration | Completed; created draft PR `#1`. |
| `2984572509670563777` | Research Antigravity provider integration | Completed; activity feed unavailable through API. |
| `13015313924206141005` | Plan Russian localization | Completed; activity feed unavailable through API. |
| `11939979990376381143` | Audit Gmail-capable provider login flows | Canceled as stuck. |
| `13185114484477059653` | Audit current provider login capabilities | Completed; activity feed unavailable, local audit captured in `lat.md/08-provider-login-capability-audit.md`. |

## Monitoring Rules

- Reuse existing Jules sessions with `manage_session` for clarifications whenever possible.
- Do not create duplicate Jules sessions for the same scope unless the prior session is failed, canceled, or needs independent review.
- Treat long `IN_PROGRESS` without PR or activity as suspicious after 15-20 minutes; check status, then either send a follow-up or cancel.
- Every Jules PR must receive orchestrator diff review, at least one independent quick review when practical, and targeted validation before merge.
