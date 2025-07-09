// シェーダーオブジェクトを格納するグローバル変数
let sd;
let ui;
let binder;
// 元画像
let sourceImage;
let sourceImageArray;

// ピンポンするための2つの描画バッファ（作業台）
let bufferA, bufferB;
let canvs;
function preload() {
  const vertShader = 'shaders/base.vert';
  monoShader = loadShader(vertShader, 'shaders/grayscale.frag');
  invertShader = loadShader(vertShader, 'shaders/invert.frag');
  pixelateShader = loadShader(vertShader, 'shaders/pixelate.frag');
  transerseWave = loadShader(vertShader, 'shaders/transerseWave.frag');
  longitudinalWave = loadShader(vertShader, 'shaders/longitudinalWave.frag');
  noiseTime = loadShader(vertShader, 'shaders/noiseTime.frag');
  scanLine = loadShader(vertShader, 'shaders/scanLine.frag');
  line = loadShader(vertShader, 'shaders/line.frag');
  grid = loadShader(vertShader, 'shaders/grid.frag');
  canvasBlur = loadShader(vertShader, 'shaders/canvasBlur.frag');
  dot = loadShader(vertShader, 'shaders/dot.frag');
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
  sd.addShader("canvasBlur", canvasBlur, "b");
  sd.addShader("dot", dot, "d");
  sd.addShader("grid", grid, "g");
  sd.addShader("invert", invertShader, "i");
  sd.addShader("line", line, "l");
  sd.addShader("mono", monoShader, "m");
  sd.addShader("noiseT", noiseTime, "n");
  sd.addShader("pixel", pixelateShader, "p");
  sd.addShader("yoko", transerseWave, "q");
  sd.addShader("scanLine", scanLine, "s");
  sd.addShader("tate", longitudinalWave, "w");


  //以下は初期uniformの送信
  sd.setUniform('dot', 'dotSpacing', 10.0);
  sd.setUniform('grid', 'division', 4);
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
    const newGridDiv = int(map(mouseX, 0, width, 1, 20));
    sd.setUniform('grid','division',newGridDiv);
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
