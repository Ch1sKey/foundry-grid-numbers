import { GridNumbersLayer } from './GridNumberLayer.js'
function isV9OrLater() {
  return game.release?.generation ?? 0 >= 9;
}

Hooks.on("init", function () {
  // Register bitmap font
  PIXI.BitmapFont.from("GridNumbersFont", { ...CONFIG.canvasTextStyle, fontFamily: 'Arial' }, { chars: PIXI.BitmapFont.NUMERIC });

  // Register grid-numbers layer type
  CONFIG.Canvas.layers.gridNumbers = isV9OrLater() ? { layerClass: GridNumbersLayer, group: "primary" } : GridNumbersLayer;

  // Register hotkey to toggle numbers
  game.keybindings.register("grid-numbers", "showGridNumbers", {
    name: "Toggle grid numbers",
    hint: "Shows a number of each cell on a grid",
    editable: [{ key: "KeyN" }],
    onDown: () => {
      const gridCanvasLayer = canvas.layers.find((layer) => layer.name === "GridNumbersLayer")
      if(!gridCanvasLayer) {
        console.warn('grid-numbers: could not find GridNumbersLayer layer')
      }
      gridCanvasLayer.toggleShowNumbers();
    },
    restricted: false,
    precedence: CONST.KEYBINDING_PRECEDENCE.NORMAL
  })
})
