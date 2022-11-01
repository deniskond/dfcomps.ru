import { trigger, state, style, transition, animate } from '@angular/animations';

export const HOVERABLE_CELL_HOVERED_STATE = 'hovered';
export const HOVERABLE_CELL_NORMAL_STATE = 'normal';
export const HOVERABLE_CELL_TRANSPARENT_HOVERED_STATE = 'transparent-hovered';
export const HOVERABLE_CELL_TRANSPARENT_NORMAL_STATE = 'transparent-normal';

const isDarkTheme = true; // @TODO доделать ключ

export const hoverableCellAnimation = trigger('hoveredCell', [
  state(
    HOVERABLE_CELL_HOVERED_STATE,
    style({
      backgroundColor: isDarkTheme ? 'rgb(34, 36, 38)' : '#eeeeee',
    }),
  ),
  state(
    HOVERABLE_CELL_NORMAL_STATE,
    style({
      backgroundColor: isDarkTheme ? 'rgb(24, 26, 27)' : 'white',
    }),
  ),
  state(
    HOVERABLE_CELL_TRANSPARENT_HOVERED_STATE,
    style({
      backgroundColor: isDarkTheme ? 'rgb(24, 26, 27, 0.4)' : 'rgba(255, 255, 255, 0.4)',
    }),
  ),
  state(
    HOVERABLE_CELL_TRANSPARENT_NORMAL_STATE,
    style({
      backgroundColor: isDarkTheme ? 'rgb(24, 26, 27, 0)' : 'rgba(255, 255, 255, 0)',
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
