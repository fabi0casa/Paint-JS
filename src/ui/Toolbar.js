import { state } from "../utils/state.js";
import { AVAILABLE_TOOLS, TOOLBAR_BUTTON_SIZE, COLORS } from "../utils/constants.js";
import { ToolbarButton } from "./Button.js";

export class Toolbar {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.toolButtons = [];

    AVAILABLE_TOOLS.forEach((toolName, i) => {
      const row = Math.floor(i / 2);
      const col = i % 2;
      this.toolButtons.push(
        new ToolbarButton(
          this.x + 5 + col * TOOLBAR_BUTTON_SIZE,
          this.y + 5 + row * TOOLBAR_BUTTON_SIZE,
          TOOLBAR_BUTTON_SIZE,
          TOOLBAR_BUTTON_SIZE,
          toolName,
          () => {
            state.currentTool = toolName;
          },
          null,
          state.toolIcons[toolName][0],
          state.toolIcons[toolName][1]
        )
      );
    });
  }

  draw() {
    fill(...COLORS.MEDIUM_BLUISH_GREY);
    noStroke();
    rect(this.x, this.y, this.w, this.h);
    this.toolButtons.forEach((button) => button.draw());
  }

  mousePressed(mx, my) {
    this.toolButtons.forEach((button) => button.mousePressed(mx, my));
  }
}
