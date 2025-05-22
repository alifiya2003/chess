import { Piece } from "./Piece";

export class Queen extends Piece {
  constructor(color: "white" | "black") {
    super("queen", color, 9.0);
  }
}