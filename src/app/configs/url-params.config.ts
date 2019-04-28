const baseUrl = 'http://localhost:80/api';

export class URL_PARAMS {
    public static get MOVIES(): string {
        return `${baseUrl}/movies`;
    }
}
