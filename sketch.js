// シェーダーオブジェクトを格納するグローバル変数
let sd;
let ui;
let binder;
// 元画像
let sourceImage;
let sourceImageArray;

// ピンポンするための2つの描画バッファ（作業台）
let bufferA, bufferB;
//これをメインキャンバスとして扱うザマス！！
let canvas;

function preload() {
  const vertShader = 'shaders/base.vert';
  grayscaleShader = loadShader(vertShader, 'shaders/grayscale.frag');
  invertShader = loadShader(vertShader, 'shaders/invert.frag');
  pixelateShader = loadShader(vertShader, 'shaders/pixelate.frag');
  transerseWave = loadShader(vertShader, 'shaders/transerseWave.frag');
  longitudinalWave = loadShader(vertShader, 'shaders/longitudinalWave.frag');
  noiseTime = loadShader(vertShader, 'shaders/noiseTime.frag');
  scanLine = loadShader(vertShader, 'shaders/scanLine.frag');
  line = loadShader(vertShader, 'shaders/line.frag');
  grid = loadShader(vertShader, 'shaders/grid.frag');
  canvasBlur = loadShader(vertShader, 'shaders/canvasBlur.frag');
  sourceImageArray = [loadImage('assets/sample.png')];
}

function setup() {
  frameRate(30);
  createCanvas(windowHeight, windowHeight, WEBGL);
  canvas = createGraphics(windowHeight, windowHeight, WEBGL);
  sd = new ShaderManager(height, height, this);

  ui = new UIManager({
    origin: [20, 20],
    gridSize: 25,
    panelWidth: 400
  });

  binder = new UIBindingManager(sd, ui);

  noStroke();
  sd.addShader("gray", grayscaleShader, "0");
  sd.addShader("invert", invertShader, "1");
  sd.addShader("pixel", pixelateShader, "2");
  sd.addShader("yoko", transerseWave, "3");
  sd.addShader("tate", longitudinalWave, "4");
  sd.addShader("noiseT", noiseTime, "5");
  sd.addShader("scanLine", scanLine, "6");
  sd.addShader("line", line, "7");
  sd.addShader("grid", grid, "8");
  sd.addShader("canvasBlur", canvasBlur, "9");

  //以下は初期uniformの送信
  sd.setUniform('grid', 'divisions', [4.0, 3.0]);
  sourceImage = sourceImageArray[0];
  sd.setUniform('canvasBlur', 'blurSize', 4.0);

  //GridShaderについてのuniform
  binder.addGroup('Grid Shader (toggle: 1)', 'grid');
  binder.createBinding('grid', 'inputSlider', 'division', { label: '分割数', iniVal: 4.0, minVal: 1.0, maxVal: 50.0, step: 1 });


  sd.onActiveShadersChange(ui.updateVisibility.bind(ui));

  // 5. UIの初期状態（すべて非表示）を設定します。
  ui.updateVisibility(sd.activeShaderNames);
}

function draw() {
  if (!mouseIsPressed) {
    // 1. 'divisions' を操作するUI要素のインスタンスを取得
    const gridDivSlider = binder.getElement('division');
    if (gridDivSlider) {
      const newGridDiv = int(map(mouseX, 0, width, 1, 20));
      gridDivSlider.setValue(newGridDiv);
    }
  }

  background(0);
  ui.handleDrag();
  canvas.image(sourceImage, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
  canvas.circle(0, 0, 50);
  const finalImage = sd.apply(canvas);

  texture(finalImage); // メインキャンバスに、最終結果のテクスチャをセット
  plane(width, height); // 全面に表示
}

function keyPressed() {
  sd.handleKeyPressed();

}
