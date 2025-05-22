import { Game } from "./Game";
import { SQSIZE, ROWS, COLS } from "../core/Const";

class ImageCache {
  private cache: Map<string, HTMLImageElement> = new Map();

  get(src: string): HTMLImageElement {
    if (this.cache.has(src)) return this.cache.get(src)!;

    const img = new Image();
    img.src = src;
    this.cache.set(src, img);
    return img;
  }
}

export class Renderer {
  ctx: CanvasRenderingContext2D;
  game: Game;
  imageCache: ImageCache;

  constructor(ctx: CanvasRenderingContext2D, game: Game) {
    this.ctx = ctx;
    this.game = game;
    this.imageCache = new ImageCache();
  }

  drawBoard(): void {
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const isLight = (row + col) % 2 === 0;
        this.ctx.fillStyle = isLight ? "#f0d9b5" : "#b58863";
        this.ctx.fillRect(col * SQSIZE, row * SQSIZE, SQSIZE, SQSIZE);
      }
    }
  }

  drawCoordinates(): void {
    const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
  
    this.ctx.fillStyle = "#333";
    this.ctx.font = "bold 14px monospace";
    this.ctx.textAlign = "left";
    this.ctx.textBaseline = "top";
  
    for (let row = 0; row < ROWS; row++) {
      // Rank number (1–8) on the left side
      const rank = ROWS - row;
      this.ctx.fillText(
        rank.toString(),
        2, // left padding
        row * SQSIZE + 2
      );
    }
  
    for (let col = 0; col < COLS; col++) {
      // File letter (a–h) at the bottom
      const file = files[col];
      this.ctx.textAlign = "center";
      this.ctx.fillText(
        file,
        col * SQSIZE + SQSIZE / 2,
        ROWS * SQSIZE - 16 // bottom padding
      );
    }
  }
  

  drawHighlights(): void {
    const piece = this.game.selectedPiece;
    if (piece) {
      for (const move of piece.moves) {
        const { row, col } = move.final;
        this.ctx.fillStyle = "rgba(255, 255, 0, 0.4)";
        this.ctx.fillRect(col * SQSIZE, row * SQSIZE, SQSIZE, SQSIZE);
      }
    }

    const hover = this.game.hoverSquare;
    if (hover) {
      this.ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
      this.ctx.lineWidth = 3;
      this.ctx.strokeRect(hover.col * SQSIZE, hover.row * SQSIZE, SQSIZE, SQSIZE);
    }
  }

  drawPieces(): void {
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const piece = this.game.board.squares[row][col].piece;
        if (piece ) {
          const img = this.imageCache.get(piece.texture);
          const x = col * SQSIZE + SQSIZE / 2;
          const y = row * SQSIZE + SQSIZE / 2;

          if (img.complete) {
            this.ctx.drawImage(img, x - 40, y - 40, 80, 80);
          } else {
            img.onload = () => {
              this.ctx.drawImage(img, x - 40, y - 40, 80, 80);
            };
          }
        }
      }
    }
  }

  drawStatus(): void {
    const message = this.game.winner
      ? `${this.game.winner.toUpperCase()} WINS!`
      : this.game.isCheck
      ? "Check!"
      : null;
  
    if (message) {
      this.ctx.fillStyle = this.game.winner ? "#D32F2F" : "#FFA000";
      this.ctx.font = "bold 36px sans-serif";
      this.ctx.textAlign = "center";
      this.ctx.fillText(message, COLS * SQSIZE / 2, ROWS * SQSIZE / 2);
    }
  }
  

  draw(): void {
    this.ctx.clearRect(0, 0, COLS * SQSIZE, ROWS * SQSIZE);
    this.drawBoard();
    this.drawCoordinates(); // 👈 Add this line
    this.drawHighlights();
    this.drawPieces();
    this.drawStatus();
  }
}
