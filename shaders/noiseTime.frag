// shaders/noise_distort.frag

precision mediump float;

varying vec2 vTexCoord;
uniform sampler2D tex0;
uniform float time; // 時間を受け取る

// 2Dベクトルからランダムな数値を生成する関数
float random (vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

void main() {
  // 元のUV座標をコピー
  vec2 uv = vTexCoord;

  // ノイズで歪ませるためのパラメータ
  float frequency = 0.001;  // ノイズの模様の細かさ
  float speed = 0.5;      // ノイズの変化する速さ
  float strength = 0.01;  // 歪みの強さ

  // 時間と共に変化するノイズ値を生成
  // uvにfrequencyを掛けることでノイズのスケールを調整
  float noiseValue = random(uv * frequency + vec2(time * speed));

  // ノイズ値を使ってUV座標をずらす
  // 0.5を引くことで、-0.5から0.5の範囲になり、上下左右に均等に歪む
  uv += (noiseValue - 0.5) * strength;

  // 歪ませたUV座標を使ってテクスチャから色を取得
  gl_FragColor = texture2D(tex0, uv);
}