import { NavigationPages } from '../enums/pages.enum';

export interface TabInterface {
    page: NavigationPages;
    name: string;
}

export class TABS_CONFIG {
    public static get TABS(): TabInterface[] {
        return [
            { page: NavigationPages.MAIN, name: 'mainPage' },
            { page: NavigationPages.ONE_V_ONE, name: 'oneVOne' },
            { page: NavigationPages.NEWS, name: 'archive' },
            { page: NavigationPages.RATING, name: 'rating' },
            { page: NavigationPages.RULES, name: 'rules' },
            { page: NavigationPages.MOVIES, name: 'movies' },
        ];
    }
}
