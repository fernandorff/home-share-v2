# E2E test harness

Playwright-based integration tests driven by Python. Follows the
pattern from the `anthropics/skills@webapp-testing` skill: reconnaissance
first (wait for `networkidle` and Clerk hydration), then action.

## Setup

```bash
pip install playwright
python -m playwright install chromium
```

## Running

```bash
# 1. Auth-page and proxy tests (production proxy behavior)
npm run dev                     # plain dev, redirects are on
python e2e/test_auth_pages.py
python e2e/test_proxy_redirects.py

# 2. Dashboard shell tests (proxy bypassed for frontend-only coverage)
E2E_TESTING=1 npm run dev       # dev-only: proxy lets every route through
python e2e/test_dashboard_shell.py
```

`PYTHONIOENCODING=utf-8 BASE_URL=http://localhost:PORT` environment vars
may be needed on Windows and when the dev server grabs a non-default port.

## What's covered

| File | Scope | Count |
|------|-------|-------|
| `test_proxy_redirects.py` | Clerk middleware redirects + auth-page publicity | 7 |
| `test_auth_pages.py` | Sign-in / Sign-up visual contracts, ptBR placeholders | 8 |
| `test_dashboard_shell.py` | Route-group layout, empty states, nav placeholders, mobile FAB href | 11 |
| `test_dashboard_interactions.py` | Modals (Nova despesa, Settle up), view toggle, kebab menu — uses `page.route` to stub the API | 8 |

**Total: 34 checks.**

## Gotchas

- Clerk is client-side only — the SSR'd HTML has no inputs. Always wait
  for `.cl-rootBox` or the first Clerk input before asserting on form
  slots.
- Multiple `<h1>` elements may exist (ours visible, Clerk's
  `display:none` but in DOM). Filter with `h1:visible` or
  `.first` locators.
- The mobile FAB (`Nova despesa` floating button) links to
  `/?nova=1`; the dashboard page intercepts that query param and opens
  the expense modal instead of routing.
