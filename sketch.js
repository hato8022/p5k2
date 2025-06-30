// シェーダーオブジェクトを格納するグローバル変数
let grayscaleShader, invertShader, pixelateShader;
let sd;

// 元画像
let sourceImage;

// ピンポンするための2つの描画バッファ（作業台）
let bufferA, bufferB;

function preload() {
  // 必要なシェーダーと画像をロード
  grayscaleShader = loadShader('shaders/base.vert', 'shaders/grayscale.frag');
  invertShader = loadShader('shaders/base.vert', 'shaders/invert.frag');
  pixelateShader = loadShader('shaders/base.vert', 'shaders/pixelate.frag');
  sourceImage = loadImage('assets/sample.jpg');
}

function setup() {
  // メインキャンバスをWEBGLモードで作成
  frameRate(10);
  createCanvas(600, 400, WEBGL);
  sd = new ShaderManager(width, height, this);
  noStroke();
  sd.addShader("gray", grayscaleShader, "G");
  sd.addShader("invert", invertShader, "I");
  sd.addShader("pixel", pixelateShader, "P");

  // 2つの作業台をWEBGLモードで作成

}

function draw() {
  // メインキャンバスの背景は毎フレーム黒でクリア
  background(0);

  const finalImage = sd.apply(sourceImage);


  // --- 最終的な表示 ---
  // 全ての処理が終わった最終結果は「bufferA」に入っている
  texture(finalImage); // メインキャンバスに、最終結果のテクスチャをセット
  // 上下反転を補正
  plane(width, height); // 全面に表示
}

function keyPressed() {
  sd.handleKeyPressed();
}