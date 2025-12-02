describe('Edit Supplier Page', () => {
  beforeEach(() => {
    cy.login('admin', '123456');
  });

  it('should successfully edit a supplier\'s information', () => {
    // Mock admin check - handle single object response
    cy.intercept('GET', '**/users*', (req) => {
      if (req.url.includes('select=is_admin')) {
        req.reply({ statusCode: 200, body: { is_admin: true } });
      }
    }).as('checkAdmin');

    // Intercept all supplier GET requests with a single handler
    cy.intercept('GET', '**/suppliers*', (req) => {
      // Check if it's a duplicate name check (contains name=eq. and id=neq.)
      if (req.url.includes('select=id') && req.url.includes('name=eq.') && req.url.includes('id=neq.')) {
        req.reply({ statusCode: 200, body: null });
      } else {
        // Default to returning the fixture for initial load
        req.reply({ fixture: 'suppliers.json' });
      }
    }).as('getSuppliers');

    // Mock the update supplier API call - include select parameter
    cy.intercept('PATCH', '**/suppliers?id=eq.550e8400-e29b-41d4-a716-446655440001&select=*', {
      statusCode: 200,
      body: {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Updated Medical Supplier A',
        phone_number: '+1555999000',
        email: 'updated@medicalsuppliera.com',
        remarks: 'Updated primary supplier'
      },
    }).as('updateSupplier');

    cy.visit('/edit-supplier');
    cy.wait('@getSuppliers');

    // Verify page elements
    cy.contains('Edit Supplier').should('be.visible');
    cy.contains('Select a supplier to edit their information.').should('be.visible');

    // Select a supplier from dropdown
    cy.get('.select__control').click();
    cy.get('.select__menu').contains('Test Medical Supplier A').click();

    // Verify form is populated with existing data
    cy.get('input[name="name"]').should('have.value', 'Test Medical Supplier A');
    cy.get('input[name="phoneNumber"]').should('have.value', '+1234567890');
    cy.get('input[name="emailAddress"]').should('have.value', 'contact@medicalsuppliera.com');
    cy.get('input[name="remarks"]').should('have.value', 'Primary medical supplies supplier');

    // Edit the fields
    cy.get('input[name="name"]').clear().type('Updated Medical Supplier A');
    cy.get('input[name="phoneNumber"]').clear().type('+1555999000');
    cy.get('input[name="emailAddress"]').clear().type('updated@medicalsuppliera.com');
    cy.get('input[name="remarks"]').clear().type('Updated primary supplier');

    // Submit changes
    cy.get('button').contains('Save Changes').click();

    // Verify success message appears (this confirms the API call worked)
    cy.contains('Supplier updated successfully.').scrollIntoView().should('be.visible');
  });

  it('should enable form fields when a supplier is selected', () => {
    // Mock admin check - handle all user requests
    cy.intercept('GET', '**/users*', {
      statusCode: 200,
      body: { is_admin: true }
    }).as('checkAdmin');
    cy.intercept('GET', '**/suppliers?select=*', {
      fixture: 'suppliers.json',
    }).as('getSuppliers');

    cy.visit('/edit-supplier');
    cy.wait('@getSuppliers');

    // Select a supplier
    cy.get('.select__control').click();
    cy.get('.select__menu').contains('Test Medical Supplier B').click();

    // Verify form fields are now enabled
    cy.get('input[name="name"]').should('not.be.disabled');
    cy.get('input[name="phoneNumber"]').should('not.be.disabled');
    cy.get('input[name="emailAddress"]').should('not.be.disabled');
    cy.get('input[name="remarks"]').should('not.be.disabled');
    
    // Verify button is enabled
    cy.get('button').contains('Save Changes').should('not.be.disabled');
  });

  it('should handle supplier with null optional fields', () => {
    // Mock admin check - handle all user requests
    cy.intercept('GET', '**/users*', {
      statusCode: 200,
      body: { is_admin: true }
    }).as('checkAdmin');

    cy.intercept('GET', '**/suppliers?select=*', {
      fixture: 'suppliers.json',
    }).as('getSuppliers');

    cy.visit('/edit-supplier');
    cy.wait('@getSuppliers');

    // Select supplier with null fields
    cy.get('.select__control').click();
    cy.get('.select__menu').contains('Test Pharmacy Distributor').click();

    // Verify form shows empty values for null fields
    cy.get('input[name="name"]').should('have.value', 'Test Pharmacy Distributor');
    cy.get('input[name="phoneNumber"]').should('have.value', '');
    cy.get('input[name="emailAddress"]').should('have.value', 'orders@pharmdist.com');
    cy.get('input[name="remarks"]').should('have.value', '');
  });

  it('should show error when trying to save without changes', () => {
    // Mock admin check - handle all user requests
    cy.intercept('GET', '**/users*', {
      statusCode: 200,
      body: { is_admin: true }
    }).as('checkAdmin');

    cy.intercept('GET', '**/suppliers?select=*', {
      fixture: 'suppliers.json',
    }).as('getSuppliers');

    cy.visit('/edit-supplier');
    cy.wait('@getSuppliers');

    // Select a supplier
    cy.get('.select__control').click();
    cy.get('.select__menu').contains('Test Medical Supplier A').click();

    // Don't make any changes, just try to save
    cy.get('button').contains('Save Changes').click();

    // Verify error message
    cy.contains('No changes detected.').should('be.visible');
  });

  it('should show error when trying to save empty supplier name', () => {
    // Mock admin check - handle all user requests
    cy.intercept('GET', '**/users*', {
      statusCode: 200,
      body: { is_admin: true }
    }).as('checkAdmin');

    cy.intercept('GET', '**/suppliers?select=*', {
      fixture: 'suppliers.json',
    }).as('getSuppliers');

    cy.visit('/edit-supplier');
    cy.wait('@getSuppliers');

    // Select a supplier
    cy.get('.select__control').click();
    cy.get('.select__menu').contains('Test Medical Supplier A').click();

    // Clear the name field
    cy.get('input[name="name"]').clear();

    // Try to save
    cy.get('button').contains('Save Changes').click();

    // Verify error message
    cy.contains('Supplier name is required.').should('be.visible');
  });

  it('should clear form when selecting different supplier', () => {
    // Mock admin check - handle all user requests
    cy.intercept('GET', '**/users*', {
      statusCode: 200,
      body: { is_admin: true }
    }).as('checkAdmin');

    cy.intercept('GET', '**/suppliers?select=*', {
      fixture: 'suppliers.json',
    }).as('getSuppliers');

    cy.visit('/edit-supplier');
    cy.wait('@getSuppliers');

    // Select first supplier
    cy.get('.select__control').click();
    cy.get('.select__menu').contains('Test Medical Supplier A').click();

    // Verify first supplier data
    cy.get('input[name="name"]').should('have.value', 'Test Medical Supplier A');

    // Select different supplier
    cy.get('.select__control').click();
    cy.get('.select__menu').contains('Test Medical Supplier B').click();

    // Verify form updated with new supplier data
    cy.get('input[name="name"]').should('have.value', 'Test Medical Supplier B');
    cy.get('input[name="phoneNumber"]').should('have.value', '+1987654321');
    cy.get('input[name="emailAddress"]').should('have.value', 'info@medicalsupplierb.com');
  });

});
