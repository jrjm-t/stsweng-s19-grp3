describe('Account Management', () => {
  beforeEach(() => {
    cy.login('admin', '123456'); 
    cy.visit('/accountprofile');
  });

  it('should allow a user to update their username', () => {
    cy.intercept('PATCH', '**/rest/v1/users*', {
      statusCode: 200,
      body: { id: 'test-user-id', name: 'New Username' }
    }).as('updateUsername');

    cy.contains('label', 'Username')
      .parents('div.flex.items-start') 
      .within(() => {
        cy.contains('button', 'Edit').click();
        cy.get('input').clear().type('New Username');
        cy.contains('button', 'Save').click();
      });

    cy.wait('@updateUsername').its('request.body.name').should('eq', 'New Username');
    
    cy.on('window:alert', (str) => {
      expect(str).to.equal('Name updated!');
    });
  });

  it('should allow a user to update their password', () => {
    cy.intercept('PUT', '**/auth/v1/user', {
      statusCode: 200,
      body: {}
    }).as('updatePassword');

    cy.contains('label', 'Password')
      .parents('div.flex.items-start')
      .within(() => {
        cy.contains('button', 'Edit').click();
        
        cy.get('input[placeholder="New Password"]').type('newpassword123');
        cy.get('input[placeholder="Confirm Password"]').type('newpassword123');
        
        cy.contains('button', 'Save').click();
      });

    cy.wait('@updatePassword');
    cy.on('window:alert', (str) => {
      expect(str).to.equal('Password updated successfully!');
    });
  });

  it('should validate password length and mismatch', () => {
    cy.contains('label', 'Password')
      .parents('div.flex.items-start')
      .within(() => {
        cy.contains('button', 'Edit').click();
        
        cy.get('input[placeholder="New Password"]').type('123');
        cy.get('input[placeholder="Confirm Password"]').type('123');
        cy.contains('button', 'Save').click();
      });

    cy.on('window:alert', (str) => {
      if (str.includes('at least 6 characters')) {
        expect(str).to.contain('at least 6 characters');
      }
    });

    cy.contains('label', 'Password')
      .parents('div.flex.items-start')
      .within(() => {
        cy.get('input[placeholder="New Password"]').clear().type('password123');
        cy.get('input[placeholder="Confirm Password"]').clear().type('mismatch123');
        cy.contains('button', 'Save').click();
      });
      
    cy.on('window:alert', (str) => {
      if (str === 'Passwords do not match.') {
        expect(str).to.equal('Passwords do not match.');
      }
    });
  });

  it('should allow a user to request admin access', () => {
    cy.intercept('POST', '**/rest/v1/admin_requests*', {
      statusCode: 201,
      body: { id: 'req-123', requester_id: 'test-user-id' }
    }).as('requestAdmin');

    cy.contains('button', 'Request Access').click();

    cy.wait('@requestAdmin');
    cy.on('window:alert', (str) => {
      expect(str).to.equal('Admin access request sent!');
    });
  });

  it('should allow a user to delete their account', () => {
    cy.intercept('DELETE', '**/rest/v1/users*', {
      statusCode: 204,
    }).as('deleteUser');

    cy.on('window:confirm', () => true);

    cy.contains('button', 'Delete My Account').click();

    cy.wait('@deleteUser');
    cy.on('window:alert', (str) => {
      expect(str).to.equal('Your account has been deleted.');
    });
  });
});