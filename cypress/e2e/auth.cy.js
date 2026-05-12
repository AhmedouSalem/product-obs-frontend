describe('Authentication', () => {
    it('should display an error with invalid credentials', () => {
        cy.visit('/login');

        cy.get('[data-cy="login-username"]').clear().type('admin');
        cy.get('[data-cy="login-password"]').clear().type('admin');
        cy.get('[data-cy="login-submit"]').click();
        cy.get('[data-cy="login-username"]').click()

        cy.get('[data-cy="login-error"]').should('be.visible').and('contain', 'not found');
        
        cy.url().should('include', '/login');
    });

    it('should login with valid credentials and redirect to products page', () => {
    cy.visit('/login');

    cy.get('[data-cy="login-username"]').clear().type('salem@example.com');
    cy.get('[data-cy="login-password"]').clear().type('secret123');
    cy.get('[data-cy="login-submit"]').click();

    cy.url().should('include', '/products');
    cy.contains('Products').should('be.visible');
    cy.contains('MacBook Pro 16').should('be.visible');
  });
});

