import { state } from "../utils/state.js";
import { WEB_COLORS, PALETTE_BUTTON_SIZE, MARGIN, PADDING, COLORS } from "../utils/constants.js";
import { Button } from "./Button.js";

export class Palette {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.colorButtons = [];

    const endFirstRow = WEB_COLORS.length / 2;
    WEB_COLORS.forEach((colorName, i) => {
      const row = i < endFirstRow ? 0 : 1;
      const col = row > 0 ? i - endFirstRow : i;
      const bx = this.x + this.h + col * PALETTE_BUTTON_SIZE + col * MARGIN * 2;
      const by = this.y + row * PALETTE_BUTTON_SIZE + PADDING * 2 + (row > 0 ? MARGIN * 2 : 0);
      
      this.colorButtons.push(
        new Button(
          bx,
          by,
          PALETTE_BUTTON_SIZE,
          PALETTE_BUTTON_SIZE,
          colorName,
          () => {
            state.currentColor = colorName;
          },
          colorName
        )
      );
    });
  }

  draw() {
    fill(...COLORS.MEDIUM_BLUISH_GREY);
    noStroke();
    rect(this.x, this.y, this.w, this.h);

    // Current color indicator
    fill(...COLORS.LIGHT_BLUISH_GREY);
    stroke(0);
    rect(this.x + PADDING * 2, this.y + PADDING * 2, this.h - PADDING * 4, this.h - PADDING * 4);

    fill(...COLORS.MEDIUM_BLUISH_GREY);
    const offset = this.h / 2 - this.h / 6;
    const s = PALETTE_BUTTON_SIZE;
    rect(this.x + offset + MARGIN, this.y + offset + MARGIN, s, s);

    fill(state.currentColor);
    rect(this.x + offset, this.y + offset, s, s);

    this.colorButtons.forEach((button) => button.draw());
  }

  mousePressed(mx, my) {
    this.colorButtons.forEach((button) => button.mousePressed(mx, my));
  }
}
