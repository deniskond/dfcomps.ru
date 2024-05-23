import { UserRoles } from '@dfcomps/auth';
import { loginAs } from '../support/app.po';

describe('admin season end', () => {
  it('should end season correctly', () => {
    loginAs(UserRoles.SUPERADMIN);

    cy.visit('/admin/season');
    cy.get('[data-test-id=button-finish-season-first]').click();
    cy.get('[data-test-id=button-save-old-ratings]').should('exist');
    cy.get('[data-test-id=button-save-old-ratings]').click();
    cy.get('[data-test-id=button-set-rewards]').should('be.enabled');
    cy.get('[data-test-id=button-set-rewards]').click();
    cy.get('[data-test-id=button-reset-ratings]').should('be.enabled');
    cy.get('[data-test-id=button-reset-ratings]').click();
    cy.get('[data-test-id=button-increment-season]').should('be.enabled');
    cy.get('[data-test-id=button-increment-season]').click();
    cy.get('[data-test-id=text-current-season]').should('contain.text', 'Current season: 8');

    cy.visit('/rating');
    cy.get('[data-test-id=text-player-nick]').first().should('contain.text', 'David');
  });
});
