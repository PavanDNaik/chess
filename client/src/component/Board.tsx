import { useState } from "react";
import { PIECE_TYPE, Square } from "../store/board";
import { Validator } from "../handler/validator";
import { MoveHandler } from "../handler/moveHandler";
import { useRecoilState, useRecoilValue } from "recoil";
import { boardAtom } from "../recoil/atoms/board";
import { socketAtom } from "../recoil/atoms/socket";
import { gameInfoAtom } from "../recoil/atoms/gameStatus";

type BoardPropType = {
  color: boolean;
  validate: Validator;
  moveHandler: MoveHandler;
};
function Board({ color, validate, moveHandler }: BoardPropType) {
  const [from, setfrom] = useState<null | Square>(null);
  const [board, setBoard] = useRecoilState(boardAtom);
  const socket = useRecoilValue(socketAtom);
  const gameInfo = useRecoilValue(gameInfoAtom);
  console.log(board);

  function getCopy(board: Square[][]) {
    let b: Square[][] = [];
    for (let i = 0; i < 8; i++) {
      let row: Square[] = [];
      for (let j = 0; j < 8; j++) {
        let obj: Square = { ...board[i][j] };
        row.push(obj);
      }
      b.push(row);
    }
    return b;
  }

  function makeMove(from: Square, to: Square) {
    if (!board) return;
    let b: Square[][] = getCopy(board);
    b[to.x][to.y].pieceType = b[from.x][from.y].pieceType;
    b[from.x][from.y].pieceType = PIECE_TYPE.emptySquare;
    setBoard(b);
  }

  function handlePieceClick(to: Square) {
    if (!board || color == null) return;
    if (from == null) {
      if (validate.isSameColor(color, to)) {
        setfrom(to);
        // highlight
      }
      return;
    } else {
      if (validate.isSameColor(color, to)) {
        setfrom(to);
        return; // cant take ur own piece
      }
      if (validate.validateMove(from, to, color, board)) {
        moveHandler.handleMove(socket, from, to, gameInfo.roomId, color);
        makeMove(from, to);
      }
      setfrom(null);
    }
  }

  function classOnClicked(x: number, y: number) {
    if (from == null || from.x != x || from.y != y) return "";
    return " from-piece-highlight";
  }
  return (
    <div className="board-container">
      {board &&
        board.map((row: Square[], i: number) => {
          return (
            <div className="board-row" key={i}>
              {row.map((cell: Square, j: number) => {
                return (
                  <div
                    key={i * 8 + j}
                    onClick={() => {
                      handlePieceClick(cell);
                    }}
                    className={
                      "Square " +
                      (cell.color ? "WhiteSquare " : "BlackSquare ") +
                      (cell.pieceType != PIECE_TYPE.emptySquare
                        ? "piece-cell"
                        : "") +
                      classOnClicked(i, j)
                    }
                  >
                    {i + " " + j}
                    {cell.pieceType != PIECE_TYPE.emptySquare && (
                      <img
                        className="piece-img"
                        src={"./pieces/" + cell.pieceType + ".png"}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
    </div>
  );
}

export default Board;
