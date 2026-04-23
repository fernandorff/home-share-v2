"""Comprehensive click-coverage pass.

Every interactive element on every route receives a real `click()`
(not just `to_be_visible`) and the observable effect is asserted —
URL changes, modal opens, download fires, form submits, etc. Elements
marked as placeholder-only in the source (href="#") are documented as
such rather than failed.

Run against `E2E_TESTING=1 npm run dev` so dashboard shells are
reachable. API responses are stubbed via `page.route` so POST/DELETE
paths can be exercised without hitting the real Neon database.
"""

from __future__ import annotations

import json
import os
import sys
from dataclasses import dataclass
from typing import Callable

from playwright.sync_api import Page, Route, sync_playwright, expect

BASE_URL = os.environ.get("BASE_URL", "http://localhost:3005")

MOCK_GROUP = {
    "id": 1, "publicId": "grp-1", "name": "Apartamento Teste", "description": None,
    "members": [
        {"id": 101, "userId": 1, "groupId": 1, "role": "ADMIN",
         "user": {"id": 1, "publicId": "usr-1", "name": "Fernando", "isGuest": False, "email": "f@t.dev"}},
        {"id": 102, "userId": 2, "groupId": 1, "role": "MEMBER",
         "user": {"id": 2, "publicId": "usr-2", "name": "Tatiana", "isGuest": False, "email": "t@t.dev"}},
    ],
    "_count": {"expenses": 1},
}

MOCK_EXPENSE = {
    "id": 1, "publicId": "exp-1", "groupId": 1, "payerId": 1, "platformId": None,
    "description": "Supermercado", "notes": None, "amount": 100.00,
    "date": "2026-04-12T00:00:00.000Z", "createdAt": "2026-04-12T00:00:00.000Z",
    "payer": {"id": 1, "publicId": "usr-1", "name": "Fernando"},
    "platform": None,
    "participants": [
        {"id": 1, "expenseId": 1, "userId": 1, "amount": 50.00,
         "user": {"id": 1, "publicId": "usr-1", "name": "Fernando"}},
        {"id": 2, "expenseId": 1, "userId": 2, "amount": 50.00,
         "user": {"id": 2, "publicId": "usr-2", "name": "Tatiana"}},
    ],
}

MOCK_BALANCES = {
    "balances": [
        {"userId": 1, "userName": "Fernando", "balance": 50.00},
        {"userId": 2, "userName": "Tatiana", "balance": -50.00},
    ],
    "settlements": [
        {"from": {"id": 2, "name": "Tatiana"}, "to": {"id": 1, "name": "Fernando"}, "amount": 50.00},
    ],
    "totalExpenses": 100.00,
}

EXPORT_CSV_BODY = (
    "data,descricao,pagador,valor\n"
    "2026-04-12,Supermercado,Fernando,100.00\n"
)


@dataclass
class TestResult:
    name: str
    passed: bool
    detail: str = ""


results: list[TestResult] = []
api_calls: list[tuple[str, str]] = []  # (method, url)


def test(name: str) -> Callable[[Callable[[Page], None]], Callable[[Page], None]]:
    def decorator(fn: Callable[[Page], None]) -> Callable[[Page], None]:
        def wrapper(page: Page) -> None:
            try:
                fn(page)
                results.append(TestResult(name, True))
                print(f"PASS  {name}")
            except Exception as exc:
                results.append(TestResult(name, False, str(exc)[:300]))
                print(f"FAIL  {name}: {str(exc)[:200]}")
        return wrapper
    return decorator


def install_full_api_mocks(page: Page) -> None:
    """Mocks every API route the dashboard touches, recording calls for assertions."""

    def handle(route: Route) -> None:
        req = route.request
        api_calls.append((req.method, req.url))
        url = req.url
        method = req.method

        if url.endswith("/api/groups") and method == "GET":
            route.fulfill(status=200, content_type="application/json",
                          body=json.dumps({"groups": [MOCK_GROUP]}))
        elif url.endswith("/api/groups") and method == "POST":
            route.fulfill(status=201, content_type="application/json",
                          body=json.dumps({"group": MOCK_GROUP}))
        elif "/expenses/export" in url and method == "GET":
            route.fulfill(
                status=200,
                headers={
                    "Content-Type": "text/csv; charset=utf-8",
                    "Content-Disposition": 'attachment; filename="despesas-test.csv"',
                },
                body=EXPORT_CSV_BODY,
            )
        elif "/expenses" in url and method == "GET":
            route.fulfill(status=200, content_type="application/json",
                          body=json.dumps({
                              "expenses": [MOCK_EXPENSE],
                              "pagination": {"page": 1, "pageSize": 50, "total": 1, "totalPages": 1},
                          }))
        elif "/expenses" in url and method == "POST":
            route.fulfill(status=201, content_type="application/json",
                          body=json.dumps({"expense": MOCK_EXPENSE}))
        elif "/balances" in url and method == "GET":
            route.fulfill(status=200, content_type="application/json",
                          body=json.dumps(MOCK_BALANCES))
        else:
            route.fallback()

    page.route("**/api/**", handle)


def open_dashboard(page: Page) -> None:
    install_full_api_mocks(page)
    page.goto(f"{BASE_URL}/", wait_until="networkidle")
    page.wait_for_selector("text=Despesas (", timeout=15000)


def api_call_count(method: str, url_fragment: str) -> int:
    return sum(1 for m, u in api_calls if m == method and url_fragment in u)


# =========== CLICK COVERAGE ===========

@test("CLICK desktop 'Nova despesa' opens modal")
def c01(page: Page) -> None:
    open_dashboard(page)
    page.get_by_role("button", name="Nova despesa").first.click()
    expect(page.locator("dialog[open]")).to_be_visible()
    expect(page.locator("dialog[open]").get_by_role("heading", name="Nova despesa")).to_be_visible()


@test("CLICK 'Tabela' view toggle is the default selected")
def c02(page: Page) -> None:
    open_dashboard(page)
    tabela = page.get_by_role("button", name="Tabela", exact=True)
    assert tabela.get_attribute("aria-pressed") == "true"


@test("CLICK 'Por pessoa' toggle switches view and swaps aria-pressed")
def c03(page: Page) -> None:
    open_dashboard(page)
    por_pessoa = page.get_by_role("button", name="Por pessoa", exact=True)
    por_pessoa.click()
    assert por_pessoa.get_attribute("aria-pressed") == "true"
    tabela = page.get_by_role("button", name="Tabela", exact=True)
    assert tabela.get_attribute("aria-pressed") == "false"


@test("CLICK 'Tabela' after 'Por pessoa' switches back")
def c04(page: Page) -> None:
    open_dashboard(page)
    page.get_by_role("button", name="Por pessoa", exact=True).click()
    page.get_by_role("button", name="Tabela", exact=True).click()
    expect(page.get_by_role("columnheader", name="Descrição")).to_be_visible()


@test("CLICK kebab 'Mais opções' toggles dropdown open then closed")
def c05(page: Page) -> None:
    open_dashboard(page)
    trigger = page.get_by_role("button", name="Mais opções").first
    trigger.click()
    expect(page.get_by_role("menuitem", name="Exportar CSV")).to_be_visible()
    trigger.click()
    expect(page.get_by_role("menuitem", name="Exportar CSV")).not_to_be_visible()


@test("CLICK 'Exportar CSV' triggers a download with expected filename")
def c06(page: Page) -> None:
    open_dashboard(page)
    page.get_by_role("button", name="Mais opções").first.click()
    with page.expect_download(timeout=10000) as dl_info:
        page.get_by_role("menuitem", name="Exportar CSV").click()
    download = dl_info.value
    assert download.suggested_filename.endswith(".csv"), f"Unexpected filename: {download.suggested_filename}"
    # Confirm the export API was actually hit
    assert api_call_count("GET", "/expenses/export") >= 1, "Export API never called"


@test("CLICK 'Acertar contas' opens SettleUpModal with settlement row")
def c07(page: Page) -> None:
    open_dashboard(page)
    page.get_by_role("button", name="Acertar contas").click()
    dialog = page.locator("dialog[open]")
    expect(dialog).to_be_visible()
    expect(dialog.get_by_text("Tatiana")).to_be_visible()
    expect(dialog.get_by_text("Fernando").first).to_be_visible()
    expect(dialog.get_by_text("R$ 50,00")).to_be_visible()


@test("CLICK Nova despesa → happy path submit actually POSTs and closes modal")
def c08(page: Page) -> None:
    open_dashboard(page)
    api_calls_before = api_call_count("POST", "/expenses")
    page.get_by_role("button", name="Nova despesa").first.click()
    page.locator("dialog[open]").wait_for()
    page.locator("#expense-description").fill("Pizza")
    page.locator("#expense-amount").fill("5000")  # 50,00
    page.get_by_role("button", name="Salvar despesa").click()
    page.wait_for_selector("dialog[open]", state="detached", timeout=5000)
    api_calls_after = api_call_count("POST", "/expenses")
    assert api_calls_after > api_calls_before, "POST /expenses was not called"


@test("CLICK 'Cancelar' in expense modal closes without submitting")
def c09(page: Page) -> None:
    open_dashboard(page)
    api_calls_before = api_call_count("POST", "/expenses")
    page.get_by_role("button", name="Nova despesa").first.click()
    page.locator("dialog[open]").wait_for()
    page.get_by_role("button", name="Cancelar").click()
    expect(page.locator("dialog[open]")).not_to_be_visible()
    assert api_call_count("POST", "/expenses") == api_calls_before, "Cancel should not POST"


@test("CLICK close X (Fechar) in expense modal dismisses the dialog")
def c10(page: Page) -> None:
    open_dashboard(page)
    page.get_by_role("button", name="Nova despesa").first.click()
    page.locator("dialog[open]").wait_for()
    page.get_by_role("button", name="Fechar").first.click()
    expect(page.locator("dialog[open]")).not_to_be_visible()


@test("CLICK close X in SettleUpModal dismisses it")
def c11(page: Page) -> None:
    open_dashboard(page)
    page.get_by_role("button", name="Acertar contas").click()
    page.locator("dialog[open]").wait_for()
    page.get_by_role("button", name="Fechar").first.click()
    expect(page.locator("dialog[open]")).not_to_be_visible()


# =========== NAV LINKS ===========

@test("CLICK BottomNav 'Despesas' tab navigates to /despesas")
def c12(page: Page) -> None:
    page.set_viewport_size({"width": 390, "height": 844})
    open_dashboard(page)
    page.get_by_label("Navegação principal").get_by_text("Despesas").click()
    page.wait_for_url("**/despesas")
    page.set_viewport_size({"width": 1440, "height": 900})


@test("CLICK BottomNav 'Grupo' tab navigates to /membros")
def c13(page: Page) -> None:
    page.set_viewport_size({"width": 390, "height": 844})
    open_dashboard(page)
    page.get_by_label("Navegação principal").get_by_text("Grupo").click()
    page.wait_for_url("**/membros")
    page.set_viewport_size({"width": 1440, "height": 900})


@test("CLICK BottomNav 'Ajustes' tab navigates to /ajustes")
def c14(page: Page) -> None:
    page.set_viewport_size({"width": 390, "height": 844})
    open_dashboard(page)
    page.get_by_label("Navegação principal").get_by_text("Ajustes").click()
    page.wait_for_url("**/ajustes")
    page.set_viewport_size({"width": 1440, "height": 900})


@test("CLICK FAB 'Nova despesa' links to /?nova=1 and opens modal")
def c15(page: Page) -> None:
    page.set_viewport_size({"width": 390, "height": 844})
    open_dashboard(page)
    # Scope to link role so the modal's aria-labelledby doesn't match
    page.get_by_role("link", name="Nova despesa").click()
    page.wait_for_selector("dialog[open]", timeout=10000)
    page.wait_for_url("**/")
    page.set_viewport_size({"width": 1440, "height": 900})


@test("CLICK 'Voltar para o painel' on /despesas SoonPage navigates to /")
def c16(page: Page) -> None:
    install_full_api_mocks(page)
    page.goto(f"{BASE_URL}/despesas", wait_until="networkidle")
    page.get_by_role("link", name="Voltar para o painel").click()
    page.wait_for_url(f"{BASE_URL}/")


@test("CLICK 'Voltar para o painel' on /membros SoonPage navigates to /")
def c17(page: Page) -> None:
    install_full_api_mocks(page)
    page.goto(f"{BASE_URL}/membros", wait_until="networkidle")
    page.get_by_role("link", name="Voltar para o painel").click()
    page.wait_for_url(f"{BASE_URL}/")


@test("CLICK 'Voltar para o painel' on /ajustes SoonPage navigates to /")
def c18(page: Page) -> None:
    install_full_api_mocks(page)
    page.goto(f"{BASE_URL}/ajustes", wait_until="networkidle")
    page.get_by_role("link", name="Voltar para o painel").click()
    page.wait_for_url(f"{BASE_URL}/")


# =========== AUTH LINKS ===========

@test("CLICK 'Crie sua conta gratuitamente' on sign-in navigates to /auth/sign-up")
def c19(page: Page) -> None:
    page.goto(f"{BASE_URL}/auth/sign-in", wait_until="networkidle")
    page.get_by_role("link", name="Crie sua conta gratuitamente").click()
    page.wait_for_url("**/auth/sign-up")


@test("CLICK 'Entrar' switch on sign-up navigates back to /auth/sign-in")
def c20(page: Page) -> None:
    page.goto(f"{BASE_URL}/auth/sign-up", wait_until="networkidle")
    # Our relative-href link, not Clerk's absolute one
    page.locator("a[href='/auth/sign-in']").first.click()
    page.wait_for_url("**/auth/sign-in")


# =========== ONBOARDING HAPPY PATH ===========

@test("CLICK 'Criar grupo' with valid name POSTs /api/groups and navigates to /")
def c21(page: Page) -> None:
    install_full_api_mocks(page)
    api_calls_before = api_call_count("POST", "/api/groups")
    page.goto(f"{BASE_URL}/onboarding", wait_until="networkidle")
    page.locator("#group-name").fill("Meu Lar Teste")
    page.get_by_role("button", name="Criar grupo").click()
    page.wait_for_url(f"{BASE_URL}/", timeout=15000)
    assert api_call_count("POST", "/api/groups") > api_calls_before, "POST /api/groups not called"


# =========== EMPTY STATE CTA ===========

@test("CLICK 'Criar meu grupo' in empty state navigates to /onboarding")
def c22(page: Page) -> None:
    # Mock /api/groups returning empty list -> DashboardEmptyState
    def handle(route: Route) -> None:
        req = route.request
        if req.url.endswith("/api/groups") and req.method == "GET":
            route.fulfill(status=200, content_type="application/json",
                          body=json.dumps({"groups": []}))
        else:
            route.fulfill(status=200, content_type="application/json", body="{}")
    page.route("**/api/**", handle)
    page.goto(f"{BASE_URL}/", wait_until="networkidle")
    page.wait_for_timeout(2500)
    # EmptyState shows before the /onboarding redirect fires. Click fast.
    link = page.get_by_role("link", name="Criar meu grupo")
    if link.count() > 0 and link.first.is_visible():
        link.first.click()
        page.wait_for_url("**/onboarding", timeout=5000)
    else:
        # needsOnboarding redirected too fast — that's also the expected behavior.
        page.wait_for_url("**/onboarding", timeout=5000)


# =========== PLACEHOLDERS (documented, not failed) ===========

@test("DOCUMENT TopNav 'Como Funciona' is placeholder href=#")
def c23(page: Page) -> None:
    install_full_api_mocks(page)
    page.goto(f"{BASE_URL}/", wait_until="networkidle")
    link = page.get_by_role("link", name="Como Funciona")
    href = link.get_attribute("href")
    assert href == "#", f"Expected placeholder href=#, got {href!r}"


@test("DOCUMENT TopNav 'Preços' is placeholder href=#")
def c24(page: Page) -> None:
    install_full_api_mocks(page)
    page.goto(f"{BASE_URL}/", wait_until="networkidle")
    link = page.get_by_role("link", name="Preços")
    href = link.get_attribute("href")
    assert href == "#", f"Expected placeholder href=#, got {href!r}"


@test("DOCUMENT AppFooter 'Política de Privacidade' is placeholder href=#")
def c25(page: Page) -> None:
    install_full_api_mocks(page)
    page.goto(f"{BASE_URL}/", wait_until="networkidle")
    link = page.get_by_role("link", name="Política de Privacidade")
    href = link.get_attribute("href")
    assert href == "#", f"Expected placeholder href=#, got {href!r}"


@test("DOCUMENT TopNav 'Abrir menu' button has no attached handler yet")
def c26(page: Page) -> None:
    install_full_api_mocks(page)
    page.goto(f"{BASE_URL}/", wait_until="networkidle")
    button = page.get_by_label("Abrir menu")
    expect(button).to_be_visible()
    # No state change expected; click should not throw
    button.click()
    # No dropdown/modal should open
    page.wait_for_timeout(500)
    expect(page.locator("dialog[open]")).not_to_be_visible()


def main() -> int:
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        try:
            context = browser.new_context(viewport={"width": 1440, "height": 900},
                                          accept_downloads=True)
            page = context.new_page()
            for fn in (c01, c02, c03, c04, c05, c06, c07, c08, c09, c10, c11,
                       c12, c13, c14, c15, c16, c17, c18,
                       c19, c20, c21, c22,
                       c23, c24, c25, c26):
                api_calls.clear()
                # Fresh context per test avoids stale routes/state
                context.close()
                context = browser.new_context(viewport={"width": 1440, "height": 900},
                                              accept_downloads=True)
                page = context.new_page()
                fn(page)
            context.close()
        finally:
            browser.close()

    passed = sum(1 for r in results if r.passed)
    failed = sum(1 for r in results if not r.passed)
    print(f"\n{passed} passed, {failed} failed")
    if failed:
        print("\nFailures:")
        for r in results:
            if not r.passed:
                print(f"  - {r.name}")
                print(f"    {r.detail}")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
