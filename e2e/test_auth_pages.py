"""E2E coverage for the public auth surface.

Each test documents one visible contract so the output reads like a
feature spec. Tests wait for Clerk's client-side mount before asserting
on the form slots (Clerk widgets are not SSR'd).
"""

from __future__ import annotations

import os
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Callable

from playwright.sync_api import Page, sync_playwright, expect

BASE_URL = os.environ.get("BASE_URL", "http://localhost:3005")
SCREENSHOT_DIR = Path(os.environ.get("SCREENSHOT_DIR", ".screenshots/e2e"))


@dataclass
class TestResult:
    name: str
    passed: bool
    detail: str


results: list[TestResult] = []


def test(name: str) -> Callable[[Callable[[Page], None]], Callable[[Page], None]]:
    def decorator(fn: Callable[[Page], None]) -> Callable[[Page], None]:
        def wrapper(page: Page) -> None:
            try:
                fn(page)
                results.append(TestResult(name, True, "ok"))
                print(f"PASS  {name}")
            except Exception as exc:
                results.append(TestResult(name, False, repr(exc)))
                print(f"FAIL  {name}: {exc}")

        return wrapper

    return decorator


def wait_for_clerk(page: Page) -> None:
    """Clerk renders entirely client-side — wait for at least one widget input."""
    page.wait_for_selector(
        ".cl-rootBox, input[name='identifier'], input[name='emailAddress']",
        timeout=20000,
    )


@test("sign-in page renders visible h1 'Bem-vindo ao lar.'")
def check_sign_in_heading(page: Page) -> None:
    page.goto(f"{BASE_URL}/auth/sign-in", wait_until="networkidle")
    heading = page.locator("h1:visible").first
    expect(heading).to_contain_text("Bem-vindo ao lar.")


@test("sign-in page surfaces the brand mark Home Share")
def check_sign_in_brand(page: Page) -> None:
    page.goto(f"{BASE_URL}/auth/sign-in", wait_until="networkidle")
    expect(page.get_by_text("Home Share").first).to_be_visible()


@test("sign-in page exposes Clerk identifier field after hydration")
def check_sign_in_clerk(page: Page) -> None:
    page.goto(f"{BASE_URL}/auth/sign-in", wait_until="networkidle")
    wait_for_clerk(page)
    identifier = page.locator("input[name='identifier']")
    expect(identifier).to_be_visible()


@test("sign-in page shows switch CTA linking to /auth/sign-up")
def check_sign_in_switch(page: Page) -> None:
    page.goto(f"{BASE_URL}/auth/sign-in", wait_until="networkidle")
    link = page.get_by_role("link", name="Crie sua conta gratuitamente")
    expect(link).to_be_visible()
    href = link.get_attribute("href") or ""
    assert "/auth/sign-up" in href, f"Unexpected href: {href}"


@test("sign-up page renders visible h1 'Bem-vindo ao Home Share!'")
def check_sign_up_heading(page: Page) -> None:
    page.goto(f"{BASE_URL}/auth/sign-up", wait_until="networkidle")
    heading = page.locator("h1:visible").first
    expect(heading).to_contain_text("Bem-vindo ao Home Share!")


@test("sign-up password placeholder is localized to ptBR")
def check_sign_up_password_placeholder(page: Page) -> None:
    page.goto(f"{BASE_URL}/auth/sign-up", wait_until="networkidle")
    wait_for_clerk(page)
    password = page.locator("input[name='password']")
    expect(password).to_be_visible()
    placeholder = password.get_attribute("placeholder") or ""
    assert "senha" in placeholder.lower(), f"Placeholder not in ptBR: {placeholder!r}"
    assert "create" not in placeholder.lower(), f"Leaked English: {placeholder!r}"


@test("sign-up page firstName and lastName fields are both visible")
def check_sign_up_name_fields(page: Page) -> None:
    page.goto(f"{BASE_URL}/auth/sign-up", wait_until="networkidle")
    wait_for_clerk(page)
    expect(page.locator("input[name='firstName']")).to_be_visible()
    expect(page.locator("input[name='lastName']")).to_be_visible()


@test("sign-up page shows Entrar switch CTA (our link, not Clerk's)")
def check_sign_up_switch(page: Page) -> None:
    page.goto(f"{BASE_URL}/auth/sign-up", wait_until="networkidle")
    # Our AuthSwitchCta uses relative href; Clerk also emits an absolute one.
    our_link = page.locator("a[href='/auth/sign-in']").first
    expect(our_link).to_be_visible()


def main() -> int:
    SCREENSHOT_DIR.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        try:
            context = browser.new_context(viewport={"width": 1440, "height": 900})
            page = context.new_page()
            for check in (
                check_sign_in_heading,
                check_sign_in_brand,
                check_sign_in_clerk,
                check_sign_in_switch,
                check_sign_up_heading,
                check_sign_up_password_placeholder,
                check_sign_up_name_fields,
                check_sign_up_switch,
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
