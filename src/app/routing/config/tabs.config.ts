import { NavigationPages } from '../enums/pages.enum';

export interface TabInterface {
    page: NavigationPages;
    name: string;
}

export class TABS_CONFIG {
    public static get TABS(): TabInterface[] {
        return [
            { page: NavigationPages.MAIN, name: 'Главная' },
            { page: NavigationPages.RATING, name: 'Рейтинг' },
            { page: NavigationPages.TEAMS, name: 'Команды' },
            { page: NavigationPages.RULES, name: 'Правила' },
            { page: NavigationPages.ARCHIVE, name: 'Архив' },
            { page: NavigationPages.MOVIES, name: 'Мувики' },
        ];
    }
}
