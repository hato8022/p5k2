// shaders/line_extraction.frag (Improved Version)

precision mediump float;

varying vec2 vTexCoord;
uniform sampler2D tex0;
uniform vec2 resolution;

// 明るさ（輝度）を計算する関数
float luminance(vec3 color) {
  return dot(color, vec3(0.2126, 0.7152, 0.0722));
}

void main() {
  // 1ピクセル分のUV座標の大きさ
  vec2 onePixel = vec2(1.0) / resolution;

  // 周囲3x3ピクセルの明るさをサンプリング
  float c00 = luminance(texture2D(tex0, vTexCoord + onePixel * vec2(-1.0, -1.0)).rgb); // 左下
  float c10 = luminance(texture2D(tex0, vTexCoord + onePixel * vec2( 0.0, -1.0)).rgb); // 真下
  float c20 = luminance(texture2D(tex0, vTexCoord + onePixel * vec2( 1.0, -1.0)).rgb); // 右下
  
  float c01 = luminance(texture2D(tex0, vTexCoord + onePixel * vec2(-1.0,  0.0)).rgb); // 左
  // float c11 = luminance(texture2D(tex0, vTexCoord).rgb); // 中心(今回は使わない)
  float c21 = luminance(texture2D(tex0, vTexCoord + onePixel * vec2( 1.0,  0.0)).rgb); // 右
  
  float c02 = luminance(texture2D(tex0, vTexCoord + onePixel * vec2(-1.0,  1.0)).rgb); // 左上
  float c12 = luminance(texture2D(tex0, vTexCoord + onePixel * vec2( 0.0,  1.0)).rgb); // 真上
  float c22 = luminance(texture2D(tex0, vTexCoord + onePixel * vec2( 1.0,  1.0)).rgb); // 右上

  // ソーベルフィルタを適用して、横方向(gx)と縦方向(gy)の色の変化量を計算
  float gx = (c20 + 2.0 * c21 + c22) - (c00 + 2.0 * c01 + c02);
  float gy = (c02 + 2.0 * c12 + c22) - (c00 + 2.0 * c10 + c20);

  // エッジの強さを計算 (gxとgyのベクトルの長さ)
  float edgeStrength = sqrt(gx * gx + gy * gy);

  // ★★★ このしきい値(threshold)を調整すると、線の太さや量が変化します ★★★
  // 小さくすると線が増え、大きくすると線が減ります。
  float threshold = 0.2; 
  
  // `step`関数を使い、エッジの強さがしきい値を超えたら1.0(白)、それ以外は0.0(黒)にする
  float line = step(threshold, edgeStrength);

  // 線を黒、背景を白にするため、白黒反転させる
  gl_FragColor = vec4(vec3(1.0 - line), 1.0);
}