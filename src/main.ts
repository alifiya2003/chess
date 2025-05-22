import { Game } from "./ui/Game";
import { Renderer } from "./ui/Renderer";
import { SQSIZE } from "./core/Const";

const canvas = document.getElementById("chess") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;
const game = new Game();
const renderer = new Renderer(ctx, game);

canvas.width = 800;
canvas.height = 800;

canvas.addEventListener("mousemove", (e) => {
  const row = Math.floor(e.offsetY / SQSIZE);
  const col = Math.floor(e.offsetX / SQSIZE);
  game.setHover(game.board.squares[row][col]);
  renderer.draw();
});

canvas.addEventListener("mousedown", (e) => {
  const row = Math.floor(e.offsetY / SQSIZE);
  const col = Math.floor(e.offsetX / SQSIZE);
  const square = game.board.squares[row][col];
  game.selectPiece(square);
  renderer.draw();
});

canvas.addEventListener("mouseup", (e) => {
  const row = Math.floor(e.offsetY / SQSIZE);
  const col = Math.floor(e.offsetX / SQSIZE);
  const square = game.board.squares[row][col];
  game.tryMove(square);
  renderer.draw();
});

renderer.draw();