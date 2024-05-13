import { UserRoles } from '@dfcomps/auth';
import { loginAs } from '../support/app.po';
import * as moment from 'moment';
import * as faker from 'faker';

describe('admin offline cups', () => {
  const initialCupFullName = faker.lorem.words();
  const initialCupShortName = faker.lorem.words();
  const initialMapName = 'crosspath';
  const cupStartTime = moment().format('YYYY-MM-DDTHH:mm');
  const cupEndTime = moment().add('1', 'day').format('YYYY-MM-DDTHH:mm');

  const secondCupFullName = faker.lorem.words();
  const secondCupShortName = faker.lorem.words();
  const secondMapName = 'st1';

  beforeEach(() => {
    loginAs(UserRoles.CUP_ORGANIZER);
  });

  it('should add simple offline cup correctly', () => {
    cy.visit('/admin/cups');
    cy.get('[data-test-id=add-offline-cup-button]').click();

    cy.intercept(
      {
        method: 'GET',
        url: '/api/admin/cups/get-worldspawn-map-info?map=crosspath',
      },
      {
        statusCode: 200,
        body: {
          name: 'crosspath',
          size: '11.09',
          author: 'Rust7',
          pk3: 'https://ws.q3df.org/maps/downloads/crosspath.pk3',
          weapons: {
            grenade: true,
            rocket: true,
            plasma: true,
            lightning: true,
            bfg: true,
            railgun: true,
            shotgun: false,
            grapple: false,
            machinegun: false,
            gauntlet: false,
          },
          levelshot: 'https://ws.q3df.org/images/levelshots/512x384/crosspath.jpg',
        },
      },
    );

    // filling the form
    cy.get('[data-test-id=offline-cup-fullname-input]').type(initialCupFullName);
    cy.get('[data-test-id=offline-cup-shortname-input]').type(initialCupShortName);
    cy.get('[data-test-id=offline-cup-starttime-input]').type(cupStartTime);
    cy.get('[data-test-id=offline-cup-endtime-input]').type(cupEndTime);
    cy.get('[data-test-id=offline-cup-map-ws-radio]').click();
    cy.get('[data-test-id=cup-mapname-input]').type(initialMapName);

    // checking autofilled form values
    cy.get('[data-test-id=offline-cup-pk3link-input]')
      .invoke('val')
      .should('contain', 'https://ws.q3df.org/maps/downloads/crosspath.pk3');
    cy.get('[data-test-id=offline-cup-levelshotlink-input]')
      .invoke('val')
      .should('contain', 'https://ws.q3df.org/images/levelshots/512x384/crosspath.jpg');
    cy.get('[data-test-id=offline-cup-mapauthor-input]').invoke('val').should('contain', 'Rust7');
    cy.get('[data-test-id=offline-cup-weapon-g-checkbox]').should('have.class', 'mat-mdc-checkbox-checked');
    cy.get('[data-test-id=offline-cup-weapon-r-checkbox]').should('have.class', 'mat-mdc-checkbox-checked');
    cy.get('[data-test-id=offline-cup-weapon-p-checkbox]').should('have.class', 'mat-mdc-checkbox-checked');
    cy.get('[data-test-id=offline-cup-weapon-l-checkbox]').should('have.class', 'mat-mdc-checkbox-checked');
    cy.get('[data-test-id=offline-cup-weapon-b-checkbox]').should('have.class', 'mat-mdc-checkbox-checked');
    cy.get('[data-test-id=offline-cup-weapon-i-checkbox]').should('have.class', 'mat-mdc-checkbox-checked');

    cy.get('[data-test-id=offline-cup-submit-button]').click();

    // checking admin cups list
    cy.get('[data-test-id=cup-fullname-text]').first().should('contain.text', initialCupFullName);

    // checking mainpage
    cy.visit('/');
    cy.get('[data-test-id=cup-map-link]').first().should('contain.text', initialMapName);
  });

  it('should edit simple offline cup correctly', () => {
    cy.visit('/admin/cups');
    cy.get('[data-test-id=edit-cup-button]').first().click();

    cy.intercept(
      {
        method: 'GET',
        url: '/api/admin/cups/get-worldspawn-map-info?map=st1',
      },
      {
        statusCode: 200,
        body: {
          name: 'st1',
          size: '0.48',
          author: 'NoSkey',
          pk3: 'https://ws.q3df.org/maps/downloads/st1.pk3',
          weapons: {
            grenade: false,
            rocket: false,
            plasma: false,
            lightning: false,
            bfg: false,
            railgun: false,
            shotgun: false,
            grapple: false,
            machinegun: false,
            gauntlet: true,
          },
          levelshot: 'https://ws.q3df.org/images/levelshots/512x384/st1.jpg',
        },
      },
    );

    // filling the form
    cy.get('[data-test-id=offline-cup-fullname-input]').clear().type(secondCupFullName);
    cy.get('[data-test-id=offline-cup-shortname-input]').clear().type(secondCupShortName);
    cy.get('[data-test-id=offline-cup-map-ws-radio]').click();
    cy.get('[data-test-id=cup-mapname-input]').clear().type(secondMapName);

    // checking autofilled form values
    cy.get('[data-test-id=offline-cup-pk3link-input]')
      .invoke('val')
      .should('contain', 'https://ws.q3df.org/maps/downloads/st1.pk3');
    cy.get('[data-test-id=offline-cup-levelshotlink-input]')
      .invoke('val')
      .should('contain', 'https://ws.q3df.org/images/levelshots/512x384/st1.jpg');
    cy.get('[data-test-id=offline-cup-mapauthor-input]').invoke('val').should('contain', 'NoSkey');
    cy.get('[data-test-id=offline-cup-weapon-u-checkbox]').should('have.class', 'mat-mdc-checkbox-checked');
    cy.get('[data-test-id=offline-cup-weapon-g-checkbox]').should('not.have.class', 'mat-mdc-checkbox-checked');
    cy.get('[data-test-id=offline-cup-weapon-r-checkbox]').should('not.have.class', 'mat-mdc-checkbox-checked');
    cy.get('[data-test-id=offline-cup-weapon-p-checkbox]').should('not.have.class', 'mat-mdc-checkbox-checked');
    cy.get('[data-test-id=offline-cup-weapon-l-checkbox]').should('not.have.class', 'mat-mdc-checkbox-checked');
    cy.get('[data-test-id=offline-cup-weapon-b-checkbox]').should('not.have.class', 'mat-mdc-checkbox-checked');
    cy.get('[data-test-id=offline-cup-weapon-i-checkbox]').should('not.have.class', 'mat-mdc-checkbox-checked');

    cy.get('[data-test-id=offline-cup-submit-button]').click();

    // checking admin cups list
    cy.get('[data-test-id=cup-fullname-text]').first().should('contain.text', secondCupFullName);

    // checking mainpage
    cy.visit('/');
    cy.get('[data-test-id=cup-map-link]').first().should('contain.text', secondMapName);
  });

  it('should delete simple offline cup correctly', () => {
    cy.visit('/admin/cups');

    cy.get('[data-test-id=cup-fullname-text]')
      .first()
      .invoke('text')
      .then((firstCupFullName: string) => {
        cy.get('[data-test-id=delete-cup-button]').first().click();
        cy.get('mat-snack-bar-container').find('button.mat-mdc-snack-bar-action').click();

        // checking admin news list
        cy.get('[data-test-id=cup-fullname-text]').first().should('not.contain.text', firstCupFullName);

        // checking snackbar
        cy.get('simple-snack-bar').find('.mat-mdc-snack-bar-label').should('contain.text', 'Successfully deleted');
      });
  });
});
