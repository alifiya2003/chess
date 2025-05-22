// src/board/Board.ts

import { ROWS, COLS } from "../core/Const";
import { Square } from "./Square";
import { Move } from "./Move";

import { Piece } from "../pieces/Piece";
import { Pawn } from "../pieces/Pawn";
import { Rook } from "../pieces/Rook";
import { Knight } from "../pieces/Knight";
import { Bishop } from "../pieces/Bishop";
import { Queen } from "../pieces/Queen";
import { King } from "../pieces/King";

import { cloneDeep } from "lodash";

export class Board {
  squares: Square[][];
  lastMove: Move | null = null;

  constructor() {
    this.squares = Array.from({ length: ROWS }, (_, row) =>
      Array.from({ length: COLS }, (_, col) => new Square(row, col))
    );
    this._create();
    this._addPieces("white");
    this._addPieces("black");
  }

  private _create(): void {
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        this.squares[row][col] = new Square(row, col);
      }
    }
  }

  private _addPieces(color: "white" | "black"): void {
    const row_pawn = color === "white" ? 6 : 1;
    const row_other = color === "white" ? 7 : 0;

    for (let col = 0; col < COLS; col++) {
      this.squares[row_pawn][col].piece = new Pawn(color);
    }

    this.squares[row_other][1].piece = new Knight(color);
    this.squares[row_other][6].piece = new Knight(color);
    this.squares[row_other][2].piece = new Bishop(color);
    this.squares[row_other][5].piece = new Bishop(color);
    this.squares[row_other][0].piece = new Rook(color);
    this.squares[row_other][7].piece = new Rook(color);
    this.squares[row_other][3].piece = new Queen(color);
    this.squares[row_other][4].piece = new King(color);
  }

  move(piece: Piece, move: Move, testing: boolean = false): void {
    const initial = move.initial;
    const final = move.final;

    const enPassantEmpty = this.squares[final.row][final.col].isEmpty();

    this.squares[initial.row][initial.col].piece = null;
    this.squares[final.row][final.col].piece = piece;

    if (piece instanceof Pawn) {
      const diff = final.col - initial.col;
      if (diff !== 0 && enPassantEmpty) {
        this.squares[initial.row][initial.col + diff].piece = null;
      } else {
        this.checkPromotion(piece, final);
      }
    }

    if (piece instanceof King) {
      if (this.isCastlingMove(initial, final) && !testing) {
        const diff = final.col - initial.col;
        const rook = diff < 0 ? piece.leftRook : piece.rightRook;
        if (rook) this.move(rook, rook.moves[rook.moves.length - 1]);
      }
    }

    piece.moved = true;
    piece.clearMoves();
    this.lastMove = move;
  }

  validMove(piece: Piece, move: Move): boolean {
    return piece.moves.some(m => m.equals(move));
  }

  checkPromotion(piece: Piece, final: Square): void {
    if (final.row === 0 || final.row === 7) {
      this.squares[final.row][final.col].piece = new Queen(piece.color);
    }
  }

  isCastlingMove(initial: Square, final: Square): boolean {
    return Math.abs(final.col - initial.col) === 2;
  }

  setTrueEnPassant(piece: Piece): void {
    if (!(piece instanceof Pawn)) return;
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const sqPiece = this.squares[row][col].piece;
        if (sqPiece instanceof Pawn) {
          sqPiece.enPassant = false;
        }
      }
    }
    piece.enPassant = true;
  }

  inCheck(piece: Piece, move: Move): boolean {
    const tempBoard = cloneDeep(this);
    const tempPiece = cloneDeep(piece);

    tempBoard.move(tempPiece, move, true);

    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const target = tempBoard.squares[row][col].piece;
        if (target && target.color !== piece.color) {
          tempBoard.calcMoves(target, row, col, false);
          for (const m of target.moves) {
            if (m.final.piece instanceof King && m.final.piece.color === piece.color) {
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  calcMoves(piece: Piece, row: number, col: number, validate: boolean = true): void {
    piece.clearMoves();

    const addIfValid = (move: Move) => {
      if (validate) {
        if (!this.inCheck(piece, move)) {
          piece.addMove(move);
        }
      } else {
        piece.addMove(move);
      }
    };

    const pawnMoves = () => {
      const direction = (piece as Pawn).dir;
      const steps = piece.moved ? 1 : 2;

      for (let step = 1; step <= steps; step++) {
        const newRow = row + direction * step;
        if (Square.inRange(newRow, col) && this.squares[newRow][col].isEmpty()) {
          const move = new Move(this.squares[row][col], this.squares[newRow][col]);
          addIfValid(move);
        } else break;
      }

      for (const deltaCol of [-1, 1]) {
        const newRow = row + direction;
        const newCol = col + deltaCol;
        if (Square.inRange(newRow, newCol)) {
          const targetSq = this.squares[newRow][newCol];
          if (targetSq.hasEnemyPiece(piece.color)) {
            const move = new Move(this.squares[row][col], targetSq);
            addIfValid(move);
          }
        }
      }

      const enPassantRow = piece.color === "white" ? 3 : 4;
      const finalRow = piece.color === "white" ? 2 : 5;

      if (row === enPassantRow) {
        for (const dCol of [-1, 1]) {
          const sideCol = col + dCol;
          if (Square.inRange(sideCol)) {
            const sidePiece = this.squares[row][sideCol].piece;
            if (sidePiece instanceof Pawn && sidePiece.color !== piece.color && sidePiece.enPassant) {
              const move = new Move(this.squares[row][col], this.squares[finalRow][sideCol]);
              addIfValid(move);
            }
          }
        }
      }
    };

    const knightMoves = () => {
      const knightSteps: [number, number][] = [
        [-2, +1], [-1, +2], [+1, +2], [+2, +1],
        [+2, -1], [+1, -2], [-1, -2], [-2, -1],
      ];

      for (const [dRow, dCol] of knightSteps) {
        const newRow = row + dRow;
        const newCol = col + dCol;
        if (Square.inRange(newRow, newCol)) {
          const targetSq = this.squares[newRow][newCol];
          if (targetSq.isEmptyOrEnemy(piece.color)) {
            const move = new Move(this.squares[row][col], targetSq);
            addIfValid(move);
          }
        }
      }
    };

    const straightLineMoves = (directions: [number, number][]) => {
      for (const [dRow, dCol] of directions) {
        let newRow = row + dRow;
        let newCol = col + dCol;

        while (Square.inRange(newRow, newCol)) {
          const targetSq = this.squares[newRow][newCol];
          const move = new Move(this.squares[row][col], targetSq);

          if (targetSq.isEmpty()) {
            addIfValid(move);
          } else if (targetSq.hasEnemyPiece(piece.color)) {
            addIfValid(move);
            break;
          } else if (targetSq.hasTeamPiece(piece.color)) {
            break;
          }

          newRow += dRow;
          newCol += dCol;
        }
      }
    };

    const kingMoves = () => {
      const directions: [number, number][] = [
        [-1, 0], [-1, +1], [0, +1], [+1, +1],
        [+1, 0], [+1, -1], [0, -1], [-1, -1],
      ];

      for (const [dRow, dCol] of directions) {
        const newRow = row + dRow;
        const newCol = col + dCol;
        if (Square.inRange(newRow, newCol)) {
          const targetSq = this.squares[newRow][newCol];
          if (targetSq.isEmptyOrEnemy(piece.color)) {
            const move = new Move(this.squares[row][col], targetSq);
            addIfValid(move);
          }
        }
      }

      if (!piece.moved && piece instanceof King) {
        const currentRow = row;

        const leftRook = this.squares[currentRow][0].piece;
        if (leftRook instanceof Rook && !leftRook.moved) {
          const pathClear = [1, 2, 3].every(c => !this.squares[currentRow][c].hasPiece());
          if (pathClear) {
            const moveK = new Move(this.squares[row][col], this.squares[currentRow][2]);
            const moveR = new Move(this.squares[currentRow][0], this.squares[currentRow][3]);
            if (!this.inCheck(piece, moveK) && !this.inCheck(leftRook, moveR)) {
              piece.leftRook = leftRook;
              addIfValid(moveK);
              leftRook.addMove(moveR);
            }
          }
        }

        const rightRook = this.squares[currentRow][7].piece;
        if (rightRook instanceof Rook && !rightRook.moved) {
          const pathClear = [5, 6].every(c => !this.squares[currentRow][c].hasPiece());
          if (pathClear) {
            const moveK = new Move(this.squares[row][col], this.squares[currentRow][6]);
            const moveR = new Move(this.squares[currentRow][7], this.squares[currentRow][5]);
            if (!this.inCheck(piece, moveK) && !this.inCheck(rightRook, moveR)) {
              piece.rightRook = rightRook;
              addIfValid(moveK);
              rightRook.addMove(moveR);
            }
          }
        }
      }
    };

    // Dispatch to move generator based on piece type
    if (piece instanceof Pawn) pawnMoves();
    else if (piece instanceof Knight) knightMoves();
    else if (piece instanceof Bishop) straightLineMoves([[1, 1], [1, -1], [-1, 1], [-1, -1]]);
    else if (piece instanceof Rook) straightLineMoves([[1, 0], [-1, 0], [0, 1], [0, -1]]);
    else if (piece instanceof Queen) straightLineMoves([
      [1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]
    ]);
    else if (piece instanceof King) kingMoves();
  }
}
