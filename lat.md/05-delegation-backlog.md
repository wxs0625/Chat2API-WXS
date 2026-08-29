# Delegation Backlog

This backlog tracks tasks suitable for Jules or sub-agents after the fork is pushed to GitHub.

## Ready Tasks

1. Research existing open-source Gemini web chat API implementations and summarize request/auth/session patterns.
2. Research Gemini CLI credential format and whether it can be reused safely by Chat2API.
3. Research Antigravity CLI credential/request path and compare it to Gemini CLI.
4. Audit current provider login adapters for Gmail/Google OAuth support and phone-only blockers.
5. Add `ru-RU` locale with key parity against `en-US` and `zh-CN`.
6. Design Google Gemini provider adapter skeleton with tests but no hardcoded secrets.

## Not Ready Until Research Completes

- Implementing real Gemini web chat forwarding.
- Automated Google account login.
- Importing browser cookies or CLI credentials.

## Acceptance Criteria For Research Tasks

Each research task should return:

- Repositories or files inspected.
- Concrete endpoints, request shapes, headers, and auth material names when found.
- Security/privacy risks.
- A recommendation for the Chat2API integration path.
