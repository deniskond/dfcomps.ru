/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    containsText(text: string): Chainable<JQuery<HTMLElement>>;
  }
}
