let sd = {};
let shaderNum = 1;
let currentShader = 0;

function preload() {
  for (let i = 0; i < shaderNum; i++) {
    sd[i] = loadShader('shader.vert', 'shader' + i + '.frag');
  }
}

function setup() {
  createCanvas(600, 600, WEBGL);
  noStroke();
  shader(sd[0]); // このshaderを使う
  for (let i = 0; i < shaderNum; i++) {
    sd[i].setUniform("u_resolution", [width, height]); // 例：uniform送信
  }
}

function draw() {
  if (keyIsPressed) { keyCheck(); }

  for (let i = 0; i < shaderNum; i++) {
    sd[i].setUniform("u_time", millis() / 1000.0); // 例：uniform送信
  }
  rect(0, 0, width, height); // 画面全体に描画
}

function keyCheck() {

}
