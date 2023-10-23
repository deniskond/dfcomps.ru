const envMap: Record<string, string> = {
  production: 'https://dfcomps.ru/api',
  test: 'http://localhost:4001/api',
};

const API_URL = process.env.NODE_ENV ? envMap[process.env.NODE_ENV] : 'http://localhost:4001/api';

// New backend status: 0 / 5 endpoints done
export class URLS {
  public static get MATCH(): {
    GET_ELIGIBLE_PLAYERS: string;
    START: string;
    UPDATE_MATCH_INFO: string;
    UPDATE_BOT_TIME: string;
    FINISH: string;
  } {
    return {
      GET_ELIGIBLE_PLAYERS: `${API_URL}/match/get_eligible_players`,
      START: `${API_URL}/match/start`,
      UPDATE_MATCH_INFO: `${API_URL}/match/update_match_info`,
      UPDATE_BOT_TIME: `${API_URL}/match/update_bot_time`,
      FINISH: `${API_URL}/match/finish`,
    };
  }
}
