// shaders/distort.frag

precision mediump float;

varying vec2 vTexCoord;
uniform sampler2D tex0;
uniform float time; // 時間を受け取ってアニメーションさせる

void main() {
  // コピーしたUV座標を準備
  vec2 uv = vTexCoord;

  // sin波のパラメータ（これらの値を変えると歪み方が変わるよ！）
  float amplitude = 0.05; // 歪みの強さ（振幅）
  float frequency = 10.0; // 波の細かさ（周波数）

  // UV座標のx方向を、y座標と時間に応じてsin波でずらす
  uv.x += sin(uv.y * frequency + time) * amplitude;

  // 歪ませたUV座標を使って、元のテクスチャから色を取得
  gl_FragColor = texture2D(tex0, uv);
}