import { Move } from "../board/Move";

export abstract class Piece {
  name: string;
  color: "white" | "black";
  value: number;
  moved: boolean = false;
  moves: Move[] = [];
  texture: string = "";
  textureRect: DOMRect | null = null;

  constructor(name: string, color: "white" | "black", value: number) {
    this.name = name;
    this.color = color;
    this.value = color === "white" ? value : -value;
    this.setTexture();
  }

  setTexture(size: number = 80): void {
    this.texture = `assets/images/imgs-${size}px/${this.color}_${this.name}.png`;
  }

  addMove(move: Move): void {
    this.moves.push(move);
  }

  clearMoves(): void {
    this.moves = [];
  }
}