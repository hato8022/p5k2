class ShaderManager {
    constructor(width, height, p5Instance) {
        this.p5 = p5Instance || window;
        this.shaderRegistry = new Map();
        this.activeShaderNames = [];
        this.onActiveChangeCallback = null;
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
            uniforms: new Map(),
            activeTime: 0 // ★ 変更点: activeTimeプロパティを初期化
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
        if (this.activeShaderNames.includes(shaderName)) {
            const shaderInfo = this.shaderRegistry.get(shaderName);
            if (shaderInfo) {
                shaderInfo.uniforms.set(uniformName, value);
            } else {
                console.warn(`Shader "${shaderName}" not found.`);
            }
        }
    }

    handleKeyPressed() {
        const pressedKey = this.p5.key.toLowerCase();
        let changed = false;

        for (const [shaderName, shaderInfo] of this.shaderRegistry.entries()) {
            if (shaderInfo.toggleKey === pressedKey) {
                const isActive = this.activeShaderNames.includes(shaderName);
                if (isActive) {
                    shaderInfo.activeTime = 0; // ★ 変更点: 無効化時にactiveTimeをリセット
                    this.activeShaderNames = this.activeShaderNames.filter(name => name !== shaderName);
                } else {
                    this.activeShaderNames.push(shaderName);
                }
                changed = true;
                console.log("Active shaders:", this.activeShaderNames);
                break;
            }
        }

        if (changed && this.onActiveChangeCallback) {
            this.onActiveChangeCallback(this.activeShaderNames);
        }
    }

    apply(sourceImage) {
        if (this.activeShaderNames.length === 0) {
            return sourceImage;
        }

        let readBuffer = sourceImage;
        let writeBuffer;

        for (let i = 0; i < this.activeShaderNames.length; i++) {
            writeBuffer = this.pingPongBuffers[i % 2];

            const shaderName = this.activeShaderNames[i];
            const shaderInfo = this.shaderRegistry.get(shaderName);

            // shaderInfoが存在しない場合を考慮
            if (!shaderInfo) continue;

            // ★ 変更点: activeTimeを毎フレーム加算
            shaderInfo.activeTime++;

            const shaderToUse = (writeBuffer === this.pingPongBuffers[0]) ? shaderInfo.shaderCopies[0] : shaderInfo.shaderCopies[1];

            writeBuffer.shader(shaderToUse);

            shaderToUse.setUniform('tex0', readBuffer);
            shaderToUse.setUniform('resolution', [writeBuffer.width, writeBuffer.height]);
            shaderToUse.setUniform('time', this.p5.millis() / 1000.0);

            // ★ 変更点: activeTimeをuniformとして送信
            shaderToUse.setUniform('activeTime', shaderInfo.activeTime);

            for (const [name, value] of shaderInfo.uniforms.entries()) {
                shaderToUse.setUniform(name, value);
            }

            writeBuffer.clear();
            writeBuffer.rect(-writeBuffer.width / 2, -writeBuffer.height / 2, writeBuffer.width, writeBuffer.height);

            readBuffer = writeBuffer;
        }

        return readBuffer;
    }
}