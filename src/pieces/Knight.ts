import { Piece } from "./Piece";

export class Knight extends Piece {
  constructor(color: "white" | "black") {
    super("knight", color, 3.0);
  }
}