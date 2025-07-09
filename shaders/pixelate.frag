// pixelate_average.frag
precision mediump float;

varying vec2 vTexCoord;
uniform sampler2D tex0;
uniform vec2 resolution;

void main() {
  float pixelSize = 10.0;
  float dx = pixelSize / resolution.x;
  float dy = pixelSize / resolution.y;

  // ブロックの左下の座標を計算
  vec2 corner = vec2(
    dx * floor(vTexCoord.x / dx),
    dy * floor(vTexCoord.y / dy)
  );

  // ブロックの四隅の色を取得
  vec4 c1 = texture2D(tex0, corner);                      // 左下
  vec4 c2 = texture2D(tex0, corner + vec2(dx, 0.0));      // 右下
  vec4 c3 = texture2D(tex0, corner + vec2(0.0, dy));      // 左上
  vec4 c4 = texture2D(tex0, corner + vec2(dx, dy));       // 右上

  // 4つの色を平均して出力
  gl_FragColor = (c1 + c2 + c3 + c4) / 4.0;
}