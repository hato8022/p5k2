// シェーダーオブジェクトを格納するグローバル変数
let grayscaleShader, invertShader, pixelateShader;
let sd;

// 元画像
let sourceImage;

// ピンポンするための2つの描画バッファ（作業台）
let bufferA, bufferB;

function preload() {
    // 必要なシェーダーと画像をロード
    grayscaleShader = loadShader('base.vert', 'grayscale.frag');
    invertShader = loadShader('base.vert', 'invert.frag');
    pixelateShader = loadShader('base.vert', 'pixelate.frag');
    transerseWave = loadShader('base.vert', 'transerseWave.frag');
    longitudinalWave = loadShader('base.vert', 'longitudinalWave.frag');
    noiseTime = loadShader('base.vert', 'noiseTime.frag');
    scanLine = loadShader('base.vert', 'scanLine.frag');
    line = loadShader('base.vert', 'line.frag');
    grid = loadShader('base.vert', 'grid.frag');
    sourceImage = loadImage('assets/sample.png');
}

function setup() {
    // メインキャンバスをWEBGLモードで作成
    frameRate(10);
    createCanvas(windowWidth, windowHeight, WEBGL);
    sd = new ShaderManager(width, height, this);
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

    // 2つの作業台をWEBGLモードで作成

}

function draw() {
    // メインキャンバスの背景は毎フレーム黒でクリア
    background(0);
    /* if (shaderManager.activeShaderNames.includes(SHADER_NAME.grid)) {
      // 横に4分割、縦に3分割する場合
      const divisions = [4.0, 3.0];
  
      const shaderInfo = shaderManager.shaderRegistry.get(SHADER_NAME.grid);
      shaderInfo.shaderCopies.forEach(s => s.setUniform('divisions', divisions));
    } */

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