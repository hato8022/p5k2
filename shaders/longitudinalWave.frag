// shaders/somi.frag

precision mediump float;

varying vec2 vTexCoord;
uniform sampler2D tex0;
uniform float time;

void main() {
  vec2 uv = vTexCoord;

  // 粗密波のパラメータ
  float speed = 2.0;      // 波の進む速さ
  float frequency = 20.0; // 波の数
  float strength = 0.03;  // 歪みの強さ

  // UV座標のx方向を、x座標と時間に応じてsin波でずらす
  // これにより、x方向に「密」な部分と「疎」な部分の波ができる
  uv.y += sin(uv.x * frequency + time * speed) * strength;

  gl_FragColor = texture2D(tex0, uv);
}