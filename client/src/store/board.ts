export enum PIECE_TYPE {
  emptySquare,
  bPawn,
  bRook,
  bBishop,
  bKnight,
  bQueen,
  bKing,
  wPawn,
  wRook,
  wBishop,
  wKnight,
  wQueen,
  wKing,
}

export type Square = {
  x: number;
  y: number;
  color: boolean;
  pieceType: PIECE_TYPE;
};
