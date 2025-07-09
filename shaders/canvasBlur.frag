precision highp float;

varying vec2 vTexCoord;

uniform sampler2D tex0;
uniform vec2 resolution;
uniform float blurSize; // ぼかしの広がり具合を調整する係数。1.0前後を基準に調整。

// サンプリングする半径を固定値にする。
// この値を大きくすると高品質になるが、重くなる。5程度がバランスが良い。
const int KERNEL_RADIUS = 6;

void main() {
    // 1ピクセル分のテクスチャ座標の大きさを計算
    vec2 onePixel = vec2(1.0, 1.0) / resolution;
    
    vec4 sum = vec4(0.0);
    float totalWeight = 0.0;

    // KERNEL_RADIUSで定義された固定範囲でループ
    for (int x = -KERNEL_RADIUS; x <= KERNEL_RADIUS; x++) {
        for (int y = -KERNEL_RADIUS; y <= KERNEL_RADIUS; y++) {
            
            // サンプリングする座標のオフセットを計算
            // blurSizeは、ここでサンプリング間隔の調整に使う
            vec2 offset = vec2(x, y) * blurSize;
            
            // 中心からの距離を計算
            float dist = length(offset);
            
            // 重みを計算。中心に近いほど1.0に、遠いほど0.0に近づく。
            // 厳密なガウス関数より軽量なsmoothstep関数を使用。
            float weight = 1.0 - smoothstep(0.0, float(KERNEL_RADIUS), dist);

            // サンプリングした色に重みを掛けて加算
            sum += texture2D(tex0, vTexCoord + offset * onePixel) * weight;
            
            // 重みの合計を記録
            totalWeight += weight;
        }
    }

    // 重みの合計が0になる稀なケースを避ける
    if (totalWeight > 0.0) {
        // 合計を全体の重みで割って、正規化された色を求める
        gl_FragColor = sum / totalWeight;
    } else {
        // 万が一重みが0なら、元の色をそのまま出力
        gl_FragColor = texture2D(tex0, vTexCoord);
    }
}
