const baseUrl = 'http://localhost:80/api';

export class URL_PARAMS {
    public static get TIMER(): Record<string, string> {
        return {
            GET_TIME: `${baseUrl}/timer/get_time`,
        };
    }
}
