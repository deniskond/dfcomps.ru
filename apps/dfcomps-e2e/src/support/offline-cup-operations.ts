import { UserRoles } from '@dfcomps/auth';
import { loginAs } from './app.po';
import * as faker from 'faker';
import * as moment from 'moment';

export function addOfflineCup(mapName: string, options: { needToLogin: boolean } = { needToLogin: true }): string {
  const fullName = faker.lorem.words();
  const testAuthorValue = faker.lorem.word();

  if (options.needToLogin) {
    cy.visit('/');
    loginAs(UserRoles.CUP_ORGANIZER);
  }

  cy.visit('/admin/cups');
  cy.get('[data-test-id=add-offline-cup-button]').click();

  cy.intercept(
    {
      method: 'GET',
      url: `/api/admin/cups/get-worldspawn-map-info?map=${mapName}`,
    },
    {
      statusCode: 200,
      body: {
        name: mapName,
        size: '1',
        author: testAuthorValue,
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
  cy.get('[data-test-id=offline-cup-fullname-input]').type(fullName);
  cy.get('[data-test-id=offline-cup-shortname-input]').type(faker.lorem.words());
  cy.get('[data-test-id=offline-cup-starttime-input]').type(moment().subtract('1', 'day').format('YYYY-MM-DDTHH:mm'));
  cy.get('[data-test-id=offline-cup-endtime-input]').type(moment().add('1', 'day').format('YYYY-MM-DDTHH:mm'));
  cy.get('[data-test-id=offline-cup-map-ws-radio]').click();
  cy.get('[data-test-id=cup-mapname-input]').type(mapName);
  cy.get('[data-test-id=offline-cup-add-news-checkbox]').click();
  
  cy.get('[data-test-id=offline-cup-mapauthor-input]').invoke('val').should('contain', testAuthorValue);
  cy.get('[data-test-id=offline-cup-submit-button]').click();

  return fullName;
}
