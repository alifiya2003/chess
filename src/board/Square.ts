import { Piece } from "../pieces/Piece";

export class Square {
  static ALPHACOLS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

  row: number;
  col: number;
  piece: Piece | null;
  alphacol: string;

  constructor(row: number, col: number, piece: Piece | null = null) {
    this.row = row;
    this.col = col;
    this.piece = piece;
    this.alphacol = Square.ALPHACOLS[col];
  }

  equals(other: Square): boolean {
    return this.row === other.row && this.col === other.col;
  }

  hasPiece(): boolean {
    return this.piece !== null;
  }

  isEmpty(): boolean {
    return !this.hasPiece();
  }

  hasTeamPiece(color: string): boolean {
    return this.hasPiece() && this.piece?.color === color;
  }

  hasEnemyPiece(color: string): boolean {
    return this.hasPiece() && this.piece?.color !== color;
  }

  isEmptyOrEnemy(color: string): boolean {
    return this.isEmpty() || this.hasEnemyPiece(color);
  }

  static inRange(...args: number[]): boolean {
    return args.every(arg => arg >= 0 && arg < 8);
  }

  static getAlphaCol(col: number): string {
    return Square.ALPHACOLS[col];
  }
}