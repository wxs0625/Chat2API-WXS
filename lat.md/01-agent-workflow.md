# Agent Workflow

This fork uses `lat.md/` as the shared project memory for the orchestrator, Jules sessions, and future coding agents.

## Rules

- Read `AGENTS.md` and relevant `lat.md/` files before changing provider, OAuth, proxy, or i18n code.
- Update `lat.md/` when a task changes architecture, provider behavior, authentication behavior, or test strategy.
- Keep changes surgical: do not rewrite unrelated provider code while adding a new provider.
- Prefer tests or fixtures around provider adapters before touching broader proxy behavior.
- Never hardcode user cookies, OAuth tokens, API keys, Google account data, or phone numbers.

## Orchestrator Responsibilities

- Maintain the GitHub fork and task branches.
- Split work into independent Jules tasks with clear write scopes.
- Review Jules output for architecture, security, and consistency with existing provider patterns.
- Keep a provider capability matrix current as research discovers usable Google/Gmail routes.

## Jules Task Template

Each delegated task should include:

- Goal and exact files or directories in scope.
- Relevant `lat.md/` files to read first.
- Expected output, tests to run, and files not to touch.
- Security constraints, especially around tokens and captured browser traffic.
