import { UserRoles } from '@dfcomps/auth';
import { loginAs } from './app.po';
import { faker } from '@faker-js/faker';
import { randomInt } from '@dfcomps/helpers';

export function addMultiCup(): string {
  const fullName = faker.lorem.words();

  loginAs(UserRoles.CUP_ORGANIZER);

  cy.visit('/admin/multicups');
  cy.get('[data-test-id=add-multicup-button]').click();

  // filling the form
  cy.get('[data-test-id=multicup-name-input]').type(fullName);
  cy.get('[data-test-id=multicup-rounds-input]').type(randomInt().toString());

  cy.get('[data-test-id=multicup-submit-button]').click(); 

  return fullName;
}
