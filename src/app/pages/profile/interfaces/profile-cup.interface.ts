import { Physics } from '../../../enums/physics.enum';

export interface ProfileCupInterface {
    newsId: string,
    name: string,
    physics: Physics,
    resultPlace: number,
    ratingChange: number,
}