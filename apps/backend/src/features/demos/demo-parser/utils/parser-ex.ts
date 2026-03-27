export class ErrorBadChecksum extends Error {
  constructor() { super('Bad checksum in time decryption'); }
}
export class ErrorMatchPhysics extends Error {
  constructor() { super('CPM flag mismatch between config and snapshots'); }
}
export class ErrorDeltaFrameTooOld extends Error {
  constructor() { super('Delta frame too old'); }
}
export class ErrorDeltaFromInvalidFrame extends Error {
  constructor() { super('Delta from invalid frame'); }
}
export class ErrorDeltaParseEntitiesNumTooOld extends Error {
  constructor() { super('Delta parse entities num too old'); }
}
export class ErrorParseSnapshotInvalidsize extends Error {
  constructor() { super('Invalid areamask size in snapshot'); }
}
export class ErrorParsePacketEntitiesEndOfMessage extends Error {
  constructor() { super('End of message during packet entities parse'); }
}
export class ErrorBaselineNumberOutOfRange extends Error {
  constructor() { super('Baseline entity number out of range'); }
}
export class ErrorUnableToParseDeltaEntityState extends Error {
  constructor() { super('Unable to parse delta entity state'); }
}
export class ErrorBadCommandInParseGameState extends Error {
  constructor() { super('Bad command in parseGameState'); }
}
export class ErrorWrongLength extends Error {
  constructor() { super('Wrong message length'); }
}
export class ErrorCantOpenFile extends Error {
  constructor() { super('Cannot open demo file'); }
}
