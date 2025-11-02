describe('Inventory Page', () => {
  beforeEach(() => {
    cy.login('admin', '123456');
  });

  it('should display unit price and total price in the desktop table', () => {
    cy.intercept('GET', '**/items?select=*', {
      fixture: 'items.json',
    }).as('getItems');

    cy.visit('/inventory');
    cy.wait('@getItems');

    cy.contains('Test Bandages')
      .first()
      .parents('tr')
      .within(() => {
        cy.get('td').eq(3).should('contain.text', '5.00');
        cy.get('td').eq(4).should('contain.text', '50.00');
      });
  });

  it('should filter the table based on search input', () => {
    cy.intercept('GET', '**/items?select=*', {
      fixture: 'items.json',
    }).as('getItems');

    cy.visit('/inventory');
    cy.wait('@getItems');

    cy.contains('Test Bandages').should('be.visible');
    cy.contains('Test Gauze').should('be.visible');

    cy.get('input[placeholder="Search..."]').type('Gauze');

    cy.contains('Test Gauze').should('be.visible');
    cy.contains('Test Bandages').should('not.exist');
  });

  it("should allow a user to edit an item's unit price", () => {
    cy.intercept('GET', '**/items?select=*', {
      fixture: 'items.json',
    }).as('getItems');
    
    cy.intercept('PATCH', '**/item_stocks*', {
      statusCode: 200,
    }).as('updateStock');

    cy.visit('/edit-item');
    cy.wait('@getItems');

    cy.get('label').contains('Item Name').parent().find('input').first().type('Test Bandages', { force: true });
    cy.get('[class*="-menu"]').contains('Test Bandages').click();

    cy.get('label').contains('Lot ID').parent().find('input').first().type('B123', { force: true });
    cy.get('[class*="-menu"]').contains('B123').click();

    cy.get('input#unitPrice')
      .should('have.value', '5')
      .clear()
      .type('12.50');

    cy.get('button').contains('Edit').click();

    cy.contains('Item stock edited successfully.').scrollIntoView().should('be.visible');
  });

  it('should allow a user to add a new item', () => {
    cy.intercept('GET', '**/items?select=*', {
      fixture: 'items.json',
    }).as('getItems');

    cy.intercept('POST', '**/items?select=*', {
      statusCode: 201,
      body: { id: 'new-item-id', name: 'New Test Item' },
    }).as('createItem');

    cy.intercept('POST', '**/item_stocks', {
      statusCode: 201,
    }).as('createStock');

    cy.intercept('POST', '**/transactions', {
      statusCode: 201,
    }).as('createTransaction');

    cy.visit('/add-item');
    cy.wait('@getItems');

    cy.get('label').contains('Item Name').parent().find('input').first().type('New Test Item', { force: true });
    cy.get('[class*="-menu"]').contains('Create "New Test Item"').click();

    cy.get('label').contains('Lot ID').parent().find('input').first().type('NEW-LOT-123', { force: true });
    cy.get('[class*="-menu"]').contains('Create "NEW-LOT-123"').click();

    cy.get('input#quantity').type('50');
    cy.get('input#unitPrice').type('10.99');
    cy.get('input#expDate').type('2027-10-31');

    cy.get('button').contains('Add').click();

    cy.contains('New item and stock added.').scrollIntoView().should('be.visible');
  });
});