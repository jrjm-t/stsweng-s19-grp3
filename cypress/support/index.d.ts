// this will recognize our custom command 'login' in cypress tests
declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to log in a user.
     * @example cy.login('admin', 'password123')
     */
    login(username: string, password: string): Chainable<void>;
  }
}