console.log("Hello World! This code runs immediately when the file is loaded.");
const logger = (...rest) => {
  console.log('MODULE: ', ...rest);
}

Hooks.on("init", function() {
  logger(`
  --------------
    This code runs once the Foundry VTT software begins its initialization workflow.
  --------------`);
});


const FALLBACK_TEXT_STYLE = {
  fontFamily : 'Arial',
  fontSize: 9,
  fill : 0xff1010,
  align : 'center',
}

// Agressive monkey patching
GridLayer.prototype._draw = GridLayer.prototype.draw;
GridLayer.prototype.draw = async function() {
    await this._draw();
    if(!this.grid) {
      console.warn(`MODULE: GRID-NUMBERS: No grid yet Can't draw numbers`);
      return;
    };
    const textContainer = new PIXI.Container({ name: "grid-numbers" });
    const { size, width, height } = this.grid.options.dimensions;
    const textStyle = CONFIG?.canvasTextStyle ?? FALLBACK_TEXT_STYLE;
    textStyle.fontSize = size / 4;

    let rows = Math.ceil(height / size);
    let cols = Math.ceil(width / size) + 1;
    for(let i = 1; i <= rows * cols; i++) {
      const position_y = Math.ceil(i / cols);
      const position_x = i - cols * Math.floor(i / cols);
      let text = new PIXI.Text(i,textStyle);
      const xOffset = text.width
      const yOffset = size
      text.x = position_x * size - xOffset;
      text.y = position_y * size - yOffset;
      textContainer.addChild(text)
    }
    this.addChild(textContainer);
    Hooks.once('canvasReady', () => {
      requestAnimationFrame(() => {
        textContainer.cacheAsBitmap = true;
      })
    })
    
}

function main() {
  // CONFIG.debug.hooks = true
}

Hooks.on("ready", function(data) {
  main()
});

// Hooks.on('renderApplication', data => {
// })
