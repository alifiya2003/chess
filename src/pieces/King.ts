import { Piece } from "./Piece";
import { Rook } from "./Rook";

export class King extends Piece {
  leftRook: Rook | null = null;
  rightRook: Rook | null = null;

  constructor(color: "white" | "black") {
    super("king", color, 10000.0);
  }
}