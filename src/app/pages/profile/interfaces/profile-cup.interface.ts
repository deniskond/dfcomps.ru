import { Physics } from '../../../enums/physics.enum';

export interface ProfileCupInterface {
    newsId: string,
    fullName: string,
    shortName: string,
    physics: Physics,
    resultPlace: number,
    ratingChange: number,
}