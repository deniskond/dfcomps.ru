import { trigger, state, style, transition, animate } from '@angular/animations';

export const HOVERABLE_CELL_HOVERED_STATE = 'hovered';
export const HOVERABLE_CELL_NORMAL_STATE = 'normal';

export const hoverableCellAnimation = trigger('hoveredCell', [
    state(
        HOVERABLE_CELL_HOVERED_STATE,
        style({
            backgroundColor: '#eeeeee',
        }),
    ),
    state(
        HOVERABLE_CELL_NORMAL_STATE,
        style({
            backgroundColor: 'white',
        }),
    ),
    transition(`${HOVERABLE_CELL_HOVERED_STATE} => ${HOVERABLE_CELL_NORMAL_STATE}`, [animate(500)]),
]);
