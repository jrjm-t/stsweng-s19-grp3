describe("Cost Tracking Feature", () => {

  beforeEach(() => {
    // intercept (catch) the API call for items and return our fake data
    cy.intercept("GET", "**/items?select=*", {
      fixture: "items.json",
    }).as("getItems");

    // mock dashboard API calls to avoid other errors
    cy.intercept("GET", "**/item_stocks*", { body: [] }).as("getStockCalls");
    cy.intercept("GET", "**/transactions*", { body: [] }).as("getTransactionCalls");

    // mock the financial summary call
    cy.intercept("GET", "**/rpc/get_financial_summary", { 
      body: { totalInventoryValue: 100.00, totalExpirationValue: 0.00 }
    }).as("getFinancialSummary");

    cy.login("admin", "123456");
  });

  it("should display financial summary on the dashboard", () => {
    cy.visit("/dashboard");

    cy.contains("Total Inventory Value")
        .scrollIntoView()
        .should("be.visible");
        
    cy.contains("Lost to Expiration")
        .scrollIntoView()
        .should("be.visible");
  });

  it("should display unit price and total price in the inventory", () => {
    cy.visit("/inventory");
    cy.wait("@getItems");

    cy.contains("Test Bandages")
      .first()
      .parents("tr")
      .within(() => {
        cy.get("td").eq(3).should("contain.text", "5.00");  // Unit Price
        cy.get("td").eq(4).should("contain.text", "50.00"); // Total Price
      });
  });
});