import { Physics } from '../enums/physics.enum';

export const MAIN_URL = 'http://localhost:80';
export const API_URL = `${MAIN_URL}/api`;

export class URL_PARAMS {
    public static get MOVIES(): string {
        return `${API_URL}/movies`;
    }

    public static TOP_TEN_TABLE(physics: Physics): string {
        return `${API_URL}/tables/top10/${physics}`;
    }

    public static PROFILE(playerId: string): string {
        return `${API_URL}/profile/${playerId}`;
    }
}
