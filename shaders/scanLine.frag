// shaders/scanline.frag

precision mediump float;

varying vec2 vTexCoord;
uniform sampler2D tex0;
uniform vec2 resolution; // 画面の解像度を受け取る

void main() {
  // 元のテクスチャから色を取得
  vec4 color = texture2D(tex0, vTexCoord);

  // 走査線のパラメータ
  float lineFrequency = resolution.y / 0.8; // 線の密度
  float lineStrength = 0.55; // 線の暗さ (1.0に近づくほど薄くなる)

  // sin波を使い、滑らかな縞模様を生成
  float scanLine = sin(vTexCoord.y * lineFrequency);

  // sin波を0から1の範囲に変換し、線の暗さを調整
  scanLine = (scanLine + 1.0) / 2.0;
  scanLine = mix(lineStrength, 1.0, scanLine);

  // 元の色に走査線の暗さを掛け合わせる
  color.rgb *= scanLine;
  
  gl_FragColor = color;
}