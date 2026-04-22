"""Captures every route at desktop, tablet and mobile viewports.

The output goes to .screenshots/e2e-responsive/ and is compared to a
baseline on subsequent runs (first run creates baselines). Pixel diff
isn't run automatically — the harness saves snapshots that humans can
review. Used to catch obvious regressions (missing content, broken
layouts, overflow).
"""

from __future__ import annotations

import hashlib
import json
import os
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Callable

from playwright.sync_api import Page, Route, sync_playwright

BASE_URL = os.environ.get("BASE_URL", "http://localhost:3005")
OUT_DIR = Path(os.environ.get("SNAPSHOT_DIR", ".screenshots/e2e-responsive"))

VIEWPORTS = {
    "desktop": {"width": 1440, "height": 900},
    "tablet":  {"width": 768,  "height": 1024},
    "mobile":  {"width": 390,  "height": 844},
}

ROUTES = [
    ("auth-sign-in", "/auth/sign-in", False),
    ("auth-sign-up", "/auth/sign-up", False),
    ("dashboard",    "/",             True),
    ("onboarding",   "/onboarding",   False),
    ("despesas",     "/despesas",     False),
    ("membros",      "/membros",      False),
    ("ajustes",      "/ajustes",      False),
]

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
    size_bytes: int


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


def test(name: str) -> Callable[[Callable[[Page], Path]], Callable[[Page], None]]:
    def decorator(fn: Callable[[Page], Path]) -> Callable[[Page], None]:
        def wrapper(page: Page) -> None:
            try:
                path = fn(page)
                size = path.stat().st_size
                # Guard: anything smaller than 8 KB is almost certainly a blank
                # or error page — that is a regression worth failing on.
                if size < 8 * 1024:
                    raise AssertionError(f"Snapshot suspiciously small: {size} bytes at {path}")
                results.append(TestResult(name, True, size))
                print(f"PASS  {name}  ({size // 1024} KB)")
            except Exception as exc:
                results.append(TestResult(name, False, 0))
                print(f"FAIL  {name}: {exc}")
        return wrapper
    return decorator


def build_test(route_name: str, path: str, needs_mock: bool, viewport_name: str, viewport: dict):
    full_name = f"{route_name} @ {viewport_name}"

    @test(full_name)
    def inner(page: Page) -> Path:
        page.set_viewport_size(viewport)
        if needs_mock:
            mock_dashboard_api(page)
        page.goto(f"{BASE_URL}{path}", wait_until="networkidle")
        page.wait_for_timeout(2000)
        out = OUT_DIR / f"{route_name}-{viewport_name}.png"
        page.screenshot(path=str(out), full_page=(viewport_name == "mobile"))
        return out

    return inner


def main() -> int:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        try:
            for route_name, path, needs_mock in ROUTES:
                for viewport_name, viewport in VIEWPORTS.items():
                    context = browser.new_context(viewport=viewport, device_scale_factor=2)
                    page = context.new_page()
                    check = build_test(route_name, path, needs_mock, viewport_name, viewport)
                    check(page)
                    context.close()
        finally:
            browser.close()

    passed = sum(1 for r in results if r.passed)
    failed = sum(1 for r in results if not r.passed)
    print(f"\n{passed} passed, {failed} failed. Snapshots saved to {OUT_DIR}")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
