describe('frontend', () => {
  beforeEach(() => cy.visit('/'));

  it('should login correctly', () => {
    cy.get('[data-test-id=userpanel-login-button]').click();
    cy.get('[data-test-id=password-login-button]', { timeout: 1000 }).should('be.visible');
    cy.get('[data-test-id=password-login-button]').click();
    cy.get('[data-test-id=login-input]', { timeout: 1000 }).should('be.visible');
    cy.get('[data-test-id=login-input]').type('user');
    cy.get('[data-test-id=password-input]').type('user');
    cy.get('[data-test-id=login-action-button]').click();
    cy.get('[data-test-id=user-nick-text]').should('contain.text', 'user');
  });
});
