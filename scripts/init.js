// TODO: Fix with hex
// TODO: Fix cache on options change

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

function patch() {
  const FALLBACK_TEXT_STYLE = {
    fontFamily: 'Arial',
    fontSize: 9,
    fill: 0xff1010,
    align: 'center',
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

  GridLayer.prototype[PROP.getGridNumbersContainer] = function () {
    const textContainer = new PIXI.Container({ name: "grid-numbers" });
    // Hext types refs https://www.redblobgames.com/grids/hexagons/#coordinates-offset
    /* Grid types list
      0: "SCENES.GridGridless"
      1: "SCENES.GridSquare"
      2: "SCENES.GridHexOddR"
      3: "SCENES.GridHexEvenR"
      4: "SCENES.GridHexOddQ"
      5: "SCENES.GridHexEvenQ"
    */
    const gridType = this.type;
    const isGridless = this.grid.isGridless;
    if (isGridless) return textContainer;
    const isHexGrid = this.isHex;
    const isHorizontalHex = isHexGrid && [2, 3].includes(gridType);
    const isVerticalHex = isHexGrid && [4, 5].includes(gridType);;

    const { size, width, height } = this.grid.options.dimensions;
    const cellW = this.grid.w;
    const cellH = this.grid.h; 
    const rowHeight = isHorizontalHex ? 1.5 * cellH / 2 : cellH;
    const colWidth =  isVerticalHex ? 1.5 * cellW / 2 : cellW;
    const textStyle = CONFIG?.canvasTextStyle ?? FALLBACK_TEXT_STYLE;
    textStyle.fontSize = size / 4;
    const rows = Math.ceil(height / rowHeight);
    const cols = Math.ceil(width / colWidth);

    const getTextWithCoords = (row, col) => {
      const orderNumber = String(cols * row + col + 1);
      const text = new PIXI.Text(orderNumber, textStyle);
      const [xP, yP] = this.grid.getPixelsFromGridPosition(row, col);
      text.x = xP;
      text.y = yP;
      return text;
    }

    const addHexCell = (row, col) => {
      const text = getTextWithCoords(row,col);
      text.x += cellW / 2 - text.width / 2;
      text.y += cellH / 2 - text.height / 2 - cellH / 4;
      textContainer.addChild(text);
    }

    const addSquareCell = (row, col) => {
      const text = getTextWithCoords(row,col);
      text.x += size - text.width; 
      textContainer.addChild(text)
    }

    for (let col = 0; col <= cols; col++) {
      for (let row = 0; row <= rows; row++) {
        isHexGrid ? addHexCell(row,col) : addSquareCell(row,col)
      }
    }
    return textContainer;
  }

  GridLayer.prototype.draw = async function () {
    await this._draw();
    if (!this[PROP.showNumbers]) return this;
    if (this[PROP.numbersGridContainer]) {
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

Hooks.on('ready', function () {
  const gridTypes = SceneConfig._getGridTypes();
  const currentGridType = gridTypes[canvas.grid.type];
  console.log(gridTypes, currentGridType)
})

Hooks.on("init", function () {
  patch();
  game.keybindings.register("grid-numbers", "showGridNumbers", {
    name: "Toggle grid numbers",
    hint: "Shows a number of each cell on a grid",
    editable: [{ key: "KeyN" }],
    onDown: () => {
      canvas.grid[PROP.toggleShowNumbers]?.()
    },
    restricted: false,
    precedence: CONST.KEYBINDING_PRECEDENCE.NORMAL
  })
})