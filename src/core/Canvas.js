import { state } from "../utils/state.js";

export class Canvas {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;

    this.buffer = createGraphics(w, h);
    this.buffer.background(255);

    this.previewX = null;
    this.previewY = null;
    this.drawingX = null;
    this.drawingY = null;
    this.lastX = null;
    this.lastY = null;
  }

  resizeBuffer(newWidth, newHeight) {
    const oldBuffer = this.buffer;
    this.w = newWidth;
    this.h = newHeight;
    this.buffer = createGraphics(newWidth, newHeight);
    this.buffer.background(255);
    this.buffer.image(oldBuffer, 0, 0);
  }

  display() {
    fill(255);
    noStroke();
    rect(this.x, this.y, this.w, this.h);
    image(this.buffer, this.x, this.y);

    if (this.isDrawingGeometry() && this.previewX !== null && this.previewY !== null) {
      this.drawShape(
        state.currentTool,
        this.drawingX + this.x,
        this.drawingY + this.y,
        this.previewX + this.x,
        this.previewY + this.y,
        false
      );
    }
  }

  mouseInsideCanvas(mx, my) {
    return mx >= this.x && mx <= this.x + this.w && my >= this.y && my <= this.y + this.h;
  }

  isDrawingGeometry() {
    return this.drawingX !== null;
  }

  getStrokeWeight() {
    return state.currentTool === "brush" ? 5 : 1;
  }

  beginGeometry(x, y) {
    this.drawingX = x;
    this.drawingY = y;
    this.previewX = null;
    this.previewY = null;
  }

  endGeometry(x, y) {
    if (this.isDrawingGeometry()) {
      this.drawShape(state.currentTool, this.drawingX, this.drawingY, x, y);
    }
    this.drawingX = null;
    this.drawingY = null;
    this.previewX = null;
    this.previewY = null;
  }

  drawShape(shape, x1, y1, x2, y2, persist = true) {
    const target = persist ? this.buffer : window;
    target.stroke(state.currentColor);
    target.strokeWeight(this.getStrokeWeight());

    switch (shape) {
      case "line":
        target.line(x1, y1, x2, y2);
        break;
      case "rect":
        target.noFill();
        target.rect(x1, y1, x2 - x1, y2 - y1);
        break;
      case "circle":
        target.noFill();
        const rx = (x2 - x1) / 2;
        const ry = (y2 - y1) / 2;
        target.ellipse(x1 + rx, y1 + ry, Math.abs(rx * 2), Math.abs(ry * 2));
        break;
    }
  }

  mousePressed(mx, my) {
    if (!this.mouseInsideCanvas(mx, my)) return;

    const ax = mx - this.x;
    const ay = my - this.y;
    this.lastX = ax;
    this.lastY = ay;

    switch (state.currentTool) {
      case "paint":
        this.paint(ax, ay);
        break;
      case "pencil":
      case "brush":
        this.buffer.stroke(state.currentColor);
        this.buffer.strokeWeight(this.getStrokeWeight());
        this.buffer.point(ax, ay);
        break;
      case "line":
      case "rect":
      case "circle":
        this.beginGeometry(ax, ay);
        break;
      case "spray":
        this.sprayPaint(ax, ay);
        break;
    }
  }

  mouseDragged(mx, my) {
    const ax = mx - this.x;
    const ay = my - this.y;

    if (!this.mouseInsideCanvas(mx, my)) {
      if (!this.isDrawingGeometry()) {
        this.lastX = null;
        this.lastY = null;
      }
      return;
    }

    switch (state.currentTool) {
      case "spray":
        this.sprayPaint(ax, ay);
        break;
      case "eraser":
        this.eraser(pmouseX - this.x, pmouseY - this.y, ax, ay);
        break;
      case "pencil":
      case "brush":
        if (this.lastX !== null && this.lastY !== null) {
          this.buffer.stroke(state.currentColor);
          this.buffer.strokeWeight(this.getStrokeWeight());
          this.buffer.line(this.lastX, this.lastY, ax, ay);
        }
        this.lastX = ax;
        this.lastY = ay;
        break;
      case "line":
      case "rect":
      case "circle":
        this.previewX = ax;
        this.previewY = ay;
        break;
    }
  }

  mouseReleased() {
    if (this.isDrawingGeometry()) {
      this.endGeometry(mouseX - this.x, mouseY - this.y);
    }
    this.lastX = null;
    this.lastY = null;
  }

  sprayPaint(x, y) {
    const density = 50;
    const radius = 10;
    this.buffer.stroke(state.currentColor);
    this.buffer.strokeWeight(1);
    for (let i = 0; i < density; i++) {
      const angle = random(TWO_PI);
      const r = random(radius);
      this.buffer.point(x + r * cos(angle), y + r * sin(angle));
    }
  }

  eraser(x1, y1, x2, y2) {
    this.buffer.stroke(255);
    this.buffer.strokeWeight(10);
    this.buffer.line(x1, y1, x2, y2);
  }

  paint(x, y) {
    x = Math.floor(x);
    y = Math.floor(y);
    
    this.buffer.loadPixels();
    const d = this.buffer.pixelDensity();
    const w = this.buffer.width * d;
    const h = this.buffer.height * d;
    
    const idx = 4 * (y * d * w + x * d);
    const targetR = this.buffer.pixels[idx];
    const targetG = this.buffer.pixels[idx+1];
    const targetB = this.buffer.pixels[idx+2];
    const targetA = this.buffer.pixels[idx+3];

    const replacementColor = color(state.currentColor);
    const replaceR = red(replacementColor);
    const replaceG = green(replacementColor);
    const replaceB = blue(replacementColor);
    const replaceA = alpha(replacementColor);

    if (targetR === replaceR && targetG === replaceG && targetB === replaceB && targetA === replaceA) {
      return;
    }

    const stack = [[x * d, y * d]];
    const pixels = this.buffer.pixels;

    while (stack.length > 0) {
      const [cx, cy] = stack.pop();
      if (cx < 0 || cx >= w || cy < 0 || cy >= h) continue;

      const currentIdx = 4 * (cy * w + cx);
      if (pixels[currentIdx] === targetR && 
          pixels[currentIdx+1] === targetG && 
          pixels[currentIdx+2] === targetB && 
          pixels[currentIdx+3] === targetA) {
        
        pixels[currentIdx] = replaceR;
        pixels[currentIdx+1] = replaceG;
        pixels[currentIdx+2] = replaceB;
        pixels[currentIdx+3] = replaceA;

        stack.push([cx + 1, cy]);
        stack.push([cx - 1, cy]);
        stack.push([cx, cy + 1]);
        stack.push([cx, cy - 1]);
      }
    }
    this.buffer.updatePixels();
  }
}
