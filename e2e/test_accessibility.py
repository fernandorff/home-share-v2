"""Accessibility audit via axe-core on every public + dashboard route.

Uses `axe-playwright-python` (official axe-core wrapper) to flag
WCAG 2.2 AA violations. Tests fail on `serious` or `critical` impact;
`moderate` and `minor` are reported but do not block.

Requires `E2E_TESTING=1 npm run dev` so dashboard shells are reachable.
"""

from __future__ import annotations

import json
import os
import sys
from dataclasses import dataclass, field
from typing import Any, Callable

from axe_playwright_python.sync_playwright import Axe
from playwright.sync_api import Page, Route, sync_playwright

BASE_URL = os.environ.get("BASE_URL", "http://localhost:3005")
BLOCKING_IMPACTS = {"serious", "critical"}

MOCK_GROUP = {
    "id": 1, "publicId": "grp-1", "name": "Teste", "description": None,
    "members": [{
        "id": 101, "userId": 1, "groupId": 1, "role": "ADMIN",
        "user": {"id": 1, "publicId": "usr-1", "name": "Fernando", "isGuest": False, "email": "f@t.dev"},
    }],
    "_count": {"expenses": 0},
}


@dataclass
class TestResult:
    name: str
    passed: bool
    blocking_violations: list[str] = field(default_factory=list)
    total_violations: int = 0


results: list[TestResult] = []


def mock_dashboard_api(page: Page) -> None:
    def handle(route: Route) -> None:
        url = route.request.url
        method = route.request.method
        if url.endswith("/api/groups") and method == "GET":
            route.fulfill(status=200, content_type="application/json",
                          body=json.dumps({"groups": [MOCK_GROUP]}))
        elif "/expenses" in url and method == "GET":
            route.fulfill(status=200, content_type="application/json",
                          body=json.dumps({"expenses": [], "pagination": {"page": 1, "pageSize": 50, "total": 0, "totalPages": 1}}))
        elif "/balances" in url and method == "GET":
            route.fulfill(status=200, content_type="application/json",
                          body=json.dumps({"balances": [], "settlements": [], "totalExpenses": 0}))
        else:
            route.fallback()

    page.route("**/api/groups**", handle)


def audit(axe: Axe, page: Page, label: str, mock: bool = False) -> TestResult:
    if mock:
        mock_dashboard_api(page)
    page.goto(f"{BASE_URL}{label if label.startswith('/') else '/' + label}", wait_until="networkidle")
    page.wait_for_timeout(2000)  # Wait for Clerk + hydration
    response: dict[str, Any] = axe.run(page).response
    violations = response.get("violations", [])
    blocking = [v for v in violations if v.get("impact") in BLOCKING_IMPACTS]
    result = TestResult(
        name=f"a11y {label}",
        passed=len(blocking) == 0,
        blocking_violations=[f"{v['id']} ({v['impact']}): {v['description']}" for v in blocking],
        total_violations=len(violations),
    )
    print(f"{'PASS' if result.passed else 'FAIL'}  {result.name}  "
          f"(total={result.total_violations}, blocking={len(blocking)})")
    for line in result.blocking_violations:
        print(f"       - {line}")
    return result


def main() -> int:
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        try:
            context = browser.new_context(viewport={"width": 1440, "height": 900})
            page = context.new_page()
            axe = Axe()

            routes = [
                ("/auth/sign-in", False),
                ("/auth/sign-up", False),
                ("/", True),
                ("/onboarding", False),
                ("/despesas", False),
                ("/membros", False),
                ("/ajustes", False),
            ]
            for path, with_mock in routes:
                results.append(audit(axe, page, path, mock=with_mock))
        finally:
            browser.close()

    passed = sum(1 for r in results if r.passed)
    failed = sum(1 for r in results if not r.passed)
    total_viols = sum(r.total_violations for r in results)
    print(f"\n{passed} passed, {failed} failed. {total_viols} total a11y violations across all routes.")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
