// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Quill 2.x serializes spaces as &nbsp; (\u00A0) in its HTML output.
// This command normalizes non-breaking spaces to regular spaces before asserting.
Cypress.Commands.add('containsText', { prevSubject: 'element' }, (subject, text: string) => {
  cy.wrap(subject)
    .invoke('text')
    .then((actual: string) => {
      expect(actual.replace(/\u00A0/g, ' ')).to.include(text);
    });
});

