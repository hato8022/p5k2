class ManageShader {
    constructor(sdWidth, sdHeight) {
        this.validShaderDefinitions = [];
        this.loadedShaders = [];
        this.currentActiveShaders = [];
        this.shaderLayers = [];
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
        if (this.validShaderDefinitions.length > 0) {
            for (let i = 0; i < this.validShaderDefinitions.length; i++) {
                this.loadedShaders[i] = { sd: loadShader('shader.vert', 'shader' + this.validShaderDefinitions[i] + '.frag'), count: 0, sdTime: 0 }
                this.shaderLayers[i] = createGraphics(this.width, this.height, WEBGL);
            }
        }
        else {
            console.log("有効なshaderが存在していません。defineVaildShader(shaderDefArray),addVaildShader(add)で追加してください")
            return
        }
    }

    plusShaderCount(searchKey) {
        const index = this.loadedShaders.findIndex(s => s.keyNum === int(searchKey));
        this.loadedShaders[index].count += 1;
    }

    validCurShader() {
        for (let i = 0; i < this.loadedShaders.length; i++) {
            const BOOLVALUE = this.loadedShaders[i].count & 1;
            if (BOOLVALUE == 1) {
                this.currentActiveShaders.push(shader[i].sd);
            }
        }
    }

    attachShader2Layer() {
        for (let i = 0; i < this.currentActiveShaders.length; i++) {
            this.shaderLayers[i] = shader(this.currentActiveShaders[i]);
        }
    }

    SpliceShader() {
        for (let i = this.loadedShaders.length - 1; i >= 0; i--) {
            const BOOLVALUE = this.loadedShaders[i].count & 1;
            if (BOOLVALUE == 0) {
                this.currentActiveShaders.splice(this.currentActiveShaders.indexOf(this.loadedShaders[i].sd), 1);
            }
        }
    }

    checkShader() {
        for (let i = 0; i < this.loadedShaders.length; i++) {
            const BOOLVALUE = this.loadedShaders[i].count & 1;
            if (BOOLVALUE == 1) {
                this.currentActiveShaders.push(shader[i].sd);
            }
            else if (BOOLVALUE == 0) {
                this.currentActiveShaders.splice(i, 1);
            }
        }
    }

}