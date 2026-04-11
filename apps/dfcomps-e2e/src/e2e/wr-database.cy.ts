import { UserRoles } from '@dfcomps/auth';
import { loginAs } from '../support/app.po';

// Available test demo files
const VQ3_7384 = 'test-data/offline-cup/valid-killobs-1/st1[df.vq3]00.07.384(Nosf.Russia).dm_68';
const VQ3_7360 = 'test-data/offline-cup/valid-killobs-0/st1[df.vq3]00.07.360(Nosf.Russia).dm_68';
const CPM_7416 = 'test-data/offline-cup/valid-extra-demos/st1[df.cpm]00.07.416(Nosf.Russia).dm_68';
const CPM_7432 = 'test-data/offline-cup/valid-extra-demos/st1[df.cpm]00.07.432(Nosf.Russia).dm_68';

describe('wr-database', () => {
  // Tests are sequential and share DB state.
  // Test 1: establishes VQ3 st1 WR at 0:07.384 (MY_DEMO → user)
  // Test 2: establishes CPM st1 WR at 0:07.416 (DFCOMPS_USER → moderator)
  // Test 3: improves VQ3 st1 WR to 0:07.360 (DF_NAME → "Nosf")
  // Test 4: rejects CPM 0:07.432 (slower than existing 0:07.416)

  it('should upload a personal VQ3 WR and display it in the list', () => {
    loginAs(UserRoles.USER);
    cy.visit('/wr-database');

    // MY_DEMO is selected by default; upload directly
    cy.get('[data-test-id=input-demo-upload]').selectFile(VQ3_7384, { force: true });
    cy.get('[data-test-id=button-demo-upload]').click();

    cy.get('simple-snack-bar').find('.mat-mdc-snack-bar-label')
      .should('contain.text', 'World record uploaded successfully!');

    // Filter the list to verify the entry appeared
    cy.get('[data-test-id=input-map-filter]').type('st1');
    cy.get('[data-test-id=physics-toggle]').contains('VQ3').click();
    cy.get('[data-test-id=demo-time-link]').should('contain.text', '0:07.384');
  });

  it('should upload WR attributed to a dfcomps user (DFCOMPS_USER, CPM)', () => {
    loginAs(UserRoles.USER);
    cy.visit('/wr-database');

    cy.get('[data-test-id=radio-dfcomps-user]').click();

    // Type into player search and pick from autocomplete
    cy.get('[data-test-id=input-player-search]').type('mod');
    cy.get('mat-option').contains('moderator').click();

    cy.get('[data-test-id=input-demo-upload]').selectFile(CPM_7416, { force: true });
    cy.get('[data-test-id=button-demo-upload]').click();

    cy.get('simple-snack-bar').find('.mat-mdc-snack-bar-label')
      .should('contain.text', 'World record uploaded successfully!');

    // CPM list should show 0:07.416 attributed to moderator
    cy.get('[data-test-id=input-map-filter]').type('st1');
    cy.get('[data-test-id=physics-toggle]').contains('CPM').click();
    cy.get('[data-test-id=demo-time-link]').should('contain.text', '0:07.416');
    cy.contains('moderator').should('exist');
  });

  it('should upload WR using df_name and improve the existing VQ3 WR', () => {
    loginAs(UserRoles.USER);
    cy.visit('/wr-database');

    cy.get('[data-test-id=radio-df-name]').click();

    // VQ3 7.360 is faster than the existing 7.384, so this should be accepted
    cy.get('[data-test-id=input-demo-upload]').selectFile(VQ3_7360, { force: true });
    cy.get('[data-test-id=button-demo-upload]').click();

    cy.get('simple-snack-bar').find('.mat-mdc-snack-bar-label')
      .should('contain.text', 'World record uploaded successfully!');

    // VQ3 list shows the improved time, old time is no longer current WR
    cy.get('[data-test-id=input-map-filter]').type('st1');
    cy.get('[data-test-id=physics-toggle]').contains('VQ3').click();
    cy.get('[data-test-id=demo-time-link]').should('contain.text', '0:07.360');
    cy.get('[data-test-id=demo-time-link]').should('not.contain.text', '0:07.384');

    // Player cell is absent; df_name "Nosf" (group 7 from filename) is shown instead
    cy.contains('Nosf').should('exist');
  });

  it('should reject an upload when the new time is not better than the existing WR', () => {
    loginAs(UserRoles.USER);
    cy.visit('/wr-database');

    // CPM 7.432 is slower than the existing CPM WR of 7.416
    cy.get('[data-test-id=input-demo-upload]').selectFile(CPM_7432, { force: true });
    cy.get('[data-test-id=button-demo-upload]').click();

    cy.get('simple-snack-bar').find('.mat-mdc-snack-bar-label')
      .should('contain.text', 'Current world record is equal or better');

    // CPM WR unchanged at 7.416
    cy.get('[data-test-id=input-map-filter]').type('st1');
    cy.get('[data-test-id=physics-toggle]').contains('CPM').click();
    cy.get('[data-test-id=demo-time-link]').should('contain.text', '0:07.416');
    cy.get('[data-test-id=demo-time-link]').should('not.contain.text', '0:07.432');
  });
});
