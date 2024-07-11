import { UserRoles } from '@dfcomps/auth';
import { logOut, loginAs } from '../support/app.po';
import * as moment from 'moment';
import * as faker from 'faker';
import { addOnlineCup } from '../support/online-cup-operations';
import { getInsertPlayersQuery } from './../../test-data/online-cup/insert-players-query-generator';

describe('admin online cups basic operations', () => {
  const initialCupFullName = faker.lorem.words();
  const initialCupShortName = faker.lorem.words();
  const cupStartTime = moment().add('1', 'day').format('YYYY-MM-DDTHH:mm');

  const secondCupFullName = faker.lorem.words();
  const secondCupShortName = faker.lorem.words();

  beforeEach(() => {
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

    // checking two servers switch
    cy.get('[data-test-id=online-cup-two-servers-checkbox]').click();
    cy.get('[data-test-id=online-cup-server2-input]', { timeout: 500 }).should('not.exist');
    cy.get('[data-test-id=online-cup-two-servers-checkbox]').click();
    cy.get('[data-test-id=online-cup-server2-input]').should('exist');

    // adding online cup and checking admin cups list
    cy.get('[data-test-id=online-cup-submit-button]').click();
    cy.get('[data-test-id=cup-fullname-text]').first().should('contain.text', initialCupFullName);
  });

  it('should edit online cup correctly', () => {
    cy.visit('/admin/cups');
    cy.get('[data-test-id=edit-cup-button]').first().click();

    // filling the form
    cy.get('[data-test-id=online-cup-fullname-input]').clear().type(secondCupFullName);
    cy.get('[data-test-id=online-cup-shortname-input]').clear().type(secondCupShortName);

    // submitting form and checking admin cups list
    cy.get('[data-test-id=online-cup-submit-button]').click();
    cy.get('[data-test-id=cup-fullname-text]').first().should('contain.text', secondCupFullName);
  });

  it('should delete online cup correctly', () => {
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

describe('admin online cup full cycle', () => {
  let onlineCupName: string;
  const map1 = faker.lorem.word();
  const map2 = faker.lorem.word();
  const map3 = faker.lorem.word();
  const map4 = faker.lorem.word();
  const map5 = faker.lorem.word();

  before(() => {
    onlineCupName = addOnlineCup();
    logOut({ isHeaderVisible: false });
  });

  it('should add online cup announcement correctly', () => {
    loginAs(UserRoles.NEWSMAKER);

    const russianTitle = faker.lorem.words();
    const englishTitle = faker.lorem.words();
    const russianText = faker.lorem.words();
    const englishText = faker.lorem.words();

    cy.visit('/admin/news');
    cy.get('[data-test-id=admin-news-type-select]').click();
    cy.get('mat-option').contains('Online cup announce').click();
    cy.get('[data-test-id=add-news-button]').click();

    // filling the form
    cy.get('[data-test-id=russian-news-title-input]').type(russianTitle);
    cy.get('[data-test-id=english-news-title-input]').type(englishTitle);
    cy.get('[data-test-id=custom-time-option-radio]').click();
    cy.get('[data-test-id=news-posting-time-input]').type(moment().format('YYYY-MM-DDTHH:mm'));
    cy.get('[data-test-id=russian-text-quill]').find('.ql-editor').type(russianText);
    cy.get('[data-test-id=english-text-quill]').find('.ql-editor').type(englishText);
    cy.get('[data-test-id=news-cup-select]').click();
    cy.get('mat-option').contains(onlineCupName).click();

    cy.get('[data-test-id=news-action-button]').click();

    // checking admin news list
    cy.get('[data-test-id=news-title-text]').first().should('contain.text', englishTitle);

    // checking main page in both languages
    cy.visit('/');
    cy.get('[data-test-id=news-header-text]').first().should('contain.text', russianTitle);
    cy.get('[data-test-id=news-html-text]').first().should('contain.text', russianText);
    cy.get('[data-test-id=language-toggle]').click();
    cy.get('[data-test-id=news-header-text]').first().should('contain.text', englishTitle);
    cy.get('[data-test-id=news-html-text]').first().should('contain.text', englishText);
    cy.get('[data-test-id=language-toggle]').click();

    cy.get('.news-block').first().find('[data-test-id=online-cup-players-table]').should('exist');
  });

  it('registration and cancelling registration for online cup', () => {
    loginAs(UserRoles.USER);

    cy.visit('/');
    cy.get('[data-test-id=button-toggle-cup-registration]').click();
    cy.get('[data-test-id=online-cup-players-table]')
      .find('[data-test-id=text-player-nick]')
      .should('contain.text', 'user');
    cy.get('[data-test-id=button-toggle-cup-registration]').click();
    cy.get('[data-test-id=online-cup-players-table]').find('[data-test-id=text-player-nick]').should('not.exist');
  });

  it('should add online cup maps correctly', () => {
    loginAs(UserRoles.CUP_ORGANIZER);

    cy.visit('/admin/cups');
    cy.get('[data-test-id=button-online-cup-actions]').first().click();
    cy.get('[data-test-id=button-input-results]').click();

    // checking buttons states
    cy.get('[data-test-id=button-input-results-1]').should('be.disabled');
    cy.get('[data-test-id=button-input-results-2]').should('be.disabled');
    cy.get('[data-test-id=button-input-results-3]').should('be.disabled');
    cy.get('[data-test-id=button-input-results-4]').should('be.disabled');
    cy.get('[data-test-id=button-input-results-5]').should('be.disabled');

    // setting maps
    cy.get('[data-test-id=input-map-1]').type(map1);
    cy.get('[data-test-id=input-map-2]').type(map2);
    cy.get('[data-test-id=input-map-3]').type(map3);
    cy.get('[data-test-id=input-map-4]').type(map4);
    cy.get('[data-test-id=input-map-5]').type(map5);

    // saving maps
    cy.get('[data-test-id=button-save-all-maps]').click();

    // checking first two button states
    cy.get('[data-test-id=button-input-results-1]').should('be.enabled');
    cy.get('[data-test-id=button-input-results-2]').should('be.disabled');
  });

  it("should display streamer's timer correctly", () => {
    loginAs(UserRoles.STREAMER);

    cy.visit('/');
    cy.get('[data-test-id=streamers-timer-button]').click();

    // checking maps name
    cy.get('[data-test-id=button-map-1]').click();
    cy.get('[data-test-id=button-map-1]').should('contain.text', map1);
    cy.get('[data-test-id=button-map-2]').click();
    cy.get('[data-test-id=button-map-2]').should('contain.text', map2);
    cy.get('[data-test-id=button-map-3]').click();
    cy.get('[data-test-id=button-map-3]').should('contain.text', map3);
    cy.get('[data-test-id=button-map-4]').click();
    cy.get('[data-test-id=button-map-4]').should('contain.text', map4);
    cy.get('[data-test-id=button-map-5]').click();
    cy.get('[data-test-id=button-map-5]').should('contain.text', map5);

    // should be available by link without authorization
    cy.url().then((url: string) => {
      logOut({ isHeaderVisible: false });
      cy.visit(url);
      cy.get('[data-test-id=button-map-1]').should('exist');
    });
  });

  it('inserting online cup players', () => {
    cy.task('queryDb', 'SELECT "id" FROM cups ORDER BY id DESC LIMIT 1').then((queryResult: { id: number }[]) => {
      const cupId: number = queryResult[0].id;

      cy.task('queryDb', getInsertPlayersQuery(cupId));
    });
  });

  it('balancing players', () => {
    loginAs(UserRoles.CUP_ORGANIZER);

    cy.visit('/admin/cups');
    cy.get('[data-test-id=button-online-cup-actions]').first().click();
    cy.get('[data-test-id=button-balance-players]').click();

    cy.get('[data-test-id=text-balance-player-nick]')
      .first()
      .invoke('text')
      .then((firstPlayerName: string) => {
        cy.get('[data-test-id=button-transfer-player]').first().click();
        cy.get('[data-test-id=text-balance-player-nick]').last().should('contain.text', firstPlayerName);
      });
  });

  it('should add online cup results correctly', () => {
    loginAs(UserRoles.CUP_ORGANIZER);

    cy.visit('/admin/cups');
    cy.get('[data-test-id=button-online-cup-actions]').first().click();
    cy.get('[data-test-id=button-input-results]').click();
    cy.get('[data-test-id=button-input-results-1]').click();

    // filling files (round 1)
    cy.get('[data-test-id=input-file-1]').selectFile('test-data/online-cup/oc-round1-server1-logs.txt');
    cy.get('[data-test-id=input-file-2]').selectFile('test-data/online-cup/oc-round1-server2-logs.txt');
    cy.get('[data-test-id=button-upload-server-logs]').click();
    cy.get('[data-test-id=text-player-servernick]').first().should('exist');

    // filling wrong manual result for round 1 (wrong name + non-dividable by 0.008)
    cy.get('[data-test-id=input-manual-player-select]').click();
    cy.get('mat-option').contains('Keeley').click();
    cy.get('[data-test-id=input-manual-time]').type('0.009');

    // checking 0.008 validation on manual form
    cy.get('[data-test-id=button-add-manual-result]').should('be.disabled');

    // filling 0.008-dividable result
    cy.get('[data-test-id=input-manual-time]').clear().type('70');
    cy.get('[data-test-id=button-add-manual-result]').should('be.enabled');
    cy.get('[data-test-id=button-add-manual-result]').click();

    // checking duplicate errors
    cy.get('[data-test-id=button-save-round-results]').should('be.disabled');

    // filling correct data
    cy.get('[data-test-id=input-final-player-select]').last().click();
    cy.get('mat-option').contains('Kirsten').click();
    cy.get('[data-test-id=button-save-round-results]').should('be.enabled');
    cy.get('[data-test-id=button-save-round-results]').click();

    // filling rounds 2 - 5
    for (let round = 2; round <= 5; round++) {
      cy.visit('/admin/cups');
      cy.get('[data-test-id=button-online-cup-actions]').first().click();
      cy.get('[data-test-id=button-input-results]').click();
      cy.get(`[data-test-id=button-input-results-${round}]`).should('be.enabled');
      cy.get(`[data-test-id=button-input-results-${round}]`).click();

      cy.get('[data-test-id=input-file-1]').selectFile(`test-data/online-cup/oc-round${round}-server1-logs.txt`);
      cy.get('[data-test-id=input-file-2]').selectFile(`test-data/online-cup/oc-round${round}-server2-logs.txt`);
      cy.get('[data-test-id=button-upload-server-logs]').click();
      cy.get('[data-test-id=text-player-servernick]').first().should('exist');
      cy.get('[data-test-id=button-save-round-results]').should('be.enabled');
      cy.get('[data-test-id=button-save-round-results]').click();
    }
  });

  it('finishing online cup', () => {
    loginAs(UserRoles.CUP_ORGANIZER);

    cy.visit('/admin/cups');
    cy.get('[data-test-id=button-online-cup-actions]').first().click();
    cy.get('[data-test-id=button-finish-online-cup]').should('be.enabled');
    cy.get('[data-test-id=button-finish-online-cup]').click();

    // checking snackbar
    cy.get('simple-snack-bar')
      .find('.mat-mdc-snack-bar-label')
      .should('contain.text', 'Online cup finished successfully');
  });

  it('should add online cup results news correctly', () => {
    loginAs(UserRoles.NEWSMAKER);

    const russianTitle = faker.lorem.words();
    const englishTitle = faker.lorem.words();
    const russianText = faker.lorem.words();
    const englishText = faker.lorem.words();

    cy.visit('/admin/news');
    cy.get('[data-test-id=admin-news-type-select]').click();
    cy.get('mat-option').contains('Online cup results').click();
    cy.get('[data-test-id=add-news-button]').click();

    // filling the form
    cy.get('[data-test-id=russian-news-title-input]').type(russianTitle);
    cy.get('[data-test-id=english-news-title-input]').type(englishTitle);
    cy.get('[data-test-id=custom-time-option-radio]').click();
    cy.get('[data-test-id=news-posting-time-input]').type(moment().format('YYYY-MM-DDTHH:mm'));
    cy.get('[data-test-id=russian-text-quill]').find('.ql-editor').type(russianText);
    cy.get('[data-test-id=english-text-quill]').find('.ql-editor').type(englishText);
    cy.get('[data-test-id=news-cup-select]').click();
    cy.get('mat-option').contains(onlineCupName).click();

    cy.get('[data-test-id=news-action-button]').click();

    // checking admin news list
    cy.get('[data-test-id=news-title-text]').first().should('contain.text', englishTitle);

    // checking main page in both languages
    cy.visit('/');
    cy.get('[data-test-id=news-header-text]').first().should('contain.text', russianTitle);
    cy.get('[data-test-id=news-html-text]').first().should('contain.text', russianText);
    cy.get('[data-test-id=language-toggle]').click();
    cy.get('[data-test-id=news-header-text]').first().should('contain.text', englishTitle);
    cy.get('[data-test-id=news-html-text]').first().should('contain.text', englishText);
    cy.get('[data-test-id=language-toggle]').click();

    // checking final results
    cy.get('.news-block')
      .first()
      .find('[data-test-id=online-results-table]')
      .find('[data-test-id=text-player-nick]')
      .first()
      .should('contain.text', 'Zetta');

    cy.get('.news-block')
      .first()
      .find('[data-test-id=online-results-table]')
      .find('[data-test-id=text-player-points]')
      .first()
      .should('contain.text', '4870');

    cy.get('.news-block')
      .first()
      .find('[data-test-id=online-results-table]')
      .find('[data-test-id=text-rating-change]')
      .first()
      .should('contain.text', '76');
  });
});
