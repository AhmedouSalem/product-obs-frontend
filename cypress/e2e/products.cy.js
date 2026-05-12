const username = 'salem@example.com';
const password = 'secret123';

function getProductRow(productName) {
    return cy.get(`[data-cy="product-row"][data-product-name="${productName}"]`);
}

function createProduct(productName) {
    cy.get('[data-cy="product-create-open"]').click();

    cy.get('[data-cy="product-name"]').clear().type(productName);

    cy.get('[data-cy="product-description"]')
        .clear()
        .type('Product created by Cypress test');

    cy.get('[data-cy="product-price"]').clear().type('99.99');

    cy.get('[data-cy="product-expiry"]')
        .invoke('val', '2026-12-31')
        .trigger('input')
        .trigger('change');

    cy.get('[data-cy="product-category"]').click();
    cy.get('mat-option').contains('Electronics').click();

    cy.get('[data-cy="product-submit"]').click();

    getProductRow(productName).should('be.visible');
}

describe('Products', () => {
    beforeEach(() => {
        cy.viewport(1600, 1000);
        cy.login();
    });

    it('should display the products page and product list', () => {
        cy.contains('Products').should('be.visible');

        cy.get('[data-cy="product-row"]')
            .should('have.length.at.least', 1);

        getProductRow('MacBook Pro 16')
            .should('be.visible');
    });

    it('should display empty details message before selecting a product', () => {
        cy.get('[data-cy="product-details-empty"]')
            .should('be.visible')
            .and('contain', 'Select a product row to see details');
    });

    it('should display product details when selecting a product', () => {
        getProductRow('MacBook Pro 16')
            .within(() => {
                cy.get('[data-cy="product-view-button"]').click();
            });

        cy.get('[data-cy="product-details-name"]')
            .should('be.visible')
            .and('contain', 'MacBook Pro 16');

        cy.get('[data-cy="product-details-category"]')
            .should('contain', 'Electronics');

        cy.get('[data-cy="product-details-price"]')
            .should('contain', '2499.99');

        cy.get('[data-cy="product-details-description"]')
            .should('contain', 'High-end laptop');
    });

    it('should create a new product', () => {
        const productName = `Cypress Product ${Date.now()}`;

        createProduct(productName);

        getProductRow(productName)
            .should('be.visible');
    });

    it('should edit an existing product', () => {
        const productName = `Cypress Edit ${Date.now()}`;
        const updatedName = `Updated Cypress Product ${Date.now()}`;

        createProduct(productName);

        getProductRow(productName)
            .within(() => {
                cy.get('[data-cy="product-edit-button"]').click();
            });

        cy.get('[data-cy="product-name"]').clear().type(updatedName);

        cy.get('[data-cy="product-description"]')
            .clear()
            .type('Product updated by Cypress test');

        cy.get('[data-cy="product-submit"]').click();

        getProductRow(updatedName)
            .should('be.visible');

        getProductRow(productName)
            .should('not.exist');
    });

    it('should delete an existing product', () => {
        const productName = `Cypress Delete ${Date.now()}`;

        createProduct(productName);

        getProductRow(productName)
            .within(() => {
                cy.get('[data-cy="product-delete-button"]').click();
            });

        cy.get('[data-cy="product-delete-confirm"]').click();

        getProductRow(productName)
            .should('not.exist');
    });
});