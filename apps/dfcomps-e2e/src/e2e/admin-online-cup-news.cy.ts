import { UserRoles } from '@dfcomps/auth';
import { logOut, loginAs } from '../support/app.po';
import { addOnlineCup } from '../support/online-cup-operations';
import * as faker from 'faker';
import * as moment from 'moment';

describe('admin online cup news', () => {
  let onlineCupName: string;

  before(() => {
    onlineCupName = addOnlineCup();
    logOut({ isHeaderVisible: false });
  });

  beforeEach(() => {
    loginAs(UserRoles.NEWSMAKER);
  });

  it('should add online cup announcement correctly', () => {
    const russianTitle = faker.lorem.words();
    const englishTitle = faker.lorem.words();
    const russianText = faker.lorem.words();
    const englishText = faker.lorem.words();
    const youtubeId = 'hN6VNnOPYaw';

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
    cy.get('[data-test-id=youtube-input]').type(youtubeId);
    cy.get('[data-test-id=news-cup-select]').click();
    cy.get('mat-option').contains(onlineCupName).click();

    cy.get('[data-test-id=news-action-button]').click();

    // checking admin news list
    cy.get('[data-test-id=news-title-text]').first().should('contain.text', englishTitle);

    // checking main page in both languages
    cy.visit('/');
    cy.get('[data-test-id=news-header-text]').first().should('contain.text', russianTitle);
    cy.get('[data-test-id=news-html-text]').first().should('contain.text', russianText);
    cy.get('[data-test-id=youtube-cover-image]').first().invoke('attr', 'src').should('contain', youtubeId);
    cy.get('[data-test-id=language-toggle]').click();
    cy.get('[data-test-id=news-header-text]').first().should('contain.text', englishTitle);
    cy.get('[data-test-id=news-html-text]').first().should('contain.text', englishText);
    cy.get('[data-test-id=language-toggle]').click();

    cy.get('.news-block').first().find('[data-test-id=online-cup-players-table]').should('exist');
  });

  it('should add online cup results correctly', () => {
    const russianTitle = faker.lorem.words();
    const englishTitle = faker.lorem.words();
    const russianText = faker.lorem.words();
    const englishText = faker.lorem.words();
    const youtubeId = 'hN6VNnOPYaw';

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
    cy.get('[data-test-id=youtube-input]').type(youtubeId);
    cy.get('[data-test-id=news-cup-select]').click();
    cy.get('mat-option').contains(onlineCupName).click();

    cy.get('[data-test-id=news-action-button]').click();

    // checking admin news list
    cy.get('[data-test-id=news-title-text]').first().should('contain.text', englishTitle);

    // checking main page in both languages
    cy.visit('/');
    cy.get('[data-test-id=news-header-text]').first().should('contain.text', russianTitle);
    cy.get('[data-test-id=news-html-text]').first().should('contain.text', russianText);
    cy.get('[data-test-id=youtube-cover-image]').first().invoke('attr', 'src').should('contain', youtubeId);
    cy.get('[data-test-id=language-toggle]').click();
    cy.get('[data-test-id=news-header-text]').first().should('contain.text', englishTitle);
    cy.get('[data-test-id=news-html-text]').first().should('contain.text', englishText);
    cy.get('[data-test-id=language-toggle]').click();

    cy.get('.news-block').first().find('[data-test-id=online-results-table]').should('exist');
  });
});
