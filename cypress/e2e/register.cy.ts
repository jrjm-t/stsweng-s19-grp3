describe('Registration', () => {
    it('should not allow registration with password that is too short', () => {
        cy.visit('/d5mf7868y97mpwa9/sign-up');

        cy.get('#username').type('admin');
        cy.get('#password').type('12345');
        cy.get('#confirm-password').type('12345');
        cy.get('button').click();

        cy.contains('Password is too short (min. 6 characters).').should('be.visible');

        cy.url().should('include', '/sign-up');
    })

    it('should not allow registration when password does not match confirm password', () => {
        cy.visit('/d5mf7868y97mpwa9/sign-up');

        cy.get('#username').type('admin');
        cy.get('#password').type('123456');
        cy.get('#confirm-password').type('123457');
        cy.get('button').click();

        cy.contains('Password does not match confirmation.').should('be.visible');

        cy.url().should('include', '/sign-up');
    })
})
