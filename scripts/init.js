function patch() {
  const FALLBACK_TEXT_STYLE = {
    fontFamily: 'Arial',
    fontSize: 9,
    fill: 0xff1010,
    align: 'center',
  }
  
  // Agressive monkey patching
  GridLayer.prototype._draw = GridLayer.prototype.draw;
  GridLayer.prototype.__GRID_NUMBERS_MODULE__showNumbers = true;
  GridLayer.prototype.__GRID_NUMBERS_MODULE__setShowNumbers = function (status) {
    this.__GRID_NUMBERS_MODULE__showNumbers = status;
    this.draw();
  }
  GridLayer.prototype.__GRID_NUMBERS_MODULE__toggleShowNumbers = function () {
    this.__GRID_NUMBERS_MODULE__setShowNumbers(!this.__GRID_NUMBERS_MODULE__showNumbers)
  }
  
  GridLayer.prototype.draw = async function () {
    await this._draw();
    if (!this.grid) {
      console.warn(`MODULE: GRID-NUMBERS: No grid yet Can't draw numbers`);
      return;
    };
    if (!this.__GRID_NUMBERS_MODULE__showNumbers) return;
    const textContainer = new PIXI.Container({ name: "grid-numbers" });
    const { size, width, height } = this.grid.options.dimensions;
    const textStyle = CONFIG?.canvasTextStyle ?? FALLBACK_TEXT_STYLE;
    textStyle.fontSize = size / 4;
  
    const rows = Math.ceil(height / size);
    const cols = Math.ceil(width / size);
    for (let y = 0; y <= rows; y++) {
      for (let x = 0; x <= cols; x++) {
        const orderNumber = cols * y + x + 1;
        const text = new PIXI.Text(orderNumber, textStyle);
        text.x = x * size + size - text.width;
        text.y = y * size;
        textContainer.addChild(text)
      }
    }
    this.addChild(textContainer);
    Hooks.once('canvasReady', () => {
      requestAnimationFrame(() => {
        textContainer.cacheAsBitmap = true;
      })
    })
  
  }
}

Hooks.on("init", function () {
  patch();
  game.keybindings.register("grid-numbers", "showGridNumbers", {
    name: "Toggle grid numbers",
    hint: "Shows a number of each cell on a grid",
    editable: [{ key: "KeyN"}],
    onDown: () => { 
      canvas.grid.__GRID_NUMBERS_MODULE__toggleShowNumbers?.()
    },
    restricted: false,
    precedence: CONST.KEYBINDING_PRECEDENCE.NORMAL
  })
})

