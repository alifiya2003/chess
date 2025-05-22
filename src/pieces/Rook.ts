import { Piece } from "./Piece";

export class Rook extends Piece {
  constructor(color: "white" | "black") {
    super("rook", color, 5.0);
  }
}