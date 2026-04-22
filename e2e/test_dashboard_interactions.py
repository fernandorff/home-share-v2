"""Interactive dashboard coverage — modals, toggles, options menu, settle-up.

Uses Playwright's `page.route` to stub the /api/groups,
/api/groups/:id/expenses and /api/groups/:id/balances responses so
the client renders a fully-populated dashboard without a Clerk
session or a live database.

Run against `E2E_TESTING=1 npm run dev` so the proxy bypasses auth.
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
    "id": 1,
    "publicId": "grp-test-1",
    "name": "Apartamento Teste",
    "description": "grupo de teste",
    "members": [
        {
            "id": 101,
            "userId": 1,
            "groupId": 1,
            "role": "ADMIN",
            "user": {"id": 1, "publicId": "usr-1", "name": "Fernando", "isGuest": False, "email": "f@test.dev"},
        },
        {
            "id": 102,
            "userId": 2,
            "groupId": 1,
            "role": "MEMBER",
            "user": {"id": 2, "publicId": "usr-2", "name": "Tatiana", "isGuest": False, "email": "t@test.dev"},
        },
    ],
    "_count": {"expenses": 2},
}

MOCK_EXPENSES = [
    {
        "id": 1,
        "publicId": "exp-1",
        "groupId": 1,
        "payerId": 1,
        "platformId": None,
        "description": "Supermercado",
        "notes": None,
        "amount": 250.00,
        "date": "2026-04-12T00:00:00.000Z",
        "createdAt": "2026-04-12T00:00:00.000Z",
        "payer": {"id": 1, "publicId": "usr-1", "name": "Fernando"},
        "platform": None,
        "participants": [
            {"id": 1, "expenseId": 1, "userId": 1, "amount": 125.00, "user": {"id": 1, "publicId": "usr-1", "name": "Fernando"}},
            {"id": 2, "expenseId": 1, "userId": 2, "amount": 125.00, "user": {"id": 2, "publicId": "usr-2", "name": "Tatiana"}},
        ],
    },
    {
        "id": 2,
        "publicId": "exp-2",
        "groupId": 1,
        "payerId": 2,
        "platformId": None,
        "description": "Netflix",
        "notes": None,
        "amount": 56.00,
        "date": "2026-04-08T00:00:00.000Z",
        "createdAt": "2026-04-08T00:00:00.000Z",
        "payer": {"id": 2, "publicId": "usr-2", "name": "Tatiana"},
        "platform": None,
        "participants": [
            {"id": 3, "expenseId": 2, "userId": 1, "amount": 28.00, "user": {"id": 1, "publicId": "usr-1", "name": "Fernando"}},
            {"id": 4, "expenseId": 2, "userId": 2, "amount": 28.00, "user": {"id": 2, "publicId": "usr-2", "name": "Tatiana"}},
        ],
    },
]

MOCK_BALANCES = {
    "balances": [
        {"userId": 1, "userName": "Fernando", "balance": 97.00},
        {"userId": 2, "userName": "Tatiana", "balance": -97.00},
    ],
    "settlements": [
        {"from": {"id": 2, "name": "Tatiana"}, "to": {"id": 1, "name": "Fernando"}, "amount": 97.00},
    ],
    "totalExpenses": 306.00,
}


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


def install_api_mocks(page: Page) -> None:
    """Routes /api/groups/* to deterministic fixtures."""

    def handle_groups(route: Route) -> None:
        method = route.request.method
        url = route.request.url
        if url.endswith("/api/groups") and method == "GET":
            route.fulfill(status=200, content_type="application/json",
                          body=json.dumps({"groups": [MOCK_GROUP]}))
        elif url.endswith("/api/groups") and method == "POST":
            route.fulfill(status=201, content_type="application/json",
                          body=json.dumps({"group": MOCK_GROUP}))
        elif "/expenses" in url and method == "GET":
            route.fulfill(status=200, content_type="application/json",
                          body=json.dumps({
                              "expenses": MOCK_EXPENSES,
                              "pagination": {"page": 1, "pageSize": 50, "total": 2, "totalPages": 1},
                          }))
        elif "/expenses" in url and method == "POST":
            new_id = len(MOCK_EXPENSES) + 1
            route.fulfill(status=201, content_type="application/json",
                          body=json.dumps({"expense": {**MOCK_EXPENSES[0], "id": new_id, "publicId": f"exp-{new_id}"}}))
        elif "/balances" in url and method == "GET":
            route.fulfill(status=200, content_type="application/json",
                          body=json.dumps(MOCK_BALANCES))
        else:
            route.fallback()

    page.route("**/api/groups", handle_groups)
    page.route("**/api/groups/**", handle_groups)


def open_dashboard(page: Page) -> None:
    install_api_mocks(page)
    page.goto(f"{BASE_URL}/", wait_until="networkidle")
    # Wait until group context loads: expect to see the ExpensesCard toolbar
    page.wait_for_selector("text=Despesas (", timeout=15000)


@test("dashboard renders ExpensesTable with mocked expenses")
def check_table_rows(page: Page) -> None:
    open_dashboard(page)
    expect(page.get_by_text("Supermercado").first).to_be_visible()
    expect(page.get_by_text("Netflix").first).to_be_visible()


@test("BalanceCard shows the settlement 'Tatiana deve R$ 97,00 para Fernando'")
def check_balance_card(page: Page) -> None:
    open_dashboard(page)
    card = page.locator("article").filter(has_text="Resumo de").first
    expect(card).to_be_visible()
    expect(card.get_by_text("Tatiana deve")).to_be_visible()
    expect(card.get_by_text("R$ 97,00")).to_be_visible()
    expect(card.get_by_text("para Fernando")).to_be_visible()


@test("MembersCard lists Fernando and Tatiana")
def check_members_card(page: Page) -> None:
    open_dashboard(page)
    card = page.locator("article").filter(has_text="Moradores").first
    expect(card.get_by_text("Fernando")).to_be_visible()
    expect(card.get_by_text("Tatiana")).to_be_visible()


@test("view toggle switches from Tabela to Por pessoa grouping")
def check_view_toggle(page: Page) -> None:
    open_dashboard(page)
    expect(page.get_by_role("columnheader", name="Descrição")).to_be_visible()
    page.get_by_role("button", name="Por pessoa").click()
    # Table headers disappear, per-person group headers with accent dot + name appear
    expect(page.get_by_role("columnheader", name="Descrição")).not_to_be_visible()
    expect(page.get_by_text("Fernando").first).to_be_visible()


@test("'Nova despesa' button opens the ExpenseFormModal")
def check_nova_despesa_modal(page: Page) -> None:
    open_dashboard(page)
    page.get_by_role("button", name="Nova despesa").first.click()
    dialog = page.locator("dialog[open]")
    expect(dialog).to_be_visible()
    expect(dialog.get_by_role("heading", name="Nova despesa")).to_be_visible()
    expect(dialog.locator("#expense-description")).to_be_visible()
    page.keyboard.press("Escape")


@test("ExpenseFormModal cancel button closes the dialog")
def check_modal_cancel(page: Page) -> None:
    open_dashboard(page)
    page.get_by_role("button", name="Nova despesa").first.click()
    page.locator("dialog[open]").wait_for()
    page.get_by_role("button", name="Cancelar").click()
    expect(page.locator("dialog[open]")).not_to_be_visible()


@test("kebab options menu exposes 'Exportar CSV'")
def check_options_menu(page: Page) -> None:
    open_dashboard(page)
    # Toolbar kebab is the first visible "Mais opções" trigger
    page.get_by_role("button", name="Mais opções").first.click()
    expect(page.get_by_role("menuitem", name="Exportar CSV")).to_be_visible()
    page.keyboard.press("Escape")


@test("'Acertar contas' opens the SettleUpModal listing all settlements")
def check_settle_up(page: Page) -> None:
    open_dashboard(page)
    page.get_by_role("button", name="Acertar contas").click()
    dialog = page.locator("dialog[open]")
    expect(dialog).to_be_visible()
    expect(dialog.get_by_role("heading", name="Acertar contas")).to_be_visible()
    expect(dialog.get_by_text("Tatiana")).to_be_visible()
    expect(dialog.get_by_text("R$ 97,00")).to_be_visible()


def main() -> int:
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        try:
            page = browser.new_context(viewport={"width": 1440, "height": 900}).new_page()
            for check in (
                check_table_rows,
                check_balance_card,
                check_members_card,
                check_view_toggle,
                check_nova_despesa_modal,
                check_modal_cancel,
                check_options_menu,
                check_settle_up,
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
