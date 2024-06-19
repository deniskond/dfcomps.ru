import { UserRoles } from '@dfcomps/auth';
import { logOut, loginAs } from '../support/app.po';
import * as faker from 'faker';
import * as moment from 'moment';
import { addMultiCup } from '../support/multicup-operations';

describe('admin multicup news', () => {
  let multicupName: string;
  const russianTitle = faker.lorem.words();
  const englishTitle = faker.lorem.words();
  const russianText = faker.lorem.words();
  const englishText = faker.lorem.words();

  before(() => {
    multicupName = addMultiCup();
    logOut({ isHeaderVisible: false });
  });

  beforeEach(() => {
    loginAs(UserRoles.NEWSMAKER);
  });

  it('should add multicup results news correctly', () => {
    cy.visit('/admin/news');
    cy.get('[data-test-id=admin-news-type-select]').click();
    cy.get('mat-option').contains('Multicup results').click();
    cy.get('[data-test-id=add-news-button]').click();

    // filling the form
    cy.get('[data-test-id=russian-news-title-input]').type(russianTitle);
    cy.get('[data-test-id=english-news-title-input]').type(englishTitle);
    cy.get('[data-test-id=custom-time-option-radio]').click();
    cy.get('[data-test-id=news-posting-time-input]').type(moment().format('YYYY-MM-DDTHH:mm'));
    cy.get('[data-test-id=russian-text-quill]').find('.ql-editor').type(russianText);
    cy.get('[data-test-id=english-text-quill]').find('.ql-editor').type(englishText);

    cy.get('[data-test-id=news-multicup-select]').click();
    cy.get('mat-option').contains(multicupName).click();

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

    cy.get('.news-block').first().find('[data-test-id=multicup-physics-table-vq3]').should('exist');
    cy.get('.news-block').first().find('[data-test-id=multicup-physics-table-cpm]').should('exist');
  });
});
