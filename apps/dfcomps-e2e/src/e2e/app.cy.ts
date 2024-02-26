import { UserRoles } from "@dfcomps/auth";
import { logOut, loginAs } from "../support/app.po";

describe('authorization', () => {
  it('should login and logout correctly', () => {
    loginAs(UserRoles.USER);
    cy.get('[data-test-id=user-nick-text]').should('contain.text', UserRoles.USER.toLowerCase());
    logOut();
    cy.get('[data-test-id=user-nick-text]').should('not.exist');
  });
});
