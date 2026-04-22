"""E2E coverage for dashboard routes.

Runs with the proxy temporarily allowing /, /onboarding, /despesas,
/membros and /ajustes as public so the frontend can be exercised
without a live Clerk session. /api/groups still returns 401 so the
dashboard lands in DashboardEmptyState — tests assert that empty
contract plus the static nav destinations.
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


def wait_for_dashboard_ready(page: Page) -> None:
    """Group context resolves (either loads or errors out). Then DashboardEmptyState renders."""
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(2000)


@test("/ shows DashboardEmptyState when unauthenticated api returns 401")
def check_dashboard_empty(page: Page) -> None:
    page.goto(f"{BASE_URL}/", wait_until="networkidle")
    wait_for_dashboard_ready(page)
    heading = page.get_by_role("heading", name="Você ainda não está em nenhum grupo.")
    expect(heading).to_be_visible()


@test("/ empty state offers a 'Criar meu grupo' link to /onboarding")
def check_empty_state_cta(page: Page) -> None:
    page.goto(f"{BASE_URL}/", wait_until="networkidle")
    wait_for_dashboard_ready(page)
    link = page.get_by_role("link", name="Criar meu grupo")
    expect(link).to_be_visible()
    assert "/onboarding" in (link.get_attribute("href") or "")


@test("/ renders the TopNavBar brand mark")
def check_topnav_brand(page: Page) -> None:
    page.goto(f"{BASE_URL}/", wait_until="networkidle")
    wait_for_dashboard_ready(page)
    # brand appears both in TopNav and mobile banner on smaller viewports
    expect(page.get_by_text("Home Share").first).to_be_visible()


@test("/ renders BottomNav only on mobile viewport")
def check_bottom_nav_mobile(page: Page) -> None:
    page.set_viewport_size({"width": 390, "height": 844})
    page.goto(f"{BASE_URL}/", wait_until="networkidle")
    wait_for_dashboard_ready(page)
    nav = page.get_by_label("Navegação principal")
    expect(nav).to_be_visible()
    # 5 interactive items: Início, Despesas, FAB (Nova despesa), Grupo, Ajustes
    for label in ("Início", "Despesas", "Grupo", "Ajustes"):
        expect(nav.get_by_text(label).first).to_be_visible()
    expect(page.get_by_label("Nova despesa").first).to_be_visible()
    page.set_viewport_size({"width": 1440, "height": 900})


@test("/onboarding renders the CreateGroupForm with a required name field")
def check_onboarding_form(page: Page) -> None:
    page.goto(f"{BASE_URL}/onboarding", wait_until="networkidle")
    expect(page.get_by_role("heading", name="Vamos criar seu primeiro lar.")).to_be_visible()
    name_input = page.locator("#group-name")
    expect(name_input).to_be_visible()
    assert name_input.get_attribute("required") is not None, "Name field should be required"
    submit = page.get_by_role("button", name="Criar grupo")
    expect(submit).to_be_visible()


@test("/onboarding disables submit when name is empty")
def check_onboarding_submit_disabled(page: Page) -> None:
    page.goto(f"{BASE_URL}/onboarding", wait_until="networkidle")
    submit = page.get_by_role("button", name="Criar grupo")
    expect(submit).to_be_disabled()


@test("/onboarding enables submit when name is filled")
def check_onboarding_submit_enabled(page: Page) -> None:
    page.goto(f"{BASE_URL}/onboarding", wait_until="networkidle")
    page.locator("#group-name").fill("Meu lar")
    submit = page.get_by_role("button", name="Criar grupo")
    expect(submit).to_be_enabled()


@test("/despesas renders SoonPage placeholder with 'Voltar para o painel' CTA")
def check_despesas_soon(page: Page) -> None:
    page.goto(f"{BASE_URL}/despesas", wait_until="networkidle")
    expect(page.get_by_role("heading", name="Tela de despesas completa em breve.")).to_be_visible()
    link = page.get_by_role("link", name="Voltar para o painel")
    expect(link).to_be_visible()
    assert link.get_attribute("href") == "/"


@test("/membros renders SoonPage placeholder")
def check_membros_soon(page: Page) -> None:
    page.goto(f"{BASE_URL}/membros", wait_until="networkidle")
    expect(page.get_by_role("heading", name="Gestão de moradores chegando em breve.")).to_be_visible()


@test("/ajustes renders SoonPage placeholder")
def check_ajustes_soon(page: Page) -> None:
    page.goto(f"{BASE_URL}/ajustes", wait_until="networkidle")
    expect(page.get_by_role("heading", name="Ajustes em desenvolvimento.")).to_be_visible()


@test("mobile FAB links to /?nova=1 so it opens the modal on the dashboard")
def check_fab_href(page: Page) -> None:
    page.set_viewport_size({"width": 390, "height": 844})
    page.goto(f"{BASE_URL}/", wait_until="networkidle")
    wait_for_dashboard_ready(page)
    fab = page.get_by_label("Nova despesa").first
    href = fab.get_attribute("href") or ""
    assert "/?nova=1" in href, f"Unexpected FAB href: {href}"
    page.set_viewport_size({"width": 1440, "height": 900})


def main() -> int:
    SCREENSHOT_DIR.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        try:
            context = browser.new_context(viewport={"width": 1440, "height": 900})
            page = context.new_page()
            for check in (
                check_dashboard_empty,
                check_empty_state_cta,
                check_topnav_brand,
                check_bottom_nav_mobile,
                check_onboarding_form,
                check_onboarding_submit_disabled,
                check_onboarding_submit_enabled,
                check_despesas_soon,
                check_membros_soon,
                check_ajustes_soon,
                check_fab_href,
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
