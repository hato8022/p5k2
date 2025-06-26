class ManageShader {
    constructor(sdWidth, sdHeight) {
        this.validShaderDefinitions = [];
        this.shaderLayers = [];
        this.activeLayers = [];
        this.width = sdWidth;
        this.height = sdHeight;
    }

    defineValidShader(shaderDefArray) {
        this.validShaderDefinitions = [...shaderDefArray];
    }

    addValidShader(shaderDef) {
        this.validShaderDefinitions.push(shaderDef);
    }

    enableShader() {
        if (this.validShaderDefinitions.length === 0) {
            console.log("有効なshaderが存在していません。...");
            return;
        }
        for (const defKey of this.validShaderDefinitions) {
            // すでに読み込まれているかチェック
            const existingShaderIndex = this.shaderLayers.findIndex(s => s.keyName === defKey);
            if (existingShaderIndex === -1) { // まだ読み込まれていない場合のみ追加
                const newLayer = {
                    layer: createGraphics(this.width, this.height, WEBGL),
                    shader: loadShader('shader.vert', 'shader' + defKey + '.frag'),
                    keyName: defKey,
                    count: 0,
                    sdTime: 0
                };
                //newLayer.layer.shader(newShader);
                this.shaderLayers.push(newLayer);
            }
        }
    }

    incrementShaderCount(targetKey) {
        const index = this.shaderLayers.findIndex(s => s.keyName === targetKey);
        if (index !== -1) {
            this.shaderLayers[index].count += 1;
            this.resetActiveLayers();
        } else {
            console.warn(`Warning: Shader with key '${targetKey}' not found.`);
        }
    }

    incrementShaderSdTime() {
        for (let i = 0; i < this.shaderLayers.length; i++) {
            const BOOLVALUE = this.shaderLayers[i].count & 1;
            if (BOOLVALUE === 1) {
                this.shaderLayers[i].sdTime += 1;
            }
        }
    }

    resetActiveLayers() {
        for (let i = 0; i < this.activeLayers.length; i++) {
            this.activeLayers[i].layer.noShader();
        }
        let tempLayers = [];
        this.activeLayers = [];

        for (let i = 0; i < this.shaderLayers.length; i++) {
            const BOOLVALUE = this.shaderLayers[i].count & 1;
            if (BOOLVALUE === 1) {
                tempLayers.push(this.shaderLayers[i]);
            }
            else if (BOOLVALUE === 0) {
                this.shaderLayers[i].sdTime = 0;
            }
        }
        tempLayers.sort((a, b) => b.sdTime - a.sdTime);
        // ソートされた順に activeLayers に追加
        for (let i = 0; i < tempLayers.length; i++) {
            this.activeLayers.push(tempLayers[i]);
            this.activeLayers[i].layer.shader(this.activeLayers[i].shader);
        }
    }

    send2ShaderUniform(targetKey, uniformName, value) {
        const index = this.shaderLayers.findIndex(s => s.keyName === targetKey);
        if (index !== -1) {
            this.shaderLayers[index].shader.setUniform(uniformName, value);
        } else {
            console.warn(`Warning: Shader with key '${targetKey}' not found. Could not set uniform.`);
        }
    }

    send2ShaderUniformAll(uniformName, value) {
        for (let i = 0; i < this.shaderLayers.length; i++) {
            this.shaderLayers[i].shader.setUniform(uniformName, value);
        }
    }

    send2ShaderUniformActive(uniformName, value) {
        for (let i = 0; i < this.activeLayers.length; i++) {
            this.activeLayers[i].shader.setUniform(uniformName, value);
        }
    }

    renderAllLayers(mainCanvas) {
        let prevLayerOutput = null; // または初期テクスチャ

        for (const layerInfo of this.activeLayers) {
            // シェーダーに前のレイヤーの出力をテクスチャとして渡す
            if (prevLayerOutput) {
                layerInfo.shader.setUniform('u_tex0', prevLayerOutput);
            }
            // 現在のレイヤーにシェーダーを適用して描画
            layerInfo.layer.shader(layerInfo.shader);
            layerInfo.layer.rect(0, 0, this.width, this.height); // シェーダーを適用するための描画
            // 現在のレイヤーの出力を次のレイヤーの入力として設定
            prevLayerOutput = layerInfo.layer; // 次のシェーダーのためのテクスチャとして使う
        }

        // 最終的なactiveLayersをメインキャンバスに描画
        // ここでブレンドモードやアルファも考慮する
        for (const layerInfo of this.activeLayers) {
            mainCanvas.push();
            mainCanvas.blendMode(layerInfo.blendMode || BLEND);
            mainCanvas.tint(255, layerInfo.alpha || 255);
            mainCanvas.image(layerInfo.layer, 0, 0);
            mainCanvas.pop();
        }
    } 
}