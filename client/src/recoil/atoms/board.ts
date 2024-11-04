import { atom } from "recoil";
import { PIECE_TYPE, Square } from "../../store/board";

class BoardMaker {
  public prepareBoard() {
    let board: Square[][] = [];
    let Toggle: boolean = false;
    for (let i = 0; i < 8; i++) {
      let row: Square[] = [];

      for (let j = 0; j < 8; j++) {
        row.push({
          x: i,
          y: j,
          color: Toggle,
          pieceType: PIECE_TYPE.emptySquare,
        });
        Toggle = !Toggle;
      }
      Toggle = !Toggle;
      board.push(row);
    }

    this.getInitPieceype(board);
    return board;
  }

  private getInitPieceype(board: Square[][]) {
    for (let j = 0; j < 8; j++) {
      board[1][j].pieceType = PIECE_TYPE.wPawn;
      board[6][j].pieceType = PIECE_TYPE.bPawn;
    }

    board[0][0].pieceType = PIECE_TYPE.wRook;
    board[0][7].pieceType = PIECE_TYPE.wRook;

    board[7][0].pieceType = PIECE_TYPE.bRook;
    board[7][7].pieceType = PIECE_TYPE.bRook;

    board[0][1].pieceType = PIECE_TYPE.wKnight;
    board[0][6].pieceType = PIECE_TYPE.wKnight;

    board[7][1].pieceType = PIECE_TYPE.bKnight;
    board[7][6].pieceType = PIECE_TYPE.bKnight;

    board[0][2].pieceType = PIECE_TYPE.wBishop;
    board[0][5].pieceType = PIECE_TYPE.wBishop;

    board[7][2].pieceType = PIECE_TYPE.bBishop;
    board[7][5].pieceType = PIECE_TYPE.bBishop;

    board[0][3].pieceType = PIECE_TYPE.wQueen;
    board[0][4].pieceType = PIECE_TYPE.wKing;

    board[7][3].pieceType = PIECE_TYPE.bQueen;
    board[7][4].pieceType = PIECE_TYPE.bKing;
  }
}

let bm = new BoardMaker();

const boardAtom = atom<Square[][]>({
  key: "boardAtom",
  default: bm.prepareBoard(),
});
export { boardAtom };
