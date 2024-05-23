import { UserRoles } from '@dfcomps/auth';
import { logOut, loginAs } from '../support/app.po';
import { addOfflineCup } from '../support/offline-cup-operations';
import * as moment from 'moment';

describe('offline cup full cycle', () => {
  before(() => {
    cy.visit('/');
    addOfflineCup('st1', { needToLogin: true, needToAddNews: true });
    logOut({ isHeaderVisible: false });
  });

  it('should display errors on invalid demo upload', () => {
    loginAs(UserRoles.USER);

    cy.get('[data-test-id=input-demo-upload]').selectFile(
      'test-data/offline-cup/fully-invalid/st1[df.vq3]00.05.616(Nosf.Russia).dm_68',
    );
    cy.get('[data-test-id=button-demo-upload]').click();

    cy.get('[data-test-id=table-validation-errors]').should('exist');
    cy.get('[data-test-id=table-validation-errors]').should('contain.text', 'defrag_svfps');
    cy.get('[data-test-id=table-validation-errors]').should('contain.text', 'pmove_and_gsync');
    cy.get('[data-test-id=table-validation-errors]').should('contain.text', 'g_knockback');
    cy.get('[data-test-id=table-validation-errors]').should('contain.text', 'sv_cheats');
    cy.get('[data-test-id=table-validation-errors]').should('contain.text', 'g_speed');
    cy.get('[data-test-id=table-validation-errors]').should('contain.text', 'timescale');
  });

  it('should display overbounce popup on valid demo with overbounce upload', () => {
    loginAs(UserRoles.USER);

    cy.get('[data-test-id=input-demo-upload]').selectFile(
      'test-data/offline-cup/valid-killobs-0/st1[df.vq3]00.07.360(Nosf.Russia).dm_68',
    );
    cy.get('[data-test-id=button-demo-upload]').click();

    cy.get('[data-test-id=table-validation-errors]').should('not.exist');
    cy.get('[data-test-id=text-killobs-warning]').should('exist');
  });

  it('should not display overbounce popup on valid demo without overbounces upload', () => {
    loginAs(UserRoles.USER);

    cy.get('[data-test-id=input-demo-upload]').selectFile(
      'test-data/offline-cup/valid-killobs-1/st1[df.vq3]00.07.384(Nosf.Russia).dm_68',
    );
    cy.get('[data-test-id=button-demo-upload]').click();

    cy.get('[data-test-id=table-validation-errors]').should('not.exist');
    cy.get('[data-test-id=text-killobs-warning]').should('not.exist');

    cy.get('simple-snack-bar').find('.mat-mdc-snack-bar-label').should('exist');
  });

  it('should upload several demos correctly', () => {
    // tr demo
    loginAs(UserRoles.MODERATOR);
    cy.get('[data-test-id=input-demo-upload]').selectFile(
      'test-data/offline-cup/tr-demo/st1[df.vq3]00.07.808(Nosf.Russia).dm_68',
    );
    cy.get('[data-test-id=button-demo-upload]').click();
    logOut();

    // valid cpm demo 1
    loginAs(UserRoles.VALIDATOR);
    cy.get('[data-test-id=input-demo-upload]').selectFile(
      'test-data/offline-cup/valid-extra-demos/st1[df.cpm]00.07.416(Nosf.Russia).dm_68',
    );
    cy.get('[data-test-id=button-demo-upload]').click();
    logOut();

    // valid cpm demo 2
    loginAs(UserRoles.STREAMER);
    cy.get('[data-test-id=input-demo-upload]').selectFile(
      'test-data/offline-cup/valid-extra-demos/st1[df.cpm]00.07.432(Nosf.Russia).dm_68',
    );
    cy.get('[data-test-id=button-demo-upload]').click();
  });

  it('should download validation archive', () => {
    // moving endtime of cup and result news in database
    cy.task('queryDb', 'SELECT "id" FROM cups ORDER BY id DESC LIMIT 1').then((queryResult: { id: number }[]) => {
      const cupId: number = queryResult[0].id;

      cy.task('queryDb', `UPDATE cups SET end_datetime = '${moment().format()}' WHERE id = ${cupId}`);
      cy.task(
        'queryDb',
        `UPDATE news SET datetimezone = '${moment().format()}' WHERE "newsTypeId" = 5 AND "cupId" = ${cupId}`,
      );

      cy.intercept('GET', `/api/cup/validation-archive-link/${cupId}`).as('validationArchiveRequest');
      loginAs(UserRoles.VALIDATOR);
      cy.get('[data-test-id=button-validation-archive]').first().click();

      cy.wait('@validationArchiveRequest').then((interception) => {
        expect(interception.response.statusCode).to.equal(200);
      });
    });
  });

  it('should set validation result', () => {
    const invalidDemoText = '6.4 Timereset';

    loginAs(UserRoles.VALIDATOR);

    cy.visit('/admin/cups');
    cy.get('[data-test-id=button-offline-cup-actions]').first().click();
    cy.get('[data-test-id=button-validate-demos]').click();
    cy.get('[data-test-id=button-set-all-demos-valid]').click();
    cy.get('[data-test-id=radio-invalid]').eq(2).click();
    cy.get('[data-test-id=input-invalid-reason]').eq(2).type(invalidDemoText);
    cy.get('[data-test-id=button-submit-validation]').click();

    cy.visit('/');
    cy.get('.news-block').first().find('[data-test-id=text-invalid-demos]').should('exist');
    cy.get('.news-block').first().should('contain.text', invalidDemoText);
  });

  it('should finish cup correctly', () => {
    loginAs(UserRoles.VALIDATOR);

    cy.visit('/admin/cups');
    cy.get('[data-test-id=button-offline-cup-actions]').first().click();
    cy.get('[data-test-id=button-finish-offline-cup]').click();

    cy.visit('/');
    cy.get('.news-block').first().find('[data-test-id=text-rating-change]').should('exist');  
    cy.get('.news-block').first().find('[data-test-id=button-all-demos-archive]').should('exist');
  });
});
