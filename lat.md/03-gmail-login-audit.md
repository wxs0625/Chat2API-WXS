# Gmail Login Audit

Gmail login should be treated as a provider capability, not a universal fix.

## Provider Reality

- Some Chinese providers expose only phone-number verification; this fork cannot bypass that requirement.
- Some providers support third-party OAuth but may block embedded browsers or require region-specific verification.
- The project should maximize Gmail-capable providers while clearly labeling providers that require phone login.

## Audit Checklist

For each provider:

- Confirm supported login methods from provider UI or current OAuth adapter.
- Record whether Gmail/Google OAuth is first-class, indirect, blocked, or absent.
- Identify token extraction source: cookie, local storage, response header, OAuth callback, or credential file.
- Test whether the token validation endpoint works with Google-authenticated accounts.
- Update UI help text so users do not waste time on phone-only providers.

## UI Outcome

Provider account dialogs should make login constraints visible:

- `Google/Gmail supported`
- `Phone required`
- `Manual token only`
- `Unknown / needs verification`

## Security Constraint

Do not automate phone verification bypass, CAPTCHA bypass, credential stuffing, or any flow intended to evade provider access controls.
