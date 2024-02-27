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
  const initialRussianTitle = faker.lorem.words();
  const initialEnglishTitle = faker.lorem.words();
  const initialRussianText = faker.lorem.words();
  const initialEnglishText = faker.lorem.words();
  const initialYoutubeId = 'hN6VNnOPYaw';
  const editedRussianTitle = faker.lorem.words();
  const editedEnglishTitle = faker.lorem.words();
  const editedRussianText = faker.lorem.words();
  const editedEnglishText = faker.lorem.words();
  const editedYoutubeId = 'g_JzrGR-jDY';

  beforeEach(() => {
    cy.visit('/');
    loginAs(UserRoles.NEWSMAKER);
  });

  it('should add simple news correctly', () => {
    cy.get('[data-test-id=admin-panel-button]').click();
    cy.get('[data-test-id=add-simple-news-button]').click();

    // filling the form
    cy.get('[data-test-id=russian-news-title-input]').type(initialRussianTitle);
    cy.get('[data-test-id=english-news-title-input]').type(initialEnglishTitle);
    cy.get('[data-test-id=custom-time-option-radio]').click();
    cy.get('[data-test-id=news-posting-time-input]').type(moment().subtract('1', 'day').format('YYYY-MM-DDTHH:mm'));
    cy.get('[data-test-id=russian-text-quill]').find('.ql-editor').type(initialRussianText);
    cy.get('[data-test-id=english-text-quill]').find('.ql-editor').type(initialEnglishText);
    cy.get('[data-test-id=youtube-input]').type(initialYoutubeId);
    cy.get('[data-test-id=save-simple-news-button]').click();

    // checking admin news list
    cy.get('[data-test-id=news-title-text]').first().should('contain.text', initialEnglishTitle);

    // checking main page in both languages
    cy.visit('/');
    cy.get('[data-test-id=news-header-text]').first().should('contain.text', initialRussianTitle);
    cy.get('[data-test-id=news-html-text]').first().should('contain.text', initialRussianText);
    cy.get('[data-test-id=youtube-cover-image]').first().invoke('attr', 'src').should('contain', initialYoutubeId);
    cy.get('[data-test-id=language-toggle]').click();
    cy.get('[data-test-id=news-header-text]').first().should('contain.text', initialEnglishTitle);
    cy.get('[data-test-id=news-html-text]').first().should('contain.text', initialEnglishText);
    cy.get('[data-test-id=language-toggle]').click();
  });

  it('should edit simple news correctly', () => {
    cy.get('[data-test-id=admin-panel-button]').click();
    cy.get('[data-test-id=edit-news-button]').first().click();

    // filling the form
    cy.get('[data-test-id=russian-news-title-input]').clear().type(editedRussianTitle);
    cy.get('[data-test-id=english-news-title-input]').clear().type(editedEnglishTitle);
    cy.get('[data-test-id=now-option-radio]').click();
    cy.get('[data-test-id=russian-text-quill]').find('.ql-editor').clear().type(editedRussianText);
    cy.get('[data-test-id=english-text-quill]').find('.ql-editor').clear().type(editedEnglishText);
    cy.get('[data-test-id=youtube-input]').clear().type(editedYoutubeId);
    cy.get('[data-test-id=save-simple-news-button]').click();

    // checking admin news list
    cy.get('[data-test-id=news-title-text]').first().should('contain.text', editedEnglishTitle);

    // checking main page in both languages
    cy.visit('/');
    cy.get('[data-test-id=news-header-text]').first().should('contain.text', editedRussianTitle);
    cy.get('[data-test-id=news-html-text]').first().should('contain.text', editedRussianText);
    cy.get('[data-test-id=youtube-cover-image]').first().invoke('attr', 'src').should('contain', editedYoutubeId);
    cy.get('[data-test-id=language-toggle]').click();
    cy.get('[data-test-id=news-header-text]').first().should('contain.text', editedEnglishTitle);
    cy.get('[data-test-id=news-html-text]').first().should('contain.text', editedEnglishText);
    cy.get('[data-test-id=language-toggle]').click();
  });

  it('should delete simple news correctly', () => {
    cy.get('[data-test-id=admin-panel-button]').click();
    cy.get('[data-test-id=delete-news-button]').first().click();
    cy.get('mat-snack-bar-container').find('button.mat-mdc-snack-bar-action').click();

    // checking admin news list
    cy.get('[data-test-id=news-title-text]').first().should('not.contain.text', editedEnglishTitle);

    // checking snackbar
    cy.get('simple-snack-bar').find('.mat-mdc-snack-bar-label').should('contain.text', 'Successfully deleted');   
  });
});