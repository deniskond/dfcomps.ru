import { UserRoles } from "@dfcomps/auth";
import { logOut, loginAs } from "../support/app.po";
import * as moment from 'moment';
import * as faker from 'faker';

describe('authorization', () => {
  it('should login and logout correctly', () => {
    loginAs(UserRoles.USER);
    cy.get('[data-test-id=user-nick-text]').should('contain.text', UserRoles.USER.toLowerCase());
    logOut();
    cy.get('[data-test-id=user-nick-text]').should('not.exist');
  });
});

describe('admin panel news', () => {
  before(() => {
    loginAs(UserRoles.NEWSMAKER);
    cy.get('[data-test-id=admin-panel-button]').click();
  });

  it('should add simple news correctly', () => {
    const russianTitle = faker.lorem.words();
    const englishTitle = faker.lorem.words();
    const russianText = faker.lorem.words();
    const englishText = faker.lorem.words();
    const youtubeId = 'hN6VNnOPYaw';

    // filling the form
    cy.get('[data-test-id=add-simple-news-button]').click();
    cy.get('[data-test-id=russian-news-title-input]').type(russianTitle);
    cy.get('[data-test-id=english-news-title-input]').type(englishTitle);
    cy.get('[data-test-id=custom-time-option-radio]').click();
    cy.get('[data-test-id=news-posting-time-input]').type(moment().subtract('1', 'day').format('YYYY-MM-DDTHH:mm'));
    cy.get('[data-test-id=russian-text-quill]').find('.ql-editor').type(russianText);
    cy.get('[data-test-id=english-text-quill]').find('.ql-editor').type(englishText);
    cy.get('[data-test-id=youtube-input]').type(youtubeId);
    cy.get('[data-test-id=save-simple-news-button]').click();

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
  });

  // it('should edit simple news correctly', () => {
    
  // });

  // it('should delete simple news correctly', () => {
    
  // });
});