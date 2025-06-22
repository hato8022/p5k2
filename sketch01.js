let shaderNum = 1;
let shader = [];
let currentKey = [];
let layerNum = 2;
let shaderLayer = [];
let shaderSwitch = new Array(10);

function preload() {
    // 外部ファイルをロード
    for (let i = 0; i < shaderNum; i++) {
        shader[i] = loadShader('shader.vert', 'shader' + i + '.frag');
    }
    for (let i = 0; i < shaderSwitch.length; i++) {
        shaderSwitch[i] = { count: 0 }
    }
}

function setup() {
    createCanvas(500, 500, WEBGL);
    noStroke();
    for (let i = 0; i < layerNum; i++) {
        shaderLayer[i] = createGraphics(width, height, WEBGL);
    }
}

function draw() {
    if (currentKey.length === 0) {
        background(0);
        return;
    }

    for (let i = 0; i < currentKey.length; i++) {
        currentKey[i].keyTime++;
        let currentShader = shader[currentKey[i].keyNum];
        shaderLayer[i].shader(currentShader);
        currentShader.setUniform("u_time", millis() / 1000.0);
        currentShader.setUniform("u_resolution", [width, height]);

        createPolygonOnScreen(i);


    }
    for (let i = 0; i < currentKey.length; i++) {
        image(shaderLayer[i], -width / 2, -height / 2);
    }
}

function keyPressed() {
    let index = currentKey.findIndex(currentKey => currentKey.keyNum === int(key));
    shaderSwitch[index].count += 1;
}

function keyReleased() {

}

function createPolygonOnScreen(i) {
    shaderLayer[i].beginShape(TRIANGLES);
    shaderLayer[i].vertex(-1, 1, 0);
    shaderLayer[i].vertex(1, 1, 0);
    shaderLayer[i].vertex(-1, -1, 0);

    shaderLayer[i].vertex(-1, -1, 0);
    shaderLayer[i].vertex(1, 1, 0);
    shaderLayer[i].vertex(1, -1, 0);
    shaderLayer[i].endShape();
}