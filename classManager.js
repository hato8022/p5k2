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

class MusicManager {
    constructor() {
        // 音楽再生に関する情報
        this.audioElement = null; // HTMLオーディオ要素（またはp5.SoundFileオブジェクトなど）
        this.isPlaying = false;
        this.currentTime = 0; // 現在の再生時間 (秒)
        this.duration = 0; // 曲の総再生時間 (秒)

        // 音量に関する情報
        this.volume = 0; // 現在の音量（0.0〜1.0）
        this.rms = 0; // 現在のRMS (Root Mean Square) 値：全体の音圧レベルの指標

        // 周波数スペクトルに関する情報
        this.fft = null; // p5.FFT オブジェクト
        this.spectrum = []; // 周波数スペクトルデータ (FFTから取得)
        this.bass = 0; // 低音域のエネルギー
        this.mid = 0; // 中音域のエネルギー
        this.treble = 0; // 高音域のエネルギー

        // ビート検出に関する情報
        this.bpm = 0; // テンポ (Beats Per Minute)
        this.isBeat = false; // 現在ビートが検出されたかどうか
        this.lastBeatTime = 0; // 最後のビートが検出された時間
        this.beatCount = 0; // ビートの総数

        // その他のメタデータ
        this.title = "";
        this.artist = "";
        this.album = "";
        this.genre = "";
    }

    // --- メソッド ---

    // 音楽ファイルのロード
    loadSound(path) {
        // p5.soundのloadSound()などを使用
    }

    // 再生/一時停止
    playPause() { }

    // 更新メソッド (drawループで呼び出す)
    update() {
        // currentTime, rms, spectrum, bass, mid, treble, isBeat などを更新
    }

    // 特定の周波数帯のエネルギーを取得するヘルパーメソッド
    getEnergy(band) { }

    // ビート検出ロジック (p5.soundのisBeat()や独自のロジック)
    detectBeat() { }

    // その他、VJに役立つであろう情報取得メソッド
    getNormalizedVolume() { } // RMSなどを正規化して0-1の範囲で返す
    getBeatStrength() { } // ビートの強さ
}