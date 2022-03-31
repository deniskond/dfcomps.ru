import { trigger, state, style, transition, animate } from '@angular/animations';

export const HOVERABLE_CELL_HOVERED_STATE = 'hovered';
export const HOVERABLE_CELL_NORMAL_STATE = 'normal';
export const HOVERABLE_CELL_TRANSPARENT_HOVERED_STATE = 'transparent-hovered';
export const HOVERABLE_CELL_TRANSPARENT_NORMAL_STATE = 'transparent-normal';

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
  state(
    HOVERABLE_CELL_TRANSPARENT_HOVERED_STATE,
    style({
      backgroundColor: 'rgba(255, 255, 255, 0.4)',
    }),
  ),
  state(
    HOVERABLE_CELL_TRANSPARENT_NORMAL_STATE,
    style({
      backgroundColor: 'rgba(255, 255, 255, 0)',
    }),
  ),
  transition(`${HOVERABLE_CELL_HOVERED_STATE} => ${HOVERABLE_CELL_NORMAL_STATE}`, [animate(500)]),
  transition(`${HOVERABLE_CELL_TRANSPARENT_HOVERED_STATE} => ${HOVERABLE_CELL_TRANSPARENT_NORMAL_STATE}`, [
    animate(500),
  ]),
  transition(`${HOVERABLE_CELL_TRANSPARENT_NORMAL_STATE} => ${HOVERABLE_CELL_TRANSPARENT_HOVERED_STATE}`, [
    animate(100),
  ]),
]);
