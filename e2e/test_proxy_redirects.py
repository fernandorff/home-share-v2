"""Verifies Clerk proxy protects dashboard routes.

Must run against a dev server WITHOUT `E2E_TESTING=1` so the middleware
redirects anonymous traffic instead of bypassing.
"""

from __future__ import annotations

import os
import sys
from dataclasses import dataclass
from typing import Callable

from playwright.sync_api import Page, sync_playwright

BASE_URL = os.environ.get("BASE_URL", "http://localhost:3003")


@dataclass
class TestResult:
    name: str
    passed: bool


results: list[TestResult] = []


def test(name: str) -> Callable[[Callable[[Page], None]], Callable[[Page], None]]:
    def decorator(fn: Callable[[Page], None]) -> Callable[[Page], None]:
        def wrapper(page: Page) -> None:
            try:
                fn(page)
                results.append(TestResult(name, True))
                print(f"PASS  {name}")
            except Exception as exc:
                results.append(TestResult(name, False))
                print(f"FAIL  {name}: {exc}")

        return wrapper

    return decorator


@test("proxy redirects / -> /auth/sign-in with returnBackUrl preserved")
def check_root_redirect(page: Page) -> None:
    page.goto(f"{BASE_URL}/", wait_until="domcontentloaded")
    assert "/auth/sign-in" in page.url, f"Unexpected URL: {page.url}"
    assert "redirect_url" in page.url, "Missing returnBackUrl in query"


@test("proxy redirects /onboarding -> /auth/sign-in")
def check_onboarding_redirect(page: Page) -> None:
    page.goto(f"{BASE_URL}/onboarding", wait_until="domcontentloaded")
    assert "/auth/sign-in" in page.url


@test("proxy redirects /despesas -> /auth/sign-in")
def check_despesas_redirect(page: Page) -> None:
    page.goto(f"{BASE_URL}/despesas", wait_until="domcontentloaded")
    assert "/auth/sign-in" in page.url


@test("proxy redirects /membros -> /auth/sign-in")
def check_membros_redirect(page: Page) -> None:
    page.goto(f"{BASE_URL}/membros", wait_until="domcontentloaded")
    assert "/auth/sign-in" in page.url


@test("proxy redirects /ajustes -> /auth/sign-in")
def check_ajustes_redirect(page: Page) -> None:
    page.goto(f"{BASE_URL}/ajustes", wait_until="domcontentloaded")
    assert "/auth/sign-in" in page.url


@test("proxy allows /auth/sign-in without redirect")
def check_signin_public(page: Page) -> None:
    response = page.goto(f"{BASE_URL}/auth/sign-in", wait_until="domcontentloaded")
    assert response is not None and response.status == 200
    assert page.url.endswith("/auth/sign-in")


@test("proxy allows /auth/sign-up without redirect")
def check_signup_public(page: Page) -> None:
    response = page.goto(f"{BASE_URL}/auth/sign-up", wait_until="domcontentloaded")
    assert response is not None and response.status == 200
    assert page.url.endswith("/auth/sign-up")


def main() -> int:
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        try:
            page = browser.new_context(viewport={"width": 1440, "height": 900}).new_page()
            for check in (
                check_root_redirect,
                check_onboarding_redirect,
                check_despesas_redirect,
                check_membros_redirect,
                check_ajustes_redirect,
                check_signin_public,
                check_signup_public,
            ):
                check(page)
        finally:
            browser.close()

    passed = sum(1 for r in results if r.passed)
    failed = sum(1 for r in results if not r.passed)
    print(f"\n{passed} passed, {failed} failed")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
