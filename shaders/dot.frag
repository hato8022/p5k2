// dot.frag
precision mediump float;

varying vec2 vTexCoord;

uniform sampler2D tex0;
uniform vec2 resolution;
uniform float dotSpacing; // ドットの間隔をp5.jsから受け取る

// 色の明るさ（輝度）を計算する関数
float luminance(vec4 color) {
    return dot(color.rgb, vec3(0.299, 0.587, 0.114));
}

void main() {
    // 画面をドットの間隔でグリッドに分割する
    vec2 step = vec2(dotSpacing) / resolution;

    // 現在のピクセルが属するグリッドの中心座標を計算
    vec2 gridCenter = floor(vTexCoord / step) * step + step * 0.5;

    // グリッドの中心にある元の画像の色と明るさを取得
    vec4 centerColor = texture2D(tex0, gridCenter);
    float brightness = luminance(centerColor);

    // ドットの半径を、明るさに応じて決定する (明るいほど半径が大きくなる)
    // step.x * 0.5 が半径の最大値
    float dotRadius = brightness * step.x * 0.75;

    // 現在のピクセルとグリッド中心との距離を計算
    float dist = length(vTexCoord - gridCenter);

    // 距離がドットの半径の内側ならドットの色(黒)、外側なら背景色(白)
    // smoothstepを使ってドットの境界を滑らかにする（アンチエイリアシング）
    float t = smoothstep(dotRadius - (step.x * 0.1), dotRadius, dist);

    vec4 dotColor = vec4(centerColor.rgb, 1.0); // ドットの色を元の色にする場合
    vec4 backgroundColor = vec4(1.0, 1.0, 1.0, 1.0); // 背景色（白）

    gl_FragColor = mix(dotColor, backgroundColor, t);
}
