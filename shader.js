class ManageShader {
    constructor(sdWidth, sdHeight) {
        this.validShaderDefinitions = [];
        this.loadedShaders = [];
        this.shaderLayers = [];
        this.ActiveLayers = [];
        this.width = sdWidth;
        this.height = sdHeight;
    }

    defineVaildShader(shaderDefArray) {
        this.validShaderDefinitions = [...shaderDefArray];
    }

    addVaildShader(shaderDef) {
        this.validShaderDefinitions.push(shaderDef);
    }

    enableShader() {
        if (this.validShaderDefinitions.length === 0) {
            console.log("有効なshaderが存在していません。...");
            return;
        }

        for (const defKey of this.validShaderDefinitions) {
            // すでに読み込まれているかチェック
            const existingShaderIndex = this.loadedShaders.findIndex(s => s.keyName === defKey);
            if (existingShaderIndex === -1) { // まだ読み込まれていない場合のみ追加
                const newShader = {
                    keyName: defKey,
                    sd: loadShader('shader.vert', 'shader' + defKey + '.frag'),
                    count: 0,
                    sdTime: 0
                };
                this.loadedShaders.push(newShader);
                const newLayer = createGraphics(this.width, this.height, WEBGL);
                newLayer.shader(newShader.sd);
                this.shaderLayers.push(newLayer);
            }
        }
        // もしvalidShaderDefinitionsから削除されたものがloadedShadersに残るのが問題なら、別途クリーンアップロジックが必要
    }

    plusShaderCount(targetKey) {
        const index = this.loadedShaders.findIndex(s => s.keyName === targetKey);
        if (index !== -1) { // ★追加: indexが有効な場合にのみ処理を行う
            this.loadedShaders[index].count += 1;
            this.resetActiveLayers();
        } else {
            console.warn(`Warning: Shader with key '${targetKey}' not found.`);
        }
    }

    plusSdTime() {
        for (let i = 0; i < this.loadedShaders.length; i++) {
            const BOOLVALUE = this.loadedShaders[i].count & 1;
            if (BOOLVALUE === 1) {
                this.loadedShaders[i].sdTime += 1;
            }
        }
    }

    resetActiveLayers() {
        let tempLayers = [];
        this.ActiveLayers = [];

        for (let i = 0; i < this.shaderLayers.length; i++) {
            const BOOLVALUE = this.loadedShaders[i].count & 1;
            if (BOOLVALUE === 1) {
                
                this.ActiveLayers.push(this.shaderLayers[i]);
            }
            else if(BOOLVALUE === 0){
                this.loadedShaders.sdTime[i] = 0;
            }
        }
    }

    sortLayer(){
        
    }

    send2ShaderUniform(targetKey, uniformName, value) {
        const index = this.loadedShaders.findIndex(s => s.keyName === targetKey);
        if (index !== -1) { 
            this.loadedShaders[index].sd.setUniform(uniformName, value);
        } else {
            console.warn(`Warning: Shader with key '${targetKey}' not found. Could not set uniform.`);
        }
    }

   

    //オフにした時に経過時間をリセットする。
    //オンの時
}