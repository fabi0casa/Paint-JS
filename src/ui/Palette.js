import { state } from "../utils/state.js";
import { PALETTE_BUTTON_SIZE, MARGIN, PADDING, COLORS } from "../utils/constants.js";
import { Button } from "./Button.js";

export class Palette {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.colorButtons = [];
    this.addButton = null;

    this.refreshButtons();
  }

  refreshButtons() {
    this.colorButtons = [];
    
    // Organiza as cores em colunas de 2 linhas (top-down, depois left-to-right)
    // Isso garante que as cores 0, 1, 2... fiquem paradas ao adicionar a cor N
    state.paletteColors.forEach((colorName, i) => {
      const col = Math.floor(i / 2);
      const row = i % 2;
      
      const bx = this.x + this.h + col * (PALETTE_BUTTON_SIZE + MARGIN * 2);
      const by = this.y + row * (PALETTE_BUTTON_SIZE + MARGIN * 2) + PADDING * 2;
      
      this.colorButtons.push(
        new Button(
          bx,
          by,
          PALETTE_BUTTON_SIZE,
          PALETTE_BUTTON_SIZE,
          "",
          () => {
            state.currentColor = colorName;
          },
          colorName
        )
      );
    });

    // Posiciona o botão de "+" na próxima vaga disponível seguindo a mesma lógica
    const nextIdx = state.paletteColors.length;
    const col = Math.floor(nextIdx / 2);
    const row = nextIdx % 2;
    
    const bx = this.x + this.h + col * (PALETTE_BUTTON_SIZE + MARGIN * 2);
    const by = this.y + row * (PALETTE_BUTTON_SIZE + MARGIN * 2) + PADDING * 2;
    
    this.addButton = new Button(
        bx,
        by,
        PALETTE_BUTTON_SIZE,
        PALETTE_BUTTON_SIZE,
        "+",
        () => this.promptNewColor(),
        null
    );
  }

  promptNewColor() {
    // Cria um input de cor escondido no HTML para usar o seletor nativo
    const input = document.createElement('input');
    input.type = 'color';
    input.onchange = (e) => {
      const newColor = e.target.value;
      if (!state.paletteColors.includes(newColor)) {
        state.paletteColors.push(newColor);
        state.currentColor = newColor;
        this.refreshButtons();
      }
    };
    input.click();
  }

  draw() {
    fill(...COLORS.MEDIUM_BLUISH_GREY);
    noStroke();
    rect(this.x, this.y, this.w, this.h);

    // Indicador de cor atual
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
    if (this.addButton) this.addButton.draw();
  }

  mousePressed(mx, my) {
    this.colorButtons.forEach((button) => button.mousePressed(mx, my));
    if (this.addButton) this.addButton.mousePressed(mx, my);
  }
}
