import { NavigationPages } from '../enums/pages.enum';

export interface TabInterface {
    page: NavigationPages;
    name: string;
}

export class TABS_CONFIG {
    public static get TABS(): TabInterface[] {
        return [
            { page: NavigationPages.MAIN, name: 'Главная' },
            // TODO [DFRU-5] Страница рейтинга
            // { page: NavigationPages.RATING, name: 'Рейтинг' },
            // TODO [DFRU-6] Страница команд
            // { page: NavigationPages.TEAMS, name: 'Команды' },
            { page: NavigationPages.RULES, name: 'Правила' },
            // TODO [DFRU-13] Страница архива
            // { page: NavigationPages.ARCHIVE, name: 'Архив' },
            { page: NavigationPages.MOVIES, name: 'Мувики' },
        ];
    }
}
