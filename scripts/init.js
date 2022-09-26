function isV9OrLater() {
  return game.release?.generation ?? 0 >= 9;
}


class GridNumbersLayer extends CanvasLayer {

  constructor() {
    super();
    this.showNumbers = false;
    this.numbersGridContainer = null;

    Hooks.on('updateScene', () => {
      this.numbersGridContainer = null;
    })
  }

  /**
   * Weather to show numbers
   * @type {boolean}
  */
  showNumbers;

  /**
   * Cached container with numbers
   * @type {PIXI.Container}
  */
  numbersGridContainer;

  /**
   * Cached container with numbers
   * @return {GridLayer}
  */
  getGridLayer() {
    return canvas.grid;
  }

  /**
   * Get container with drawn numbers
   * @return {PIXI.Container}
  */
  getGridNumbersContainer() {
    const textContainer = new PIXI.Container({ name: "grid-numbers" });
    const gridLayer = this.getGridLayer();

    // Nothing to draw if there is no grid layer.
    if (!gridLayer?.grid) return;

    const gridType = gridLayer.type;
    const isHexGrid = gridLayer.isHex;
    /*
      There are even and odd lines in hex grid.
      Added size of even and odd lines combined is 1 + 0.5 = 1.5
      Then size of one row is 1.5 / 2
      More info here https://redblobgames.com/grids/hexagons/#size-and-spacing
    */
    const HEX_ROW_SIZE_MULTIPLIER = 1.5 / 2;

    /* Grid types list
      0: "SCENES.GridGridless"
      1: "SCENES.GridSquare"
      2: "SCENES.GridHexOddR"
      3: "SCENES.GridHexEvenR"
      4: "SCENES.GridHexOddQ"
      5: "SCENES.GridHexEvenQ"
    */
    /* Hex grid types refs https://www.redblobgames.com/grids/hexagons/#coordinates-offset */
    const isHorizontalHex = isHexGrid && [2, 3].includes(gridType);
    const isVerticalHex = isHexGrid && [4, 5].includes(gridType);;

    const { size, width, height } = gridLayer.grid.options.dimensions;
    const cellW = gridLayer.grid.w;
    const cellH = gridLayer.grid.h;
    const rowHeight = isHorizontalHex ? cellH * HEX_ROW_SIZE_MULTIPLIER : cellH;
    const colWidth = isVerticalHex ? cellW * HEX_ROW_SIZE_MULTIPLIER : cellW;
    const rows = Math.ceil(height / rowHeight);
    const cols = Math.ceil(width / colWidth);

    const getTextWithCoords = (row, col) => {
      const orderNumber = String(cols * row + col + 1);
      const text = new PIXI.BitmapText(orderNumber, { fontName: 'GridNumbersFont', fontSize: size / 4 });
      const [xP, yP] = gridLayer.grid.getPixelsFromGridPosition(row, col);
      text.x = xP;
      text.y = yP;
      return text;
    }

    const addHexCell = (row, col) => {
      const text = getTextWithCoords(row, col);
      text.x += cellW / 2 - text.width / 2;
      text.y += cellH / 2 - text.height / 2 - cellH / 4;
      textContainer.addChild(text);
    }

    const addSquareCell = (row, col) => {
      const text = getTextWithCoords(row, col);
      text.x += size - text.width;
      textContainer.addChild(text)
    }

    for (let col = 0; col <= cols; col++) {
      for (let row = 0; row <= rows; row++) {
        isHexGrid ? addHexCell(row, col) : addSquareCell(row, col)
      }
    }
    return textContainer;
  }

  setShowNumbers(status) {
    this.showNumbers = status;
    this._draw();
  }

  toggleShowNumbers() {
    this.setShowNumbers(!this.showNumbers)
  }

  addGrid() {
    this.addChild(this.numbersGridContainer)
  }
  removeGrid() {
    this.removeChild(this.numbersGridContainer)
  }

  draw() {
    return this._draw();
  }

  /** @override */
  async _draw() {
    if(!this.showNumbers) {
      if(this.numbersGridContainer) {
        this.removeGrid();
      }
    }
    if(this.showNumbers) {
      if(this.numbersGridContainer) {
        this.removeGrid();
        this.addGrid();
      } else {
        this.numbersGridContainer = this.getGridNumbersContainer();
        this.addGrid();
      }
    }
    return this;
  
  }

  /** @override */
  async tearDown() {
    await super.tearDown();
    this.numbersGridContainer = null;
    /**
    * FIXME:
    * Now we have a problem where GridNumbers layer can't
    * automatically update after changing grind settings or any other tearDown
    * beauce it doesn't know the Grid's properties in drawing time. 
    * So we handle this by disabling the grid after each grid change. 
    * This shold not happen frequently so its fine for now. 
    * But should be fixed in future
    **/
    this.showNumbers = false;
    return this;
  }

  /**
   * Layer options
   * @type {CanvasLayerOptions}
  */
  static get layerOptions() {
    return foundry.utils.mergeObject(super.layerOptions, {
      name: 'GridNumbers',
      zIndex: 1001,
      sortActiveTop: false
    });
  }
}

Hooks.on("init", function () {
  PIXI.BitmapFont.from("GridNumbersFont", { ...CONFIG.canvasTextStyle, fontFamily: 'Arial' }, { chars: PIXI.BitmapFont.NUMERIC });
  CONFIG.Canvas.layers.gridNumbers = isV9OrLater() ? { layerClass: GridNumbersLayer, group: "primary" } : GridNumbersLayer;
  game.keybindings.register("grid-numbers", "showGridNumbers", {
    name: "Toggle grid numbers",
    hint: "Shows a number of each cell on a grid",
    editable: [{ key: "KeyN" }],
    onDown: () => {
      const gridCanvasLayer = canvas.layers.find((layer) => layer.name === "GridNumbersLayer")
      gridCanvasLayer.toggleShowNumbers();
    },
    restricted: false,
    precedence: CONST.KEYBINDING_PRECEDENCE.NORMAL
  })
})
