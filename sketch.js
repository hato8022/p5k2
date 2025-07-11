// 各クラスインスタンスを格納するグローバル変数
let sd; // ShaderManager
let ac; // ActionManager
let ui; // UIManager
let binder; // UIBindingManager

// シェーダーオブジェクト
let monoShader, invertShader, pixelateShader, transerseWave, longitudinalWave,
    noiseTime, scanLine, grid, canvasBlur, dot;
let lineShader; // ★ 修正: p5.jsのline()関数との衝突を避けるため名前を変更

// 元画像
let sourceImage;
let sourceImageArray;

// オフスクリーンバッファ
let offscreenBuffer;

function preload() {
    // 各種シェーダーの読み込み (フォルダ構造を推奨)
    const vertShader = 'shaders/base.vert';
    monoShader = loadShader(vertShader, 'shaders/grayscale.frag');
    invertShader = loadShader(vertShader, 'shaders/invert.frag');
    pixelateShader = loadShader(vertShader, 'shaders/pixelate.frag');
    transerseWave = loadShader(vertShader, 'shaders/transerseWave.frag');
    longitudinalWave = loadShader(vertShader, 'shaders/longitudinalWave.frag');
    noiseTime = loadShader(vertShader, 'shaders/noiseTime.frag');
    scanLine = loadShader(vertShader, 'shaders/scanLine.frag');
    grid = loadShader(vertShader, 'shaders/grid.frag');
    canvasBlur = loadShader(vertShader, 'shaders/canvasBlur.frag');
    dot = loadShader(vertShader, 'shaders/dot.frag');
    // ★ 修正: 'lineShader' 変数に読み込む
    lineShader = loadShader(vertShader, 'shaders/line.frag');
    sourceImageArray = [loadImage('assets/sample.png'),null];
}

function setup() {
    //画面の設定
    createCanvas(windowHeight, windowHeight, WEBGL);
    offscreenBuffer = createGraphics(windowHeight, windowHeight, WEBGL);

    //各クラスの初期化
    sd = new ShaderManager(width, height, this);
    ac = new ActionManager(this);
    ui = new UIManager({
        origin: [20, 20],
        gridSize: 25,
        panelWidth: 400
    });
    binder = new UIBindingManager(sd, ui);

    //各種設定
    frameRate(30);
    noStroke();
    offscreenBuffer.noStroke();

    sd.addShader("canvasBlur", canvasBlur, "b");
    sd.addShader("dot", dot, "d");
    sd.addShader("grid", grid, "g");
    sd.addShader("invert", invertShader, "i");
    sd.addShader("line", lineShader, "l");
    sd.addShader("mono", monoShader, "m");
    sd.addShader("noiseT", noiseTime, "n");
    sd.addShader("pixel", pixelateShader, "p");
    sd.addShader("yoko", transerseWave, "q");
    sd.addShader("scanLine", scanLine, "s");
    sd.addShader("tate", longitudinalWave, "w");

    ac.addAction("circleline",() => {customCircle();},"1");

    sd.setUniform('dot', 'dotSpacing', 10.0);
    sd.setUniform('grid', 'division', 4);
    sourceImage = sourceImageArray[0];
    sd.setUniform('canvasBlur', 'blurSize', 4.0);

    ui.updateVisibility(sd.activeShaderNames);
}

function draw() {
    offscreenBuffer.background(0); 
    offscreenBuffer.image(sourceImage, -offscreenBuffer.width / 2, -offscreenBuffer.height / 2, offscreenBuffer.width, offscreenBuffer.height);
    ac.apply();
    const finalImage = sd.apply(offscreenBuffer);

    // --- メインキャンバスへの最終描画 ---
    background(0);
    texture(finalImage);
    plane(width, height);

 
    push(); // 現在の描画設定（3D視点など）を保存
    resetMatrix(); // 3Dの変形をリセットし、2D描画モードに戻す
    pop(); // 描画設定を元に戻す
}

function keyPressed() {
    sd.handleKeyPressed();
    ac.handleKeyPressed();
    ac.shot();
}

function customCircle() {
    let position = (frameCount * 4 % width)- width /2;
    offscreenBuffer.fill(255, 0, 0); // 色を指定しないと透明になる
    offscreenBuffer.noStroke();
    offscreenBuffer.circle(position, 0, 50);
    offscreenBuffer.circle(width/2-position, 0, 50);
    offscreenBuffer.circle(position, -50, 50);
    offscreenBuffer.circle(width/2-position, 50, 50);
    offscreenBuffer.circle(position, 350, 50);
    offscreenBuffer.circle(width/2-position, 350, 50);
}
