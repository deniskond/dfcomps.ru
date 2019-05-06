import { Physics } from '../enums/physics.enum';

const baseUrl = 'http://localhost:80/api';

export class URL_PARAMS {
    public static get MOVIES(): string {
        return `${baseUrl}/movies`;
    }

    public static TOP_TEN_TABLE(physics: Physics): string {
        return `${baseUrl}/tables/top10/${physics}`;
    }
}
