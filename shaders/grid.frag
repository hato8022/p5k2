// shaders/grid.frag

precision mediump float;

varying vec2 vTexCoord;
uniform sampler2D tex0;

// sketch.jsから分割数を指定するための変数
/* uniform vec2 divisions; */

void main() {
    // 元のUV座標をコピー
    vec2 uv = vTexCoord;
    vec2 grid = vec2(3,4);
    // UV座標を分割数倍し、小数部分だけを取り出すことで、
    // UV座標が 0.0 ~ 1.0 の範囲で繰り返されるようになる
    vec2 tileUV = fract(uv * grid);

    // 繰り返されるタイル内のUV座標を使って、テクスチャから色を取得
    vec4 imageColor = texture2D(tex0, tileUV);

    // タイル間の境界線（ボーダー）を描画する処理
    float borderWidth = 0.0; // ボーダーの太さ (0.0 ~ 1.0)
    vec3 borderColor = vec3(0.0); // ボーダーの色（黒）

    // 現在のピクセルがボーダー領域にあるかどうかを判定
    // any()は、ベクトルの成分のいずれかがtrueの場合にtrueを返す
    // lessThan()は、第1引数の各成分が第2引数の各成分より小さい場合にtrueを返す
    if (any(lessThan(tileUV, vec2(borderWidth))) || any(lessThan(vec2(1.0 - borderWidth), tileUV))) {
        gl_FragColor = vec4(borderColor, 1.0);
    } else {
        gl_FragColor = imageColor;
    }
}