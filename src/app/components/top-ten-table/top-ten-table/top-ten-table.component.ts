import { Component, Input } from '@angular/core';
import { Physics } from '../../../enums/physics.enum';
import { LeaderTableInterface } from '../../../interfaces/leader-table.interface';

// TODO [DFRU-4] Вынести в мок, перевести на реальные данные из сервиса
const leaderTableMock: LeaderTableInterface[] = [
    { position: 1, nick: 'uN*DeaD|w00dy-', rating: 2210, country: 'ru' },
    { position: 2, nick: 'uN*DeaD|TuttyFrutty', rating: 2204, country: 'ru' },
    { position: 3, nick: 'uN*DeaD|Icarus', rating: 2187, country: 'ru' },
    { position: 4, nick: 'M9kiiPuz', rating: 2158, country: 'ru' },
    { position: 5, nick: 'Enter', rating: 2067, country: 'ru' },
    { position: 6, nick: '[fps]zQn', rating: 2060, country: 'ru' },
    { position: 7, nick: 'Mntr_', rating: 2049, country: 'ru' },
    { position: 8, nick: 'lith', rating: 2022, country: 'ru' },
    { position: 9, nick: 'Ovcharkin', rating: 2017, country: 'ru' },
    { position: 10, nick: 'Avenger', rating: 1989, country: 'ru' },
];

@Component({
    selector: 'app-top-ten-table',
    templateUrl: './top-ten-table.component.html',
    styleUrls: ['./top-ten-table.component.less'],
})
export class TopTenTableComponent {
    @Input()
    physics: Physics;

    public dataSource = leaderTableMock;
}
