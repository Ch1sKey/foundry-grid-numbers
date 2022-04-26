// It kinda breaks everything on changing fo hex tiles. 
// Shoud fix it


function patch() {
  const FALLBACK_TEXT_STYLE = {
    fontFamily: 'Arial',
    fontSize: 9,
    fill: 0xff1010,
    align: 'center',
  }


  const usePrefix = (name) => `__GRID_NUMBERS_MODULE__${name}`;
  const PROP = {
    showNumbers: usePrefix('showNumbers'),
    numbersGridContainer: usePrefix('numbersGridContainer'),
    setShowNumbers: usePrefix('setShowNumbers'),
    showNumbers: usePrefix('showNumbers'),
    toggleShowNumbers: usePrefix('toggleShowNumbers'),
    setShowNumbers: usePrefix('setShowNumbers'),
    showNumbers: usePrefix('showNumbers'),
    getGridNumbersContainer: usePrefix('getGridNumbersContainer'),
    showNumbers: usePrefix('showNumbers'),
    numbersGridContainer: usePrefix('numbersGridContainer'),
    numbersGridContainer: usePrefix('numbersGridContainer'),
    getGridNumbersContainer: usePrefix('getGridNumbersContainer'),
  }
  // Agressive monkey patching

  GridLayer.prototype._draw = GridLayer.prototype.draw;
  GridLayer.prototype[PROP.showNumbers] = true;
  GridLayer.prototype[PROP.numbersGridContainer] = null;
  GridLayer.prototype[PROP.setShowNumbers] = function (status) {
    this[PROP.showNumbers] = status;
    this.draw();
  }
  GridLayer.prototype[PROP.toggleShowNumbers] = function () {
    this[PROP.setShowNumbers](!this[PROP.showNumbers])
  }
  
  GridLayer.prototype[PROP.getGridNumbersContainer] = function() {
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
    return textContainer;
  }

  GridLayer.prototype.draw = async function () {
    await this._draw();
    if (!this[PROP.showNumbers]) return this;
    if(this[PROP.numbersGridContainer]) {
      this.addChild(this[PROP.numbersGridContainer]);
      return this;
    }

    const textContainer = this[PROP.getGridNumbersContainer]();
    this.addChild(textContainer);
    Hooks.once('canvasReady', () => {
      requestAnimationFrame(() => {
        textContainer.cacheAsBitmap = true;
      })
    })
    this[PROP.numbersGridContainer] = textContainer;
    return this;
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

