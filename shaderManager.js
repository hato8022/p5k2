class ShaderManager {
    constructor(width, height, p5Instance) {
        this.p5 = p5Instance || window;
        this.shaderRegistry = new Map();
        this.activeShaderNames = [];
        this.pingPongBuffers = [
            this.p5.createGraphics(width, height, this.p5.WEBGL),
            this.p5.createGraphics(width, height, this.p5.WEBGL)
        ];
        this.pingPongBuffers.forEach(buffer => {
            buffer.noStroke();
        });
    }
    onActiveShadersChange(callback) {
        this.onActiveChangeCallback = callback;
    }
    addShader(shaderName, originalShader, toggleKey) {
        this.shaderRegistry.set(shaderName, {
            toggleKey: toggleKey.toLowerCase(),
            shaderCopies: [
                originalShader.copyToContext(this.pingPongBuffers[0]),
                originalShader.copyToContext(this.pingPongBuffers[1])
            ],
            uniforms: new Map()
        });
    }

    setUniform(shaderName, uniformName, value) {
        const shaderInfo = this.shaderRegistry.get(shaderName);
        if (shaderInfo) {
            shaderInfo.uniforms.set(uniformName, value);
        } else {
            console.warn(`Shader "${shaderName}" not found. Could not set uniform.`);
        }
    }

    updateUniform(shaderName, uniformName, value) {
        //this.activeShaderNamesに送り先のsahderNameが存在しているかどうかを確認。
        if (this.activeShaderNames.includes(shaderName)) {
            const shaderInfo = this.shaderRegistry.get(shaderName);
            if (shaderInfo) {
                // mapでuniformNameを確実に入れ替える
                shaderInfo.uniforms.set(uniformName, value);
            } else {
                console.warn(`Shader "${shaderName}" not found.`);
            }
        }
    }
    handleKeyPressed() {
        const pressedKey = this.p5.key.toLowerCase();
        let changed = false; // ★変更があったかどうかのフラグ

        for (const [shaderName, shaderInfo] of this.shaderRegistry.entries()) {
            if (shaderInfo.toggleKey === pressedKey) {
                const isActive = this.activeShaderNames.includes(shaderName);
                if (isActive) {
                    this.activeShaderNames = this.activeShaderNames.filter(name => name !== shaderName);
                } else {
                    this.activeShaderNames.push(shaderName);
                }
                changed = true; // ★変更があったことを記録
                console.log("Active shaders:", this.activeShaderNames);
                break;
            }
        }

        // ★変更があった場合のみ、登録されたコールバック関数を呼び出す
        if (changed && this.onActiveChangeCallback) {
            this.onActiveChangeCallback(this.activeShaderNames);
        }
    }

    // ★★★ ロジックをシンプルにしたapplyメソッド ★★★
    apply(sourceImage) {
        if (this.activeShaderNames.length === 0) {
            return sourceImage;
        }

        let readBuffer = sourceImage; // 最初の入力は元の画像
        let writeBuffer;

        for (let i = 0; i < this.activeShaderNames.length; i++) {
            // 書き込み先バッファを交互に決定 (0 -> 1 -> 0 -> ...)
            writeBuffer = this.pingPongBuffers[i % 2];

            const shaderName = this.activeShaderNames[i];
            const shaderInfo = this.shaderRegistry.get(shaderName);
            const shaderToUse = (writeBuffer === this.pingPongBuffers[0]) ? shaderInfo.shaderCopies[0] : shaderInfo.shaderCopies[1];

            writeBuffer.shader(shaderToUse);

            // 共通のuniformを設定
            shaderToUse.setUniform('tex0', readBuffer);
            shaderToUse.setUniform('resolution', [writeBuffer.width, writeBuffer.height]);
            shaderToUse.setUniform('time', this.p5.millis() / 1000.0);

            //shader固有のuniformを送信
            for (const [name, value] of shaderInfo.uniforms.entries()) {
                shaderToUse.setUniform(name, value);
            }
            writeBuffer.clear();
            writeBuffer.rect(-writeBuffer.width / 2, -writeBuffer.height / 2, writeBuffer.width, writeBuffer.height);

            // 次のループのために、今書き込んだバッファが読み込み元になる
            readBuffer = writeBuffer;
        }

        // 最後に書き込まれたバッファ（=最後のreadBuffer）を返す
        return readBuffer;
    }
}