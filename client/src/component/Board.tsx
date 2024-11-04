import { useState } from "react";
import { PIECE_TYPE, Square } from "../store/board";
import { Validator } from "../handler/validator";
import { MoveHandler } from "../handler/moveHandler";
import { useRecoilValue } from "recoil";
import { socketAtom } from "../recoil/atoms/socket";
import { gameInfoAtom } from "../recoil/atoms/gameStatus";

type BoardPropType = {
  color: boolean;
  validate: Validator;
  moveHandler: MoveHandler;
  board: Square[][];
  makeMove: any;
};
function Board({
  color,
  validate,
  moveHandler,
  board,
  makeMove,
}: BoardPropType) {
  const [from, setfrom] = useState<null | Square>(null);
  // const [] = useRecoilState(boardAtom);
  const socket = useRecoilValue(socketAtom);
  const gameInfo = useRecoilValue(gameInfoAtom);

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
    <div className={`board-container ${color && "rotated"}`}>
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
                        className={`piece-img ${color && "rotated"}`}
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
