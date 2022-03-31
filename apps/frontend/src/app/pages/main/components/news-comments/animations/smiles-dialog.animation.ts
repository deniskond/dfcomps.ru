import { trigger, state, style, transition, animate } from '@angular/animations';

export const SMILES_DIALOG_OPENED = 'opened';
export const SMILES_DIALOG_CLOSED = 'closed';

export const smilesDialogAnimation = trigger('smilesDialog', [
  state(
    SMILES_DIALOG_OPENED,
    style({
      opacity: 1,
    }),
  ),
  state(
    SMILES_DIALOG_CLOSED,
    style({
      opacity: 0,
    }),
  ),
  transition(`${SMILES_DIALOG_OPENED} => ${SMILES_DIALOG_CLOSED}`, [animate(100)]),
  transition(`${SMILES_DIALOG_CLOSED} => ${SMILES_DIALOG_OPENED}`, [animate(100)]),
]);
