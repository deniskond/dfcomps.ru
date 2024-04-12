import { UserRoles } from '@dfcomps/auth';
import { loginAs } from './app.po';
import * as faker from 'faker';
import * as moment from 'moment';

export function addOnlineCup(): string {
  const fullName = faker.lorem.words();

  cy.visit('/');
  loginAs(UserRoles.CUP_ORGANIZER);

  cy.visit('/admin/cups');
  cy.get('[data-test-id=add-online-cup-button]').click();

  // filling the form
  cy.get('[data-test-id=online-cup-fullname-input]').type(fullName);
  cy.get('[data-test-id=online-cup-shortname-input]').type(faker.lorem.words());
  cy.get('[data-test-id=online-cup-physics-select]').click();
  cy.get('[data-test-id=online-cup-physics-vq3]').click();
  cy.get('[data-test-id=online-cup-starttime-input]').type(moment().format('YYYY-MM-DDTHH:mm'));

  cy.get('[data-test-id=online-cup-submit-button]').click();

  return fullName;
}
