describe('Admin Actions', () => {
  beforeEach(() => {
    cy.login('admin', '123456');

    cy.intercept('GET', '**/rest/v1/admin_requests?*', {
      statusCode: 200,
      body: [
        {
          requester_id: 'user-1',
          requested_at: '2023-10-27T10:00:00Z',
          users: {
            id: 'user-1',
            name: 'John Doe',
            email: 'john@example.com'
          }
        },
        {
          requester_id: 'user-2',
          requested_at: '2023-10-27T11:00:00Z',
          users: {
            id: 'user-2',
            name: 'Jane Smith',
            email: 'jane@example.com'
          }
        }
      ]
    }).as('getRequests');

    cy.visit('/member-requests');
    cy.wait('@getRequests');
  });

  it('should display a list of pending admin requests', () => {
    cy.contains('Admin Access Requests').should('be.visible');
    cy.contains('2 pending requests').should('be.visible');
    cy.contains('John Doe').should('be.visible');
    cy.contains('john@example.com').should('be.visible');
    cy.contains('Jane Smith').should('be.visible');
  });

  it('should allow an admin to accept a request', () => {
    cy.intercept('PATCH', '**/rest/v1/users?*', {
      statusCode: 200,
      body: { id: 'user-1', is_admin: true }
    }).as('acceptUser');

    cy.intercept('DELETE', '**/rest/v1/admin_requests?*', {
      statusCode: 204
    }).as('deleteRequest');

    cy.contains('div', 'John Doe')
      .parent()
      .find('button')
      .contains('Accept')
      .click();

    cy.wait('@acceptUser').its('request.body.is_admin').should('eq', true);
    cy.wait('@deleteRequest');

    cy.contains('John Doe').should('not.exist');
    cy.on('window:alert', (str) => {
      expect(str).to.equal('Request accepted!');
    });
  });

  it('should allow an admin to reject a request', () => {
    cy.intercept('PATCH', '**/rest/v1/users?*', {
      statusCode: 200,
      body: { id: 'user-2', is_admin: false }
    }).as('rejectUser');

    cy.intercept('DELETE', '**/rest/v1/admin_requests?*', {
      statusCode: 204
    }).as('deleteRequest');

    cy.contains('div', 'Jane Smith')
      .parent()
      .find('button')
      .contains('Reject')
      .click();

    cy.wait('@rejectUser').its('request.body.is_admin').should('eq', false);
    cy.wait('@deleteRequest');

    cy.contains('Jane Smith').should('not.exist');
    cy.on('window:alert', (str) => {
      expect(str).to.equal('Request rejected!');
    });
  });

  it('should show empty state when no requests exist', () => {
    cy.intercept('GET', '**/rest/v1/admin_requests?*', {
      statusCode: 200,
      body: []
    }).as('getEmptyRequests');

    cy.reload();
    cy.wait('@getEmptyRequests');

    cy.contains('No pending admin requests').should('be.visible');
  });
});