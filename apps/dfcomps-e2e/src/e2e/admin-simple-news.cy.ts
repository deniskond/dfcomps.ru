import { UserRoles } from '@dfcomps/auth';
import { loginAs } from '../support/app.po';
import * as moment from 'moment';
import * as faker from 'faker';

describe('admin panel simple news + embeds', () => {
  const initialRussianTitle = faker.lorem.words();
  const initialEnglishTitle = faker.lorem.words();
  const initialRussianText = faker.lorem.words();
  const initialEnglishText = faker.lorem.words();
  const editedRussianTitle = faker.lorem.words();
  const editedEnglishTitle = faker.lorem.words();
  const editedRussianText = faker.lorem.words();
  const editedEnglishText = faker.lorem.words();
  const initialYoutubeStreamerName = faker.lorem.word();
  const initialYoutubeStreamId = 'hN6VNnOPYaw';
  const initialTwitchStreamerName = faker.lorem.word();
  const initialTwitchStreamId = 'w00deh';
  const initialTwitchVideoName = faker.lorem.word();
  const initialTwitchVideoId = '2173539478';
  const editedYoutubeStreamerName = faker.lorem.word();
  const editedYoutubeStreamId = 'g_JzrGR-jDY';
  const editedTwitchStreamerName = faker.lorem.word();
  const editedTwitchStreamId = 'TimConLAN';
  const editedTwitchVideoName = faker.lorem.word();
  const editedTwitchVideoId = '2170249094';

  beforeEach(() => {
    loginAs(UserRoles.NEWSMAKER);
  });

  it('should add simple news with embeds correctly', () => {
    cy.get('[data-test-id=admin-panel-button]').click();
    cy.get('[data-test-id=add-news-button]').click();

    // filling the form
    cy.get('[data-test-id=russian-news-title-input]').type(initialRussianTitle);
    cy.get('[data-test-id=english-news-title-input]').type(initialEnglishTitle);
    cy.get('[data-test-id=custom-time-option-radio]').click();
    cy.get('[data-test-id=news-posting-time-input]').type(moment().format('YYYY-MM-DDTHH:mm'));
    cy.get('[data-test-id=russian-text-quill]').find('.ql-editor').type(initialRussianText);
    cy.get('[data-test-id=english-text-quill]').find('.ql-editor').type(initialEnglishText);
    cy.get('[data-test-id=input-image-upload]').first().selectFile('test-data/news/image.jpg');

    // embed 1 - youtube
    cy.get('[data-test-id=add-stream-button]').click();
    cy.get('[data-test-id=select-streaming-platform]').click();
    cy.get('mat-option').contains('YouTube').click();
    cy.get('[data-test-id=input-stream-link]').type(initialYoutubeStreamId);
    cy.get('[data-test-id=input-streamer-name]').type(initialYoutubeStreamerName);
    cy.get('[data-test-id=select-stream-language]').click();
    cy.get('mat-option').contains('Russian').click();

    // embed 2 - twitch video
    cy.get('[data-test-id=add-stream-button]').click();
    cy.get('[data-test-id=select-streaming-platform]').eq(1).click();
    cy.get('mat-option').contains('Twitch video').click();
    cy.get('[data-test-id=input-stream-link]').eq(1).type(initialTwitchVideoId);
    cy.get('[data-test-id=input-streamer-name]').eq(1).type(initialTwitchVideoName);
    cy.get('[data-test-id=select-stream-language]').eq(1).click();
    cy.get('mat-option').contains('Russian').click();

    // embed 3 - twitch channel
    cy.get('[data-test-id=add-stream-button]').click();
    cy.get('[data-test-id=select-streaming-platform]').eq(2).click();
    cy.get('mat-option').contains('Twitch channel').click();
    cy.get('[data-test-id=input-stream-link]').eq(2).type(initialTwitchStreamId);
    cy.get('[data-test-id=input-streamer-name]').eq(2).type(initialTwitchStreamerName);
    cy.get('[data-test-id=select-stream-language]').eq(2).click();
    cy.get('mat-option').contains('Russian').click();

    cy.get('[data-test-id=news-action-button]').click();

    // checking admin news list
    cy.get('[data-test-id=news-title-text]').first().should('contain.text', initialEnglishTitle);

    // checking main page in both languages
    cy.visit('/');
    cy.get('[data-test-id=news-header-text]').first().should('contain.text', initialRussianTitle);
    cy.get('[data-test-id=news-html-text]').first().should('contain.text', initialRussianText);
    cy.get('[data-test-id=language-toggle]').click();
    cy.get('[data-test-id=news-header-text]').first().should('contain.text', initialEnglishTitle);
    cy.get('[data-test-id=news-html-text]').first().should('contain.text', initialEnglishText);
    cy.get('[data-test-id=language-toggle]').click();

    // checking embeds
    cy.get('.news-block').first().find('[data-test-id=image-news]').should('exist');
    cy.get('.news-block')
      .first()
      .find('[data-test-id=youtube-cover-image]')
      .invoke('attr', 'src')
      .should('contain', initialYoutubeStreamId);
    cy.get('.news-block').first().find('[data-test-id=twitch-placeholder-image]').eq(0).should('exist');
    cy.get('.news-block').first().find('[data-test-id=twitch-placeholder-image]').eq(1).should('exist');
    cy.get('.news-block')
      .first()
      .find('[data-test-id=text-stream-title]')
      .eq(0)
      .should('contain.text', initialYoutubeStreamerName);
    cy.get('.news-block')
      .first()
      .find('[data-test-id=text-stream-title]')
      .eq(1)
      .should('contain.text', initialTwitchVideoName);
    cy.get('.news-block')
      .first()
      .find('[data-test-id=text-stream-title]')
      .eq(2)
      .should('contain.text', initialTwitchStreamerName);
  });

  it('should edit simple news with embeds correctly', () => {
    cy.get('[data-test-id=admin-panel-button]').click();
    cy.get('[data-test-id=edit-news-button]').first().click();

    // filling the form
    cy.get('[data-test-id=russian-news-title-input]').clear().type(editedRussianTitle);
    cy.get('[data-test-id=english-news-title-input]').clear().type(editedEnglishTitle);
    cy.get('[data-test-id=now-option-radio]').click();
    cy.get('[data-test-id=russian-text-quill]').find('.ql-editor').clear().type(editedRussianText);
    cy.get('[data-test-id=english-text-quill]').find('.ql-editor').clear().type(editedEnglishText);
    cy.get('[data-test-id=button-delete-image]').click();

    // embed 1 - youtube
    cy.get('[data-test-id=select-streaming-platform]').eq(0).click();
    cy.get('mat-option').contains('YouTube').click();
    cy.get('[data-test-id=input-stream-link]').eq(0).clear().type(editedYoutubeStreamId);
    cy.get('[data-test-id=input-streamer-name]').eq(0).clear().type(editedYoutubeStreamerName);
    cy.get('[data-test-id=select-stream-language]').eq(0).click();
    cy.get('mat-option').contains('Russian').click();

    // embed 2 - twitch video
    cy.get('[data-test-id=select-streaming-platform]').eq(1).click();
    cy.get('mat-option').contains('Twitch video').click();
    cy.get('[data-test-id=input-stream-link]').eq(1).clear().type(editedTwitchVideoId);
    cy.get('[data-test-id=input-streamer-name]').eq(1).clear().type(editedTwitchVideoName);
    cy.get('[data-test-id=select-stream-language]').eq(1).click();
    cy.get('mat-option').contains('Russian').click();

    // embed 3 - twitch channel
    cy.get('[data-test-id=select-streaming-platform]').eq(2).click();
    cy.get('mat-option').contains('Twitch channel').click();
    cy.get('[data-test-id=input-stream-link]').eq(2).clear().type(editedTwitchStreamId);
    cy.get('[data-test-id=input-streamer-name]').eq(2).clear().type(editedTwitchStreamerName);
    cy.get('[data-test-id=select-stream-language]').eq(2).click();
    cy.get('mat-option').contains('Russian').click();

    cy.get('[data-test-id=news-action-button]').click();

    // checking admin news list
    cy.get('[data-test-id=news-title-text]').first().should('contain.text', editedEnglishTitle);

    // checking main page in both languages
    cy.visit('/');
    cy.get('[data-test-id=news-header-text]').first().should('contain.text', editedRussianTitle);
    cy.get('[data-test-id=news-html-text]').first().should('contain.text', editedRussianText);
    cy.get('[data-test-id=language-toggle]').click();
    cy.get('[data-test-id=news-header-text]').first().should('contain.text', editedEnglishTitle);
    cy.get('[data-test-id=news-html-text]').first().should('contain.text', editedEnglishText);
    cy.get('[data-test-id=language-toggle]').click();

    // checking embeds
    cy.get('.news-block').first().find('[data-test-id=image-news]').should('not.exist');
    cy.get('.news-block')
      .first()
      .find('[data-test-id=youtube-cover-image]')
      .invoke('attr', 'src')
      .should('contain', editedYoutubeStreamId);
    cy.get('.news-block').first().find('[data-test-id=twitch-placeholder-image]').eq(0).should('exist');
    cy.get('.news-block').first().find('[data-test-id=twitch-placeholder-image]').eq(1).should('exist');
    cy.get('.news-block')
      .first()
      .find('[data-test-id=text-stream-title]')
      .eq(0)
      .should('contain.text', editedYoutubeStreamerName);
    cy.get('.news-block')
      .first()
      .find('[data-test-id=text-stream-title]')
      .eq(1)
      .should('contain.text', editedTwitchVideoName);
    cy.get('.news-block')
      .first()
      .find('[data-test-id=text-stream-title]')
      .eq(2)
      .should('contain.text', editedTwitchStreamerName);
  });

  it('should delete simple news correctly', () => {
    cy.get('[data-test-id=admin-panel-button]').click();

    cy.get('[data-test-id=news-title-text]')
      .first()
      .invoke('text')
      .then((firstNewsTitle: string) => {
        cy.get('[data-test-id=delete-news-button]').first().click();
        cy.get('mat-snack-bar-container').find('button.mat-mdc-snack-bar-action').click();

        // checking admin news list
        cy.get('[data-test-id=news-title-text]').first().should('not.contain.text', firstNewsTitle);

        // checking snackbar
        cy.get('simple-snack-bar').find('.mat-mdc-snack-bar-label').should('contain.text', 'Successfully deleted');
      });
  });
});
