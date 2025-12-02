describe('Add Supplier Page', () => {
  beforeEach(() => {
    cy.login('admin', '123456');
  });

  it('should successfully add a new supplier with all fields', () => {
    // Mock admin check
    cy.intercept('GET', '**/users?select=is_admin*', {
      statusCode: 200,
      body: { is_admin: true }
    }).as('checkAdmin');

    // Intercept all supplier GET requests with a single handler
    cy.intercept('GET', '**/suppliers*', (req) => {
      // Check if it's a duplicate name check (contains select=id and name=eq.)
      if (req.url.includes('select=id') && req.url.includes('name=eq.')) {
        req.reply({ statusCode: 200, body: [] });
      } else {
        // Default to returning the fixture for initial load
        req.reply({ fixture: 'suppliers.json' });
      }
    }).as('getSuppliers');

    // Mock the create supplier API call
    cy.intercept('POST', '**/suppliers*', {
      statusCode: 201,
      body: {
        id: 'new-supplier-id',
        name: 'New Test Supplier',
        phone_number: '+1555123456',
        email: 'new@supplier.com',
        remarks: 'New supplier for testing'
      },
    }).as('createSupplier');

    cy.visit('/add-supplier');
    cy.wait('@getSuppliers');

    // Verify page elements
    cy.contains('Add Supplier').should('be.visible');
    cy.contains('Add a new supplier to the system.').should('be.visible');

    // Fill in all form fields
    cy.get('input[name="name"]').type('New Test Supplier');
    cy.get('input[name="phoneNumber"]').type('+1555123456');
    cy.get('input[name="emailAddress"]').type('new@supplier.com');
    cy.get('input[name="remarks"]').type('New supplier for testing');

    // Submit the form
    cy.get('button').contains('Add Supplier').click();

    // Verify success message
    cy.contains('Supplier added successfully.').scrollIntoView().should('be.visible');
  });

  it('should successfully add a supplier with only required fields', () => {
    // Mock admin check
    cy.intercept('GET', '**/users?select=is_admin*', {
      statusCode: 200,
      body: { is_admin: true }
    }).as('checkAdmin');

    // Intercept all supplier GET requests with a single handler
    cy.intercept('GET', '**/suppliers*', (req) => {
      // Check if it's a duplicate name check (contains select=id and name=eq.)
      if (req.url.includes('select=id') && req.url.includes('name=eq.')) {
        req.reply({ statusCode: 200, body: [] });
      } else {
        // Default to returning the fixture for initial load
        req.reply({ fixture: 'suppliers.json' });
      }
    }).as('getSuppliers');

    // Mock the create supplier API call
    cy.intercept('POST', '**/suppliers*', {
      statusCode: 201,
      body: {
        id: 'minimal-supplier-id',
        name: 'Minimal Supplier',
        phone_number: null,
        email: null,
        remarks: null
      },
    }).as('createSupplier');

    cy.visit('/add-supplier');
    cy.wait('@getSuppliers');

    // Fill only required field
    cy.get('input[name="name"]').type('Minimal Supplier');

    // Submit the form
    cy.get('button').contains('Add Supplier').click();

    // Verify success message
    cy.contains('Supplier added successfully.').scrollIntoView().should('be.visible');
  });

  it('should show error when trying to add supplier without name', () => {
    // Mock admin check
    cy.intercept('GET', '**/users?select=is_admin*', {
      statusCode: 200,
      body: { is_admin: true }
    }).as('checkAdmin');

    // Intercept all supplier GET requests with a single handler
    cy.intercept('GET', '**/suppliers*', (req) => {
      // Check if it's a duplicate name check (contains select=id and name=eq.)
      if (req.url.includes('select=id') && req.url.includes('name=eq.')) {
        req.reply({ statusCode: 200, body: [] });
      } else {
        // Default to returning the fixture for initial load
        req.reply({ fixture: 'suppliers.json' });
      }
    }).as('getSuppliers');

    cy.visit('/add-supplier');
    cy.wait('@getSuppliers');

    // Fill optional fields but leave name empty
    cy.get('input[name="phoneNumber"]').type('+1555999888');
    cy.get('input[name="emailAddress"]').type('test@example.com');

    // Submit the form
    cy.get('button').contains('Add Supplier').click();

    // Verify error message
    cy.contains('Supplier name is required.').should('be.visible');
  });

  it('should clear form after successful submission', () => {
    // Mock admin check
    cy.intercept('GET', '**/users?select=is_admin*', {
      statusCode: 200,
      body: { is_admin: true }
    }).as('checkAdmin');

    // Intercept all supplier GET requests with a single handler
    cy.intercept('GET', '**/suppliers*', (req) => {
      // Check if it's a duplicate name check (contains select=id and name=eq.)
      if (req.url.includes('select=id') && req.url.includes('name=eq.')) {
        req.reply({ statusCode: 200, body: [] });
      } else {
        // Default to returning the fixture for initial load
        req.reply({ fixture: 'suppliers.json' });
      }
    }).as('getSuppliers');

    // Mock the create supplier API call
    cy.intercept('POST', '**/suppliers*', {
      statusCode: 201,
      body: { id: 'clear-test-id', name: 'Clear Test Supplier' },
    }).as('createSupplier');

    cy.visit('/add-supplier');
    cy.wait('@getSuppliers');

    // Fill form
    cy.get('input[name="name"]').type('Clear Test Supplier');
    cy.get('input[name="phoneNumber"]').type('+1555111222');
    cy.get('input[name="emailAddress"]').type('clear@test.com');
    cy.get('input[name="remarks"]').type('This should be cleared');

    // Submit form
    cy.get('button').contains('Add Supplier').click();

    // Wait for success message first
    cy.contains('Supplier added successfully.').scrollIntoView().should('be.visible');

    // Verify form is cleared
    cy.get('input[name="name"]').should('have.value', '');
    cy.get('input[name="phoneNumber"]').should('have.value', '');
    cy.get('input[name="emailAddress"]').should('have.value', '');
    cy.get('input[name="remarks"]').should('have.value', '');
  });
});
