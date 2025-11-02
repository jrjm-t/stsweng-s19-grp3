describe('Dashboard Page', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/items?select=*', {
      fixture: 'items.json',
    }).as('getItems');

    cy.intercept('GET', '**/item_stocks*', { body: [] }).as('getStockCalls');
    cy.intercept('GET', '**/transactions*', { body: [] }).as('getTransactionCalls');

    cy.login('admin', '123456');
  });

  it('should display financial summary on the dashboard', () => {
    cy.visit('/dashboard');

    cy.contains('Total Inventory Value')
      .scrollIntoView()
      .should('be.visible');

    cy.contains('Lost to Expiration')
      .scrollIntoView()
      .should('be.visible');
  });
});