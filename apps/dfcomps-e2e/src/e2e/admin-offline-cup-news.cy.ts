import { UserRoles } from '@dfcomps/auth';
import { logOut, loginAs } from '../support/app.po';
import { addOfflineCup } from '../support/offline-cup-operations';

describe('admin offline cups news', () => {
  before(() => {
    addOfflineCup('crosspath');
    addOfflineCup('st1', { needToLogin: false });
    logOut({ isHeaderVisible: false });
  });

  beforeEach(() => {
    cy.visit('/');
    loginAs(UserRoles.NEWSMAKER);
  });

  it('should add start offline cup news correctly', () => {
    cy.visit('/admin/news');
    cy.get('[data-test-id=admin-news-type-select]').click();
    cy.get('mat-option').contains('Offline cup start').click();
    cy.get('[data-test-id=add-news-button]').click();

    cy.wait(3000);
  });
});
