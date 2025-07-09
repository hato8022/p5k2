class ShaderManager {

    constructor(width, height, p5Instance) {
        this.p5 = p5Instance || window;
        this.shaderRegistry = new Map();
        this.activeShaderNames = [];

        // ピンポンバッファの作成
        this.pingPongBuffers = [
            this.p5.createGraphics(width, height, this.p5.WEBGL),
            this.p5.createGraphics(width, height, this.p5.WEBGL)
        ];

        // 各バッファの初期設定
        // 描画モードの指定は削除し、デフォルトのCORNERモードで動作させる
        this.pingPongBuffers.forEach(buffer => {
            buffer.noStroke();
            buffer.imageMode(CENTER);
            buffer.rectMode(CENTER);
        });
    }

    addShader(shaderName, originalShader, toggleKey) {
        this.shaderRegistry.set(shaderName, {
            toggleKey: toggleKey.toLowerCase(),
            // 2つのバッファコンテキストに対応するシェーダーのコピーを作成
            shaderCopies: [
                originalShader.copyToContext(this.pingPongBuffers[0]),
                originalShader.copyToContext(this.pingPongBuffers[1])
            ]
        });
    }

    uniform2Shader(shaderNmae, uniformName, toggleKey) {
        this.shaderRegistry
    }

    handleKeyPressed() {
        const pressedKey = this.p5.key.toLowerCase();
        for (const [shaderName, shaderInfo] of this.shaderRegistry.entries()) {
            if (shaderInfo.toggleKey === pressedKey) {
                // アクティブリストに存在するかどうかで状態を切り替える
                const isActive = this.activeShaderNames.includes(shaderName);

                if (isActive) {
                    // OFFにする: リストから除外
                    this.activeShaderNames = this.activeShaderNames.filter(name => name !== shaderName);
                } else {
                    // ONにする: リストの末尾に追加
                    this.activeShaderNames.push(shaderName);
                }
                break;
            }
        }
    }

    apply(sourceImage) {
        // 有効なシェーダーがなければ、元の画像をそのまま返す
        if (this.activeShaderNames.length === 0) {
            return sourceImage;
        }

        let readBuffer;
        let writeBuffer = this.pingPongBuffers[0]; // 最初の書き込み先

        // 最初のシェーダーを適用
        const firstShaderName = this.activeShaderNames[0];
        const firstShaderInfo = this.shaderRegistry.get(firstShaderName);
        const firstShaderToUse = firstShaderInfo.shaderCopies[0]; // writeBuffer(0)に対応するシェーダー

        writeBuffer.shader(firstShaderToUse);
        firstShaderToUse.setUniform('tex0', sourceImage); // 最初の入力はsourceImage
        firstShaderToUse.setUniform('resolution', [writeBuffer.width, writeBuffer.height]);
        firstShaderToUse.setUniform('time', this.p5.millis() / 1000.0);
        writeBuffer.rect(0, 0, writeBuffer.width, writeBuffer.height);

        // 2つ目以降のシェーダーを順番に適用
        for (let i = 1; i < this.activeShaderNames.length; i++) {
            // ピンポン: 読み込み元と書き込み先を交換
            readBuffer = this.pingPongBuffers[(i - 1) % 2];
            writeBuffer = this.pingPongBuffers[i % 2];

            const shaderName = this.activeShaderNames[i];
            const shaderInfo = this.shaderRegistry.get(shaderName);
            // 現在のwriteBufferに対応するシェーダーを選択
            const shaderToUse = (writeBuffer === this.pingPongBuffers[0]) ? shaderInfo.shaderCopies[0] : shaderInfo.shaderCopies[1];

            writeBuffer.shader(shaderToUse);
            shaderToUse.setUniform('tex0', readBuffer); // 直前の結果をテクスチャとして渡す
            shaderToUse.setUniform('resolution', [writeBuffer.width, writeBuffer.height]);
            shaderToUse.setUniform('time', this.p5.millis() / 1000.0);
            writeBuffer.rect(0, 0, writeBuffer.width, writeBuffer.height);
        }

        // 最後の書き込みが行われたバッファを返す
        return writeBuffer;
    }
}
