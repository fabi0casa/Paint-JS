import { state } from "../utils/state.js";
import { RESIZE_HANDLE_SIZE, PIXEL_SCALE } from "../utils/constants.js";

export class Canvas {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w; // Largura visual (pixels na tela)
    this.h = h; // Altura visual

    // O buffer real terá menos pixels (proporcional ao PIXEL_SCALE)
    this.initBuffer(w, h);

    this.previewX = null;
    this.previewY = null;
    this.drawingX = null;
    this.drawingY = null;
    this.lastX = null;
    this.lastY = null;

    this.resizeMode = null; // 'w', 'h', 'nw' (diagonal)
  }

  initBuffer(visualW, visualH) {
    const bw = Math.max(1, Math.floor(visualW / PIXEL_SCALE));
    const bh = Math.max(1, Math.floor(visualH / PIXEL_SCALE));
    this.buffer = createGraphics(bw, bh);
    this.buffer.noSmooth();
    this.buffer.background(255);
  }

  resizeBuffer(visualW, visualH) {
    // Garante tamanho mínimo visual
    visualW = Math.max(PIXEL_SCALE * 2, visualW);
    visualH = Math.max(PIXEL_SCALE * 2, visualH);

    const bw = Math.max(1, Math.floor(visualW / PIXEL_SCALE));
    const bh = Math.max(1, Math.floor(visualH / PIXEL_SCALE));
    
    if (bw === this.buffer.width && bh === this.buffer.height) {
        this.w = visualW;
        this.h = visualH;
        return;
    }

    const oldBuffer = this.buffer;
    this.w = visualW;
    this.h = visualH;
    
    this.buffer = createGraphics(bw, bh);
    this.buffer.noSmooth();
    this.buffer.background(255);
    this.buffer.image(oldBuffer, 0, 0);
  }

  display() {
    // Sombra
    fill(100);
    noStroke();
    rect(this.x + 2, this.y + 2, this.w, this.h);

    // Papel (fundo branco esticado)
    fill(255);
    stroke(0);
    strokeWeight(1);
    rect(this.x, this.y, this.w, this.h);
    
    // Desenha o buffer esticado para dar o efeito de pixel art
    noSmooth();
    image(this.buffer, this.x, this.y, this.w, this.h);

    this.drawResizeHandles();
    this.updateCursor();

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

  drawResizeHandles() {
    fill(255);
    stroke(0);
    strokeWeight(1);
    const s = RESIZE_HANDLE_SIZE;
    
    // Direita (Horizontal)
    rect(this.x + this.w, this.y + this.h / 2 - s / 2, s, s);
    // Baixo (Vertical)
    rect(this.x + this.w / 2 - s / 2, this.y + this.h, s, s);
    // Canto (Diagonal)
    rect(this.x + this.w, this.y + this.h, s, s);
  }

  updateCursor() {
    const mx = mouseX;
    const my = mouseY;
    const s = RESIZE_HANDLE_SIZE;

    // Se já estiver redimensionando, mantém o cursor de redimensionamento
    if (this.resizeMode) {
      if (this.resizeMode === 'nw') cursor('nwse-resize');
      else if (this.resizeMode === 'w') cursor('ew-resize');
      else if (this.resizeMode === 'h') cursor('ns-resize');
      return;
    }

    // Detecção das alças para mudar o cursor (usando margem de erro pequena para facilitar)
    const overRight = mx >= this.x + this.w && mx <= this.x + this.w + s &&
                      my >= this.y + this.h / 2 - s / 2 && my <= this.y + this.h / 2 + s / 2;
    
    const overBottom = mx >= this.x + this.w / 2 - s / 2 && mx <= this.x + this.w / 2 + s / 2 &&
                       my >= this.y + this.h && my <= this.y + this.h + s;
    
    const overCorner = mx >= this.x + this.w && mx <= this.x + this.w + s &&
                       my >= this.y + this.h && my <= this.y + this.h + s;

    if (overCorner) {
      cursor('nwse-resize');
    } else if (overRight) {
      cursor('ew-resize');
    } else if (overBottom) {
      cursor('ns-resize');
    } else if (this.mouseInsideCanvas(mx, my)) {
      cursor(CROSS); // Cursor de precisão dentro do canvas
    } else {
      cursor(ARROW);
    }
  }

  mouseInsideCanvas(mx, my) {
    return mx >= this.x && mx <= this.x + this.w && my >= this.y && my <= this.y + this.h;
  }

  isDrawingGeometry() {
    return this.drawingX !== null;
  }

  getStrokeWeight() {
    return state.currentTool === "brush" ? 2 : 1;
  }

  toBufferCoord(v, offset) {
    return Math.floor((v - offset) / PIXEL_SCALE);
  }

  drawShape(shape, x1, y1, x2, y2, persist = true) {
    const target = persist ? this.buffer : window;
    
    let bx1 = x1, by1 = y1, bx2 = x2, by2 = y2;
    if (persist) {
      bx1 = this.toBufferCoord(x1, 0);
      by1 = this.toBufferCoord(y1, 0);
      bx2 = this.toBufferCoord(x2, 0);
      by2 = this.toBufferCoord(y2, 0);
    }

    target.stroke(state.currentColor);
    target.strokeWeight(this.getStrokeWeight());

    switch (shape) {
      case "line":
        target.line(bx1, by1, bx2, by2);
        break;
      case "rect":
        target.noFill();
        target.rect(bx1, by1, bx2 - bx1, by2 - by1);
        break;
      case "circle":
        target.noFill();
        const rx = (bx2 - bx1) / 2;
        const ry = (by2 - by1) / 2;
        target.ellipse(bx1 + rx, by1 + ry, Math.abs(rx * 2), Math.abs(ry * 2));
        break;
    }
  }

  mousePressed(mx, my) {
    const s = RESIZE_HANDLE_SIZE;

    // Detectar qual alça foi clicada (prioridade para o canto)
    if (mx >= this.x + this.w && mx <= this.x + this.w + s &&
        my >= this.y + this.h && my <= this.y + this.h + s) {
      this.resizeMode = 'nw';
      return;
    } 
    
    if (mx >= this.x + this.w && mx <= this.x + this.w + s &&
        my >= this.y + this.h / 2 - s / 2 && my <= this.y + this.h / 2 + s / 2) {
      this.resizeMode = 'w';
      return;
    } 
    
    if (mx >= this.x + this.w / 2 - s / 2 && mx <= this.x + this.w / 2 + s / 2 &&
        my >= this.y + this.h && my <= this.y + this.h + s) {
      this.resizeMode = 'h';
      return;
    }

    if (!this.mouseInsideCanvas(mx, my)) return;

    const ax = this.toBufferCoord(mx, this.x);
    const ay = this.toBufferCoord(my, this.y);
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
        this.beginGeometry(mx - this.x, my - this.y);
        break;
      case "spray":
        this.sprayPaint(ax, ay);
        break;
    }
  }

  mouseDragged(mx, my) {
    if (this.resizeMode) {
      let newW = this.w;
      let newH = this.h;
      if (this.resizeMode === 'w' || this.resizeMode === 'nw') newW = mx - this.x;
      if (this.resizeMode === 'h' || this.resizeMode === 'nw') newH = my - this.y;
      this.resizeBuffer(newW, newH);
      return;
    }

    if (!this.mouseInsideCanvas(mx, my)) {
      this.lastX = null;
      this.lastY = null;
      return;
    }

    const ax = this.toBufferCoord(mx, this.x);
    const ay = this.toBufferCoord(my, this.y);

    switch (state.currentTool) {
      case "spray":
        this.sprayPaint(ax, ay);
        break;
      case "eraser":
        const pax = this.toBufferCoord(pmouseX, this.x);
        const pay = this.toBufferCoord(pmouseY, this.y);
        this.eraser(pax, pay, ax, ay);
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
        this.previewX = mx - this.x;
        this.previewY = my - this.y;
        break;
    }
  }

  mouseReleased() {
    this.resizeMode = null;
    if (this.isDrawingGeometry()) {
      this.endGeometry(mouseX - this.x, mouseY - this.y);
    }
    this.lastX = null;
    this.lastY = null;
  }

  sprayPaint(x, y) {
    const density = 5;
    const radius = 3;
    this.buffer.stroke(state.currentColor);
    this.buffer.strokeWeight(1);
    for (let i = 0; i < density; i++) {
      const angle = random(TWO_PI);
      const r = random(radius);
      this.buffer.point(Math.floor(x + r * cos(angle)), Math.floor(y + r * sin(angle)));
    }
  }

  eraser(x1, y1, x2, y2) {
    this.buffer.stroke(255);
    this.buffer.strokeWeight(4);
    this.buffer.line(x1, y1, x2, y2);
  }

  paint(x, y) {
    this.buffer.loadPixels();
    const w = this.buffer.width;
    const h = this.buffer.height;
    
    if (x < 0 || x >= w || y < 0 || y >= h) return;

    const idx = 4 * (y * w + x);
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

    const stack = [[x, y]];
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

  beginGeometry(x, y) {
    this.drawingX = x;
    this.drawingY = y;
  }

  endGeometry(x, y) {
    this.drawShape(state.currentTool, this.drawingX, this.drawingY, x, y);
    this.drawingX = null;
    this.drawingY = null;
    this.previewX = null;
    this.previewY = null;
  }
}
