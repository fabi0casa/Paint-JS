import { state } from "../utils/state.js";
import { 
  ICON_SIZE, MARGIN, PADDING, TITLEBAR_H, TOOLBAR_W, PALETTE_H, CANVAS_GAP, COLORS 
} from "../utils/constants.js";
import { Button } from "./Button.js";
import { Toolbar } from "./Toolbar.js";
import { Palette } from "./Palette.js";
import { Canvas } from "../core/Canvas.js";

export class PaintWindow {
  constructor(x, y, w, h, title) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.title = title;
    this.visible = true;

    this.initializeComponents();
  }

  initializeComponents() {
    this.closeButton = new Button(
      this.x + this.w - ICON_SIZE - MARGIN * 2,
      this.y + MARGIN * 2,
      ICON_SIZE,
      ICON_SIZE,
      "↺",
      () => {
        window.location.reload();
      }
    );

    this.downloadButton = new Button(
      this.x + this.w - (ICON_SIZE * 2) - MARGIN * 4,
      this.y + MARGIN * 2,
      ICON_SIZE,
      ICON_SIZE,
      "💾",
      () => {
        this.canvas.downloadImage();
      }
    );

    this.toolbar = new Toolbar(
      this.x + MARGIN,
      this.y + TITLEBAR_H + MARGIN * 2,
      TOOLBAR_W,
      this.h - PALETTE_H - TITLEBAR_H
    );

    this.palette = new Palette(
      this.x + MARGIN,
      this.y + this.h - PALETTE_H - MARGIN,
      this.w - MARGIN * 2,
      PALETTE_H
    );

    this.canvas = new Canvas(
      this.x + TOOLBAR_W + PADDING * 2,
      this.y + TITLEBAR_H + PADDING * 2,
      this.w - TOOLBAR_W - CANVAS_GAP,
      this.h - PALETTE_H - TITLEBAR_H - CANVAS_GAP
    );
  }

  resize(newWidth, newHeight) {
    this.w = newWidth;
    this.h = newHeight;
    
    // Atualiza botões e sub-componentes sem recriar tudo
    this.closeButton.x = this.x + this.w - ICON_SIZE - MARGIN * 2;
    this.closeButton.y = this.y + MARGIN * 2;

    this.toolbar.h = this.h - PALETTE_H - TITLEBAR_H;
    
    this.palette.y = this.y + this.h - PALETTE_H - MARGIN;
    this.palette.w = this.w - MARGIN * 2;
  }

  draw() {
    if (!this.visible) return;

    // Window background
    fill(...COLORS.MEDIUM_BLUISH_GREY);
    stroke(0);
    rect(this.x, this.y, this.w, this.h);

    this.drawTitleBar();
    this.closeButton.draw();
    this.downloadButton.draw();
    this.toolbar.draw();

    // Canvas container background
    const containerX = this.x + TOOLBAR_W + PADDING / 2;
    const containerY = this.y + TITLEBAR_H + MARGIN + PADDING / 2;
    const containerW = this.w - TOOLBAR_W - PADDING;
    const containerH = this.h - PALETTE_H - TITLEBAR_H - PADDING - MARGIN;

    fill(...COLORS.DARK_BLUISH_GREY);
    noStroke();
    rect(containerX, containerY, containerW, containerH);
    
    // Scissor para clipar o desenho do canvas dentro do container azul
    drawingContext.save();
    drawingContext.beginPath();
    drawingContext.rect(containerX, containerY, containerW, containerH);
    drawingContext.clip();

    this.canvas.display();

    drawingContext.restore();

    this.palette.draw();
  }

  drawTitleBar() {
    fill(...COLORS.TITLE_BLUISH_GREY);
    stroke(0);
    rect(
      this.x + PADDING / 2,
      this.y + PADDING / 2,
      this.w - PADDING,
      TITLEBAR_H
    );

    if (state.icon) {
      image(
        state.icon,
        this.x + MARGIN * 2,
        this.y + MARGIN * 2,
        ICON_SIZE,
        ICON_SIZE
      );
    }

    fill(255);
    noStroke();
    textSize(12);
    textAlign(LEFT, CENTER);
    textFont("Courier New");
    textStyle(BOLD);
    const tx = this.x + ICON_SIZE + MARGIN * 5;
    const ty = this.y + TITLEBAR_H - PADDING * 1.5;
    text(this.title, tx, ty);
  }

  mousePressed(mx, my) {
    this.closeButton.mousePressed(mx, my);
    this.downloadButton.mousePressed(mx, my);
    this.palette.mousePressed(mx, my);
    this.toolbar.mousePressed(mx, my);
    this.canvas.mousePressed(mx, my);
  }

  mouseDragged(mx, my) {
    this.canvas.mouseDragged(mx, my);
  }

  mouseReleased() {
    this.canvas.mouseReleased();
  }
}
