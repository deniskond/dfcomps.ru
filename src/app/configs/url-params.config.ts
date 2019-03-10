const baseUrl = '/api';

export class URL_PARAMS {
    public static get TIMER(): Record<string, string> {
        return {
            GET_TIME: `${baseUrl}/ajax/get_time`;
        };
    }
}
