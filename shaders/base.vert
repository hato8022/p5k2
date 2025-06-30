// shaders/base.vert (Final Version)

precision mediump float;

attribute vec3 aPosition;
attribute vec2 aTexCoord;

// p5.jsから渡される行列
uniform mat4 uProjectionMatrix;
uniform mat4 uModelViewMatrix;

varying vec2 vTexCoord;

void main() {
  // テクスチャ座標はそのまま渡します
  vTexCoord = aTexCoord;

  // p5.jsの行列を使って頂点位置を正しく計算します
  // これが最も安定し、綺麗な描画を生み出します
  gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);
}