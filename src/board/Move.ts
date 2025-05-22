import { Square } from "./Square";

export class Move {
  initial: Square;
  final: Square;

  constructor(initial: Square, final: Square) {
    this.initial = initial;
    this.final = final;
  }

  toString(): string {
    return `(${this.initial.col}, ${this.initial.row}) -> (${this.final.col}, ${this.final.row})`;
  }

  equals(other: Move): boolean {
    return (
      this.initial.equals(other.initial) &&
      this.final.equals(other.final)
    );
  }
}