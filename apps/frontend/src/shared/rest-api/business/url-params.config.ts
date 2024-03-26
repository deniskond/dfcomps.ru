import { environment } from '~app/environments/environment';
import { Physics } from '@dfcomps/contracts';

const envMap: Record<string, string> = {
  local: '/api',
  'local-backend': '/api',
  prod: '/api',
};

export const MAIN_URL = envMap[environment.name];
export const API_URL = MAIN_URL;

export class URL_PARAMS {
  public static get WEBSOCKET_1V1_URL(): string {
    const websocketEnvMap: Record<string, string> = {
      local: 'wss://dfcomps.ru/ws/1v1',
      'local-backend': 'ws://localhost:4002/1v1',
      prod: 'wss://dfcomps.ru/ws/1v1',
    };

    return websocketEnvMap[environment.name];
  }

  public static get MOVIES(): string {
    return `${API_URL}/movies`;
  }

  public static get AUTH(): {
    GET_PASSWORD_TOKEN: string;
    GET_DISCORD_TOKEN: string;
    CHECK_LOGIN: string;
    REGISTER: string;
    LAST_DISCORD_PROMPT: string;
    LINK_DISCORD: string;
  } {
    return {
      GET_PASSWORD_TOKEN: `${API_URL}/auth/get-password-token`,
      GET_DISCORD_TOKEN: `${API_URL}/auth/get-discord-token`,
      CHECK_LOGIN: `${API_URL}/auth/check-login`,
      REGISTER: `${API_URL}/auth/register`,
      LAST_DISCORD_PROMPT: `${API_URL}/auth/discord-prompt`,
      LINK_DISCORD: `${API_URL}/auth/link-discord`,
    };
  }

  public static TOP_TEN_TABLE(): string {
    return `${API_URL}/tables/top10`;
  }

  public static RATING_TABLE_PAGE(physics: Physics, page: number): string {
    return `${API_URL}/tables/rating/${physics}/${page}`;
  }

  public static RATING_TABLE_PLAYERS_COUNT(): string {
    return `${API_URL}/tables/rating_table_players_count`;
  }

  public static SEASON_RATING_TABLE_PAGE(physics: Physics, page: number, season: number): string {
    return `${API_URL}/tables/season_rating/${physics}/${page}/${season}`;
  }

  public static SEASON_RATING_TABLE_PLAYERS_COUNT(season: number): string {
    return `${API_URL}/tables/season_rating_table_players_count/${season}`;
  }

  public static get PROFILE(): {
    GET_PROFILE: (id: number) => string;
    CHECK_NICK_CHANGE: string;
    UPDATE_INFO: string;
    UPDATE_AVATAR: string;
  } {
    return {
      GET_PROFILE: (id: number) => `${API_URL}/profile/get/${id}`,
      CHECK_NICK_CHANGE: `${API_URL}/profile/check_last_nick_change_time`,
      UPDATE_INFO: `${API_URL}/profile/update-info`,
      UPDATE_AVATAR: `${API_URL}/profile/update-avatar`,
    };
  }

  public static get NEWS(): {
    MAIN_PAGE: string;
    THEME_PAGE: (theme: string) => string;
    COUNT: string;
    SINGLE_NEWS: (id: string) => string;
    ARCHIVE: (startIndex: number, endIndex: number) => string;
  } {
    return {
      MAIN_PAGE: `${API_URL}/news/mainpage`,
      THEME_PAGE: (theme: string) => `${API_URL}/news/theme/${theme}`,
      COUNT: `${API_URL}/news/count`,
      SINGLE_NEWS: (id: string) => `${API_URL}/news/single/${id}`,
      ARCHIVE: (startIndex: number, endIndex: number) => `${API_URL}/news/archive/${startIndex}/${endIndex}`,
    };
  }

  public static get COMMENTS(): {
    ADD: string;
    DELETE: string;
    UPDATE: string;
    MODERATOR_DELETE: string;
  } {
    return {
      ADD: `${API_URL}/comments/add`,
      DELETE: `${API_URL}/comments/delete/`,
      UPDATE: `${API_URL}/comments/update/`,
      MODERATOR_DELETE: `${API_URL}/comments/moderator_delete/`,
    };
  }

  public static get SEASON(): {
    GET: string;
  } {
    return {
      GET: `${API_URL}/rating/get_season`,
    };
  }

  public static get DEMOS(): {
    UPLOAD: string;
    DUEL_UPLOAD: string;
    DELETE: string;
  } {
    return {
      UPLOAD: `${API_URL}/demos/upload`,
      DUEL_UPLOAD: `${API_URL}/demos/match-upload`,
      DELETE: `${API_URL}/demos/delete`,
    };
  }

  public static get DUEL(): {
    GET_PLAYERS_INFO: string;
  } {
    return {
      GET_PLAYERS_INFO: `${API_URL}/match/info`,
    };
  }

  public static get TABLES(): {
    ONLINE_FULL_TABLE: (cupId: string) => string;
    ONLINE_ROUND: (cupId: string, roundNumber: string) => string;
    MULTICUP_FULL_TABLE: (cupId: string, physics: Physics) => string;
    MULTICUP_ROUND: (cupId: string, physics: Physics, roundNumber: string) => string;
  } {
    return {
      ONLINE_FULL_TABLE: (cupId: string) => `${API_URL}/tables/online/${cupId}`,
      ONLINE_ROUND: (cupId: string, roundNumber: string) => `${API_URL}/tables/online-round/${cupId}/${roundNumber}`,
      MULTICUP_FULL_TABLE: (cupId: string, physics: Physics) => `${API_URL}/tables/multicup/${cupId}/${physics}`,
      MULTICUP_ROUND: (cupId: string, physics: Physics, round: string) =>
        `${API_URL}/tables/multicup-round/${cupId}/${physics}/${round}`,
    };
  }

  public static get CUP(): {
    GET_NEXTCUP: string;
    REGISTER: (cupId: number) => string;
    CANCEL_REGISTRATION: (cupId: number) => string;
    CHECK_REGISTRATION: () => string;
    VALIDATION_ARCHIVE_LINK: (cupId: number) => string;
    STREAMERS_ARCHIVE_LINK: (cupId: number) => string;
  } {
    return {
      GET_NEXTCUP: `${API_URL}/cup/next-cup-info`,
      REGISTER: (cupId: number) => `${API_URL}/cup/register/${cupId}`, // TODO
      CANCEL_REGISTRATION: (cupId: number) => `${API_URL}/cup/cancel_registration/${cupId}`, // TODO
      CHECK_REGISTRATION: () => `${API_URL}/cup/is-registered`, // TODO
      VALIDATION_ARCHIVE_LINK: (cupId: number) => `${API_URL}/cup/validation-archive-link/${cupId}`,
      STREAMERS_ARCHIVE_LINK: (cupId: number) => `${API_URL}/cup/streamers-archive-link/${cupId}`,
    };
  }

  public static get SMILES(): {
    GET_PERSONAL_SMILES: string;
  } {
    return {
      GET_PERSONAL_SMILES: `${API_URL}/comments/personal-smiles`,
    };
  }

  public static get ADMIN(): {
    GET_NEWS: string;
    GET_SINGLE_NEWS: (newsId: string) => string;
    POST_NEWS: string;
    UPDATE_NEWS: (newsId: string) => string;
    DELETE_NEWS: (newsId: number) => string;
    GET_CUPS: string;
    CUP_VALIDATION: (cupId: number) => string;
    PROCESS_VALIDATION: (cupId: number) => string;
    CALCULATE_CUP_RATING: (cupId: number) => string;
    FINISH_OFFLINE_CUP: (cupId: number) => string;
    GET_ALL_AVAILABLE_MULTICUPS: string;
    GET_ALL_OFFLINE_CUPS_WITHOUT_NEWS: string;
    GET_ALL_ONLINE_CUPS_WITHOUT_NEWS: string;
    ADD_OFFLINE_CUP: string;
    UPLOAD_MAP: (mapName: string) => string;
    UPLOAD_LEVELSHOT: (mapName: string) => string;
    GET_SINGLE_CUP: (cupId: number) => string;
    UPDATE_OFFLINE_CUP: (cupId: number) => string;
    ADD_ONLINE_CUP: string;
    UPDATE_ONLINE_CUP: (cupId: number) => string;
    DELETE_CUP: (cupId: number) => string;
    SET_SEASON_REWARDS: string;
    SAVE_SEASON_RATINGS: string;
    RESET_SEASON_RATINGS: string;
    INCREMENT_SEASON: string;
    GET_WORLDSPAWN_MAP_INFO: string;
  } {
    return {
      GET_NEWS: `${API_URL}/admin/news/get-all-news`,
      GET_SINGLE_NEWS: (newsId: string) => `${API_URL}/admin/news/get/${newsId}`,
      POST_NEWS: `${API_URL}/admin/news/post`,
      UPDATE_NEWS: (newsId: string) => `${API_URL}/admin/news/update/${newsId}`,
      DELETE_NEWS: (newsId: number) => `${API_URL}/admin/news/delete/${newsId}`,
      GET_CUPS: `${API_URL}/admin/cups/get-all-cups`,
      CUP_VALIDATION: (cupId: number) => `${API_URL}/admin/cups/get-validation-demos/${cupId}`,
      PROCESS_VALIDATION: (cupId: number) => `${API_URL}/admin/cups/process-validation/${cupId}`,
      CALCULATE_CUP_RATING: (cupId: number) => `${API_URL}/admin/cups/calculate-rating/${cupId}`,
      FINISH_OFFLINE_CUP: (cupId: number) => `${API_URL}/admin/cups/finish-offline-cup/${cupId}`,
      GET_ALL_AVAILABLE_MULTICUPS: `${API_URL}/admin/cups/get-all-available-multicups`,
      GET_ALL_OFFLINE_CUPS_WITHOUT_NEWS: `${API_URL}/admin/cups/get-all-offline-cups-without-news`,
      GET_ALL_ONLINE_CUPS_WITHOUT_NEWS: `${API_URL}/admin/cups/get-all-online-cups-without-news`,
      ADD_OFFLINE_CUP: `${API_URL}/admin/cups/add-offline-cup`,
      UPLOAD_MAP: (mapName: string) => `${API_URL}/admin/cups/upload-map/${mapName}`,
      UPLOAD_LEVELSHOT: (mapName: string) => `${API_URL}/admin/cups/upload-levelshot/${mapName}`,
      GET_SINGLE_CUP: (cupId: number) => `${API_URL}/admin/cups/get/${cupId}`,
      UPDATE_OFFLINE_CUP: (cupId: number) => `${API_URL}/admin/cups/update-offline-cup/${cupId}`,
      ADD_ONLINE_CUP: `${API_URL}/admin/cups/add-online-cup`,
      UPDATE_ONLINE_CUP: (cupId: number) => `${API_URL}/admin/cups/update-online-cup/${cupId}`,
      DELETE_CUP: (cupId: number) => `${API_URL}/admin/cups/delete/${cupId}`,
      SET_SEASON_REWARDS: `${API_URL}/admin/season/rewards`, // TODO
      SAVE_SEASON_RATINGS: `${API_URL}/admin/season/save_season_ratings`, // TODO
      RESET_SEASON_RATINGS: `${API_URL}/admin/season/reset_season_ratings`, // TODO
      INCREMENT_SEASON: `${API_URL}/admin/season/increment`, // TODO
      GET_WORLDSPAWN_MAP_INFO: `${API_URL}/admin/cups/get-worldspawn-map-info`,
    };
  }
}
