import { Piece } from "./Piece";

export class Pawn extends Piece {
  dir: number;
  enPassant: boolean = false;

  constructor(color: "white" | "black") {
    super("pawn", color, 1.0);
    this.dir = color === "white" ? -1 : 1;
  }
}