import { UserRoles } from '@dfcomps/auth';
import { loginAs } from '../support/app.po';
import * as moment from 'moment';
import * as faker from 'faker';

describe('admin online cups', () => {
  const initialCupFullName = faker.lorem.words();
  const initialCupShortName = faker.lorem.words();
  const cupStartTime = moment().add('1', 'day').format('YYYY-MM-DDTHH:mm');

  const secondCupFullName = faker.lorem.words();
  const secondCupShortName = faker.lorem.words();

  beforeEach(() => {
    cy.visit('/');
    loginAs(UserRoles.CUP_ORGANIZER);
  });

  it('should add online cup correctly', () => {
    cy.visit('/admin/cups');
    cy.get('[data-test-id=add-online-cup-button]').click();

    // filling the form
    cy.get('[data-test-id=online-cup-fullname-input]').type(initialCupFullName);
    cy.get('[data-test-id=online-cup-shortname-input]').type(initialCupShortName);
    cy.get('[data-test-id=online-cup-physics-select]').click();
    cy.get('[data-test-id=online-cup-physics-vq3]').click();
    cy.get('[data-test-id=online-cup-starttime-input]').type(cupStartTime);
    cy.get('[data-test-id=online-cup-add-news-checkbox]').click();

    // checking two servers switch
    cy.get('[data-test-id=online-cup-two-servers-checkbox]').click();
    cy.get('[data-test-id=online-cup-server2-input]', { timeout: 500 }).should('not.exist');
    cy.get('[data-test-id=online-cup-two-servers-checkbox]').click();
    cy.get('[data-test-id=online-cup-server2-input]').should('exist');

    // adding online cup and checking admin cups list
    cy.get('[data-test-id=online-cup-submit-button]').click(); 
    cy.get('[data-test-id=cup-fullname-text]').first().should('contain.text', initialCupFullName);

    // checking mainpage
    cy.visit('/');
    cy.get('[data-test-id=news-header-text]').first().should('contain.text', initialCupFullName);
    cy.get('.news-block').first().find('[data-test-id=online-cup-players-table]').should('exist');
  });

  it('should edit online cup correctly', () => {
    cy.visit('/admin/cups');
    cy.get('[data-test-id=edit-cup-button]').click();

    // filling the form
    cy.get('[data-test-id=online-cup-fullname-input]').clear().type(secondCupFullName);
    cy.get('[data-test-id=online-cup-shortname-input]').clear().type(secondCupShortName);

    // submitting form and checking admin cups list
    cy.get('[data-test-id=online-cup-submit-button]').click();
    cy.get('[data-test-id=cup-fullname-text]').first().should('contain.text', secondCupFullName);

    // checking mainpage
    cy.visit('/');
    cy.get('[data-test-id=news-header-text]').first().should('contain.text', secondCupFullName);
  });

  it('should delete online cup correctly', () => {
    cy.visit('/admin/cups');

    const firstCupFullName = cy.get('[data-test-id=cup-fullname-text]').first().invoke('text');

    cy.get('[data-test-id=delete-cup-button]').first().click();
    cy.get('mat-snack-bar-container').find('button.mat-mdc-snack-bar-action').click();

    // checking admin news list
    cy.get('[data-test-id=cup-fullname-text]').first().should('not.contain.text', firstCupFullName);

    // checking snackbar
    cy.get('simple-snack-bar').find('.mat-mdc-snack-bar-label').should('contain.text', 'Successfully deleted');
  });
});
