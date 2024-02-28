import { UserRoles } from '@dfcomps/auth';

export const loginAs = (role: UserRoles) => {
  cy.visit('/');
  cy.get('[data-test-id=userpanel-login-button]').click();
  cy.get('[data-test-id=password-login-button]', { timeout: 1000 }).should('be.visible');
  cy.get('[data-test-id=password-login-button]').click();
  cy.get('[data-test-id=login-input]', { timeout: 1000 }).should('be.visible');
  cy.get('[data-test-id=login-input]').type(role.toLowerCase());
  cy.get('[data-test-id=password-input]').type(role.toLowerCase());
  cy.get('[data-test-id=login-action-button]').click();
};

export const logOut = (options: { isHeaderVisible: boolean } = { isHeaderVisible: true }) => {
  if (!options.isHeaderVisible) {
    cy.visit('/');
  }

  cy.get('[data-test-id=logout-button]').click();
};
