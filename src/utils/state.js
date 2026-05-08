import { WEB_COLORS } from "./constants.js";

export const state = {
  currentTool: "pencil",
  currentColor: "black",
  icon: null,
  toolIcons: {},
  paletteColors: [...WEB_COLORS], // Cópia das cores iniciais
};
