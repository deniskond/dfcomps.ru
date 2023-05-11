import { Physics } from '~shared/enums/physics.enum';
import { RatingTablesModes } from '~shared/enums/rating-tables-modes.enum';
import { environment } from '~app/environments/environment';

const envMap: Record<string, string> = {
  local: '',
  'local-backend': 'http://localhost',
  prod: 'https://dfcomps.ru',
};

export const MAIN_URL = envMap[environment.name];
export const API_URL = `${MAIN_URL}/api`;

export class URL_PARAMS {
  public static get WEBSOCKET_1V1_URL(): string {
    const websocketEnvMap: Record<string, string> = {
      local: 'ws://localhost:3000/1v1',
      'local-backend': 'ws://localhost:3000/1v1',
      prod: 'wss://dfcomps.ru/ws/1v1',
    };

    return websocketEnvMap[environment.name];
  }

  public static get MOVIES(): string {
    return `${API_URL}/movies`;
  }

  public static get USER_ACTIONS(): {
    LOGIN: string;
    REGISTER: string;
    LOGOUT: string;
    CHECK_ACCESS: string;
    CHECK_LOGIN: string;
  } {
    return {
      LOGIN: `${API_URL}/user/login`,
      REGISTER: `${API_URL}/user/register`,
      LOGOUT: `${API_URL}/user/logout`,
      CHECK_ACCESS: `${API_URL}/user/check_access`,
      CHECK_LOGIN: `${API_URL}/user/check_login`,
    };
  }

  public static TOP_TEN_TABLE(physics: Physics, mode: RatingTablesModes): string {
    return `${API_URL}/tables/top10/${physics}/${mode}`;
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

  public static PROFILE(playerId: string): string {
    return `${API_URL}/profile/${playerId}`;
  }

  public static PROFILE_CHECK_NICK_CHANGE(): string {
    return `${API_URL}/profile/check_last_nick_change_time`;
  }

  public static PROFILE_UPDATE(): string {
    return `${API_URL}/profile/update`;
  }

  public static get NEWS(): {
    MAIN_PAGE: string;
    COUNT: string;
    SINGLE_NEWS: (id: string) => string;
    ARCHIVE: (startIndex: number, endIndex: number) => string;
  } {
    return {
      MAIN_PAGE: `${API_URL}/news/mainpage`,
      COUNT: `${API_URL}/news/count`,
      SINGLE_NEWS: (id: string) => `${API_URL}/news/single/${id}`,
      ARCHIVE: (startIndex: number, endIndex: number) => `${API_URL}/news/archive/${startIndex}/${endIndex}`,
    };
  }

  public static get COMMENTS(): {
    ADD: string;
    DELETE: string;
    UPDATE: string;
    ADMIN_DELETE: string;
  } {
    return {
      ADD: `${API_URL}/comments/add`,
      DELETE: `${API_URL}/comments/delete/`,
      UPDATE: `${API_URL}/comments/update/`,
      ADMIN_DELETE: `${API_URL}/comments/admin_delete/`,
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
    REFLEX_UPLOAD: string;
    DUEL_UPLOAD: string;
    DELETE: string;
    VALIDATION_ARCHIVE_LINK: string;
  } {
    return {
      UPLOAD: `${API_URL}/cup/upload_demo`,
      REFLEX_UPLOAD: `${API_URL}/cup/reflex_upload_demo`,
      DUEL_UPLOAD: `${API_URL}/match/upload_demo`,
      DELETE: `${API_URL}/cup/delete_demo`,
      VALIDATION_ARCHIVE_LINK: `${API_URL}/cup/get_demos_for_validation`,
    };
  }

  public static get DUEL(): {
    GET_PLAYERS_INFO: string;
  } {
    return {
      GET_PLAYERS_INFO: `${API_URL}/match/get`,
    };
  }

  public static get CUP(): {
    GET_NEXTCUP: string;
    ONLINE_FULL_TABLE: (cupId: string) => string;
    ONLINE_ROUND: (cupId: string, roundNumber: string) => string;
    MULTICUP_FULL_TABLE: (cupId: string, physics: Physics) => string;
    MULTICUP_ROUND: (cupId: string, physics: Physics, roundNumber: string) => string;
    REGISTER: (cupId: string) => string;
    CANCEL_REGISTRATION: (cupId: string) => string;
    CHECK_REGISTRATION: (cupId: string, playerId: string) => string;
  } {
    return {
      GET_NEXTCUP: `${API_URL}/cup/next_cup_info`,
      ONLINE_FULL_TABLE: (cupId: string) => `${API_URL}/cup/online/${cupId}`,
      ONLINE_ROUND: (cupId: string, roundNumber: string) => `${API_URL}/cup/online/${cupId}/round/${roundNumber}`,
      MULTICUP_FULL_TABLE: (cupId: string, physics: Physics) => `${API_URL}/cup/multi/${cupId}/${physics}`,
      MULTICUP_ROUND: (cupId: string, physics: Physics, roundNumber: string) =>
        `${API_URL}/cup/multi/${cupId}/${physics}/round/${roundNumber}`,
      REGISTER: (cupId: string) => `${API_URL}/cup/register/${cupId}`,
      CANCEL_REGISTRATION: (cupId: string) => `${API_URL}/cup/cancel_registration/${cupId}`,
      CHECK_REGISTRATION: (cupId: string, playerId: string) => `${API_URL}/cup/isRegistered/${cupId}/${playerId}`,
    };
  }

  public static get SMILES(): {
    GET_PERSONAL_SMILES: string;
  } {
    return {
      GET_PERSONAL_SMILES: `${API_URL}/comments/get_personal_smiles`,
    };
  }

  public static get ADMIN(): {
    GET_NEWS: string;
    DELETE_NEWS: (newsId: string) => string;
    GET_CUPS: string;
    CUP_VALIDATION: (cupId: string) => string;
    PROCESS_VALIDATE: string;
    POST_NEWS: string;
    GET_SINGLE_NEWS: (newsId: string) => string;
    EDIT_NEWS: (newsId: string) => string;
    GET_ALL_ACTIVE_MULTICUPS: string;
    ADD_CUP: string;
    SET_SEASON_REWARDS: string;
    SAVE_SEASON_RATINGS: string;
    RESET_SEASON_RATINGS: string;
    INCREMENT_SEASON: string;
  } {
    return {
      GET_NEWS: `${API_URL}/admin/news/get_all_news`,
      DELETE_NEWS: (newsId: string) => `${API_URL}/admin/news/delete_v2/${newsId}`,
      GET_CUPS: `${API_URL}/admin/cups/get_all_cups`,
      CUP_VALIDATION: (cupId: string) => `${API_URL}/admin/cups/get_cup_validation_demos/${cupId}`,
      PROCESS_VALIDATE: `${API_URL}/admin/cups/process_validate_v2`,
      POST_NEWS: `${API_URL}/admin/news/save_v2`,
      GET_SINGLE_NEWS: (newsId: string) => `${API_URL}/admin/news/get_single_news/${newsId}`,
      EDIT_NEWS: (newsId: string) => `${API_URL}/admin/news/update_v2/${newsId}`,
      GET_ALL_ACTIVE_MULTICUPS: `${API_URL}/admin/cups/get_all_active_multicups`,
      ADD_CUP: `${API_URL}/admin/cups/add_v2`,
      SET_SEASON_REWARDS: `${API_URL}/admin/season/rewards`,
      SAVE_SEASON_RATINGS: `${API_URL}/admin/season/save_season_ratings`,
      RESET_SEASON_RATINGS: `${API_URL}/admin/season/reset_season_ratings`,
      INCREMENT_SEASON: `${API_URL}/admin/season/increment`,
    };
  }
}
