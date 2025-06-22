class ManageShader {
    constructor() {
        this.vaildShader = [];
        this.shader = [];
        this.currentShader = [];
    }

    defineVaildSd(defineShaderArray) {
        for (let i = 0; i < vaildShaderArray.length; i++) {
            this.vaildShader[i] = vaildShaderArray[i];
        }
    }
    addVaildSd(addArray) {
        for (let i = 0; i < addArray; i++) {
            this.vaildShader.push(addArray[i]);
        }
    }
    enableSd() {
        if (this.vaildShader) {
            for (let i = 0; i < this.shader.length; i++) {
                this.shader[i] = { sd: loadShader('shader.vert', 'shader' + i + '.frag'), count: 0 }
            }
        }
        else {
            console.log("有効なshaderが存在していません。defineVaildSd(defineShaderArray),addVaildSd(addArray)で追加してください")
            return
        }
    }

}