import { UserRoles } from '@dfcomps/auth';
import { loginAs } from '../support/app.po';
import * as moment from 'moment';
import * as faker from 'faker';

describe('admin cups', () => {
  const initialCupFullName = faker.lorem.words();
  const initialCupShortName = faker.lorem.words();
  const cupStartTime = moment().subtract('1', 'day').format('YYYY-MM-DDTHH:mm');
  const cupEndTime = moment().add('1', 'day').format('YYYY-MM-DDTHH:mm');
  const initialMapName = 'crosspath';
  const secondMapName = 'palmslane';

  beforeEach(() => {
    cy.visit('/');
    loginAs(UserRoles.CUP_ORGANIZER);
  });

  it('should add simple offline cup correctly', () => {
    cy.visit('/admin/cups');
    cy.get('[data-test-id=add-offline-cup-button]').click();

    // filling the form
    cy.get('[data-test-id=cup-fullname-input]').type(initialCupFullName);
    cy.get('[data-test-id=cup-shortname-input]').type(initialCupShortName);
    cy.get('[data-test-id=cup-starttime-input]').type(cupStartTime);
    cy.get('[data-test-id=cup-endtime-input]').type(cupEndTime);
    cy.get('[data-test-id=cup-map-ws-radio]').click();
    cy.get('[data-test-id=cup-mapname-input]').type(initialMapName);

    // checking autofilled form values
    cy.get('[data-test-id=cup-pk3link-input]')
      .invoke('val')
      .should('contain', 'https://ws.q3df.org/maps/downloads/crosspath.pk3');
    cy.get('[data-test-id=cup-levelshotlink-input]')
      .invoke('val')
      .should('contain', 'https://ws.q3df.org/images/levelshots/512x384/crosspath.jpg');
    cy.get('[data-test-id=cup-mapauthor-input]').invoke('val').should('contain', 'Rust7');
    cy.get('[data-test-id=cup-weapon-g-checkbox]').should('have.class', 'mat-mdc-checkbox-checked');
    cy.get('[data-test-id=cup-weapon-r-checkbox]').should('have.class', 'mat-mdc-checkbox-checked');
    cy.get('[data-test-id=cup-weapon-p-checkbox]').should('have.class', 'mat-mdc-checkbox-checked');
    cy.get('[data-test-id=cup-weapon-l-checkbox]').should('have.class', 'mat-mdc-checkbox-checked');
    cy.get('[data-test-id=cup-weapon-b-checkbox]').should('have.class', 'mat-mdc-checkbox-checked');
    cy.get('[data-test-id=cup-weapon-i-checkbox]').should('have.class', 'mat-mdc-checkbox-checked');

    cy.get('[data-test-id=cup-submit-button]').click();

    // checking admin cups list
    cy.get('[data-test-id=cup-fullname-text]').first().should('contain.text', initialCupFullName);

    // checking mainpage
    cy.visit('/');
    cy.get('[data-test-id=cup-map-link]').first().should('contain.text', initialMapName);
  });

  // it('should edit simple offline cup correctly', () => {});

  // it('should delete simple offline cup correctly', () => {});
});
