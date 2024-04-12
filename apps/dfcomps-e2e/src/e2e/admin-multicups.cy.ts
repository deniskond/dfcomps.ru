import { UserRoles } from '@dfcomps/auth';
import { loginAs } from '../support/app.po';
import * as faker from 'faker';

describe('admin multicups', () => {
  const initialMulticupName = faker.lorem.words();
  const initialRounds = faker.datatype.number();

  const secondMulticupName = faker.lorem.words();
  const secondMulticupRounds = faker.datatype.number();

  beforeEach(() => {
    cy.visit('/');
    loginAs(UserRoles.CUP_ORGANIZER);
  });

  it('should add multicup correctly', () => {
    cy.visit('/admin/multicups');
    cy.get('[data-test-id=add-multicup-button]').click();

    // filling the form
    cy.get('[data-test-id=multicup-name-input]').type(initialMulticupName);
    cy.get('[data-test-id=multicup-rounds-input]').type(initialRounds.toString());

    // adding multicup and checking admin multicups list
    cy.get('[data-test-id=multicup-submit-button]').click(); 
    cy.get('[data-test-id=multicup-name-text]').first().should('contain.text', initialMulticupName);
    cy.get('[data-test-id=multicup-rounds-text]').first().should('contain.text', initialRounds.toString());
  });

  it('should edit multicup correctly', () => {
    cy.visit('/admin/multicups');
    cy.get('[data-test-id=edit-multicup-button]').first().click();

    // filling the form
    cy.get('[data-test-id=multicup-name-input]').clear().type(secondMulticupName);
    cy.get('[data-test-id=multicup-rounds-input]').clear().type(secondMulticupRounds.toString());

    // submitting form and checking admin multicups list
    cy.get('[data-test-id=multicup-submit-button]').click(); 
    cy.get('[data-test-id=multicup-name-text]').first().should('contain.text', secondMulticupName);
    cy.get('[data-test-id=multicup-rounds-text]').first().should('contain.text', secondMulticupRounds.toString());
  });

  it('should delete multicup correctly', () => {
    cy.visit('/admin/multicups');

    const firstMulticupName = cy.get('[data-test-id=multicup-name-text]').first().invoke('text');

    cy.get('[data-test-id=delete-multicup-button]').first().click();
    cy.get('mat-snack-bar-container').find('button.mat-mdc-snack-bar-action').click();

    // checking admin news list
    cy.get('[data-test-id=multicup-name-text]').first().should('not.contain.text', firstMulticupName);

    // checking snackbar
    cy.get('simple-snack-bar').find('.mat-mdc-snack-bar-label').should('contain.text', 'Successfully deleted');
  });
});
