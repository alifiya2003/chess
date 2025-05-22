import { Piece } from "./Piece";

export class Bishop extends Piece {
  constructor(color: "white" | "black") {
    super("bishop", color, 3.001);
  }
}