/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      login(): Chainable<void>;
    }
  }
}

Cypress.Commands.add('login',() => {
  cy.clearLocalStorage();
  cy.clearCookies();

  cy.visit('/login');

  cy.get('[data-cy="login-username"]')
    .should('be.visible')
    .and('be.enabled')
    .clear()
    .type('salem@example.com');

  cy.get('[data-cy="login-password"]')
    .should('be.visible')
    .and('be.enabled')
    .clear()
    .type('secret123');

  cy.get('[data-cy="login-submit"]')
    .should('be.visible')
    .and('be.enabled')
    .click();

  cy.url().should('include', '/products');
});
export{}