import { state } from "../utils/state.js";
import { COLORS } from "../utils/constants.js";

export class Button {
  constructor(x, y, w, h, label, action, fillColor = null, img = null) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.label = label;
    this.action = action;
    this.fillColor = fillColor;
    this.img = img;
  }

  draw() {
    if (this.img != null) {
      const imgWidth = Math.min(this.img.width, this.w);
      const imgHeight = Math.min(this.img.height, this.h);
      const imgX = this.x + this.w / 2 - imgWidth / 2;
      const imgY = this.y + this.h / 2 - imgHeight / 2;
      image(this.img, imgX, imgY, imgWidth, imgHeight);
    } else {
      if (this.label === "+") {
        // Desenho especial do botão arco-íris
        for (let i = 0; i < this.w; i++) {
          let hue = map(i, 0, this.w, 0, 255);
          colorMode(HSB);
          stroke(hue, 200, 255);
          line(this.x + i, this.y, this.x + i, this.y + this.h);
        }
        colorMode(RGB);
        stroke(0);
        noFill();
        rect(this.x, this.y, this.w, this.h);
        
        // Texto "+" por cima
        fill(255);
        noStroke();
        textSize(16);
        textAlign(CENTER, CENTER);
        textStyle(BOLD);
        text(this.label, this.x + this.w / 2, this.y + this.h / 2);
        textStyle(NORMAL);
      } else {
        const c = this.fillColor ? color(this.fillColor) : color(...COLORS.MEDIUM_BLUISH_GREY);
        fill(c);
        stroke(0);
        rect(this.x, this.y, this.w, this.h);
        if (!this.fillColor) {
          fill(0);
          noStroke();
          textSize(10);
          textAlign(CENTER, CENTER);
          text(this.label, this.x + this.w / 2, this.y + this.h / 2);
        }
      }
    }
  }

  mousePressed(mx, my) {
    if (mx > this.x && mx < this.x + this.w && my > this.y && my < this.y + this.h) {
      this.action();
    }
  }
}

export class ToolbarButton extends Button {
  constructor(x, y, w, h, label, action, fillColor = null, img = null, onImg = null) {
    super(x, y, w, h, label, action, fillColor, img);
    this.onImg = onImg;
  }

  draw() {
    const isSelected = state.currentTool === this.label;
    const currentImg = isSelected && this.onImg ? this.onImg : this.img;

    if (currentImg) {
      const imgWidth = Math.min(currentImg.width, this.w);
      const imgHeight = Math.min(currentImg.height, this.h);
      const imgX = this.x + this.w / 2 - imgWidth / 2;
      const imgY = this.y + this.h / 2 - imgHeight / 2;
      image(currentImg, imgX, imgY, imgWidth, imgHeight);
    }
  }
}
