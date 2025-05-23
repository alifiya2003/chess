import { Board } from "../board/Board";
import { Move } from "../board/Move";
import { Square } from "../board/Square";
import { Piece } from "../pieces/Piece";

export class Game {
  board: Board;
  selectedPiece: Piece | null = null;
  fromSquare: Square | null = null;
  nextPlayer: "white" | "black" = "white";
  hoverSquare: Square | null = null;
  winner: "white" | "black" | null = null;
  isCheck: boolean = false;


  constructor() {
    this.board = new Board();
  }

  selectPiece(square: Square): boolean {
    const piece = square.piece;
    if (piece && piece.color === this.nextPlayer) {
      this.board.calcMoves(piece, square.row, square.col);
      this.selectedPiece = piece;
      this.fromSquare = square;
      return true;
    }
    return false;
  }

  tryMove(targetSquare: Square): void {
    const piece = this.selectedPiece;
  
    if (piece && piece.moves.some(m => m.final.equals(targetSquare))) {
      const move = new Move(this.fromSquare!, targetSquare);
      const captured = targetSquare.hasPiece();
  
      this.board.move(piece, move);
      this.board.setTrueEnPassant(piece);
  
      const enemyPieces = this.getEnemyPieces();
      let hasValidMoves = false;
  
      for (const { piece, row, col } of enemyPieces) {
        this.board.calcMoves(piece, row, col);
        if (piece.moves.length > 0) {
          hasValidMoves = true;
          break;
        }
      }
  
      if (!hasValidMoves) {
        this.winner = this.nextPlayer;
      }
  
      this.nextTurn();
    }
  
    this.selectedPiece = null;
    this.fromSquare = null;
  }
  
  

  getEnemyPieces(): { piece: Piece; row: number; col: number }[] {
    const enemyColor = this.nextPlayer === "white" ? "black" : "white";
    const result: { piece: Piece; row: number; col: number }[] = [];
  
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.board.squares[row][col].piece;
        if (piece && piece.color === enemyColor) {
          result.push({ piece, row, col });
        }
      }
    }
  
    return result;
  }
  
  getEnemyKing(): Piece {
    const enemyColor = this.nextPlayer === "white" ? "black" : "white";
  
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.board.squares[row][col].piece;
        if (piece && piece.name === "king" && piece.color === enemyColor) {
          return piece;
        }
      }
    }
  
    throw new Error("Enemy king not found");
  }
  

  clearSelection(): void {
    this.selectedPiece = null;
    this.fromSquare = null;
  }

  setHover(square: Square): void {
    this.hoverSquare = square;
  }

  nextTurn(): void {
    this.nextPlayer = this.nextPlayer === "white" ? "black" : "white";
  }

  reset(): void {
    this.board = new Board();
    this.clearSelection();
    this.nextPlayer = "white";
  }
}