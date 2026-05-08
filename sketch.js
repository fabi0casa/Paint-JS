import { state } from "./src/utils/state.js";
import { AVAILABLE_TOOLS } from "./src/utils/constants.js";
import { PaintWindow } from "./src/ui/PaintWindow.js";

let paintWindow;

function preload() {
  state.icon = loadImage("images/icon.png");
  AVAILABLE_TOOLS.forEach((tool) => {
    state.toolIcons[tool] = [
      loadImage(`images/${tool}.png`),
      loadImage(`images/${tool}-on.png`),
    ];
  });
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  noSmooth(); // Desativa o anti-aliasing globalmente
  pixelDensity(1);
  paintWindow = new PaintWindow(
    0,
    0,
    windowWidth,
    windowHeight,
    "untitled - Paint"
  );
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  paintWindow.resize(windowWidth, windowHeight);
}

function draw() {
  background("teal");
  paintWindow.draw();
}

function mousePressed() {
  paintWindow.mousePressed(mouseX, mouseY);
}

function mouseDragged() {
  paintWindow.mouseDragged(mouseX, mouseY);
}

function mouseReleased() {
  paintWindow.mouseReleased();
}

// Expose p5 functions to global scope for p5.js to find them
window.preload = preload;
window.setup = setup;
window.draw = draw;
window.windowResized = windowResized;
window.mousePressed = mousePressed;
window.mouseDragged = mouseDragged;
window.mouseReleased = mouseReleased;
