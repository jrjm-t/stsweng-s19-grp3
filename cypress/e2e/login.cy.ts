describe('Authentication', () => {
  it('should show an error toast on failed login', () => {
    cy.visit('/vrnqxh6p2dj722u7/login');

    cy.get('#username').type('admin');
    cy.get('#password').type('wrongpassword');
    cy.get('button[type="submit"]').click();

    cy.contains('Login failed. Please check your credentials.').should('be.visible');

    cy.url().should('include', '/login');
  });
});