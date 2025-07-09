class ActionManager {
    constructor(p5instance) {
        this.p5 = p5instance;
        this.actionRegistry = new Map;
        this.shotActionRegistry = new Map;
        this.onActiveChangeCallback = null;
        this.activeAction = [];
    }

    onActiveActionChange(callback) {
        this.onActiveChangeCallback = callback;
    }

    addAction(actionName, originalfunction, toggleKey) {
        this.actionRegistry.set(actionName, {
            toggleKey: toggleKey.toLowerCase(),
            action: originalfunction,
            activeTime: 0
        })
    }

    addShotAction(actionName, originalfunction, toggleKey) {
        this.shotActionRegistry.set(actionName, {
            toggleKey: toggleKey.toLowerCase(),
            action: originalfunction
        })
    }

    handleKeyPressed() {
        const pressedKey = this.p5.key.toLowerCase();
        let changed = false;

        for (const [actionName, actionInfo] of this.actionRegistry.entries()) {
            if (actionInfo.toggleKey === pressedKey) {
                const isActive = this.activeAction.includes(actionName);
                if (isActive) {
                    actionInfo.activeTime = 0;
                    this.activeAction = this.activeAction.filter(name => name !== actionName);
                } else {
                    this.activeAction.push(actionName);
                }
                changed = true;
                console.log("Active action:", this.activeAction);
                break;
            }
        }
        if (changed && this.onActiveChangeCallback) {
            this.onActiveChangeCallback(this.activeAction);
        }
    }

    isActive(actionName) {
        return this.activeAction.includes(actionName);
    }

    shot() {
        const pressedKey = this.p5.key.toLowerCase();
        for (const [actionName, actionInfo] of this.shotActionRegistry.entries()) {
            if (actionInfo.toggleKey === pressedKey) {
                actionInfo.action();
                console.log("Shot action executed:", actionName);
                break;
            }
        }
    }

    apply() {
        if (this.activeAction.length === 0) {
            return;
        }
        for (const actionName of this.activeAction) {
            const actionInfo = this.actionRegistry.get(actionName);
            if (actionInfo) {
                actionInfo.activeTime++;
                actionInfo.action(actionInfo);
            }
        }
    }
}

class Points {
    constructor(p5instance) {
        this.p5 = p5instance;
        this.pointData = new Array();
    }
    push(x, y, z, value, type = 0, color = { r: 0, g: 0, b: 0 }) {
        this.pointData.push({
            x: x, y: y, z: z,
            ox: x, oy: y, oz: z,
            value: value,
            color: color,
            type: type,
            direction: this.p5.createVector(
                this.p5.random(-1, 1),
                this.p5.random(-1, 1),
                this.p5.random(-1, 1)
            ).normalize()
        });
    }

    pop() {
        return this.pointData.pop();
    }

    setRandomPosition() {
        for (const data of this.pointData) {
            data.x = this.p5.random(0, this.p5.width);
            data.y = this.p5.random(0, this.p5.height);
            data.z = this.p5.random(0, this.p5.max(this.p5.width, this.p5.height));
        }
    }

    updatePositionX(amplitude, frequency) {
        const time = this.p5.millis() / 1000.0; // 現在の時間を秒単位で取得
        for (const data of this.pointData) {
            const movement = this.p5.sin(time * frequency) * amplitude;
            data.x = data.ox + movement;
        }
    }

    updatePositionY(amplitude, frequency) {
        const time = this.p5.millis() / 1000.0;
        for (const data of this.pointData) {
            const movement = this.p5.sin(time * frequency) * amplitude;
            data.y = data.oy + movement;
        }
    }

    updatePositionZ(amplitude, frequency) {
        const time = this.p5.millis() / 1000.0;
        for (const data of this.pointData) {
            const movement = this.p5.cos(time * frequency + data.oz * 0.05) * amplitude;
            data.z = data.oz + movement;
        }
    }

    moveAwayFromOrigin(speed) {
        // 経過時間（秒）を基準に移動距離を計算
        const distance = (this.p5.millis() / 1000.0) * speed;
        for (const data of this.pointData) {
            // 新しい位置 = 初期位置 + 方向 * 距離
            data.x = data.ox + data.direction.x * distance;
            data.y = data.oy + data.direction.y * distance;
            data.z = data.oz + data.direction.z * distance;
        }
    }

    moveTowardsOrigin(amount) {
        for (const data of this.pointData) {
            // 現在位置のベクトル
            const currentPos = this.p5.createVector(data.x, data.y, data.z);
            // 初期位置のベクトル
            const originPos = this.p5.createVector(data.ox, data.oy, data.oz);

            // 2つのベクトル間を補間して新しい位置を計算
            const newPos = p5.Vector.lerp(currentPos, originPos, amount);

            data.x = newPos.x;
            data.y = newPos.y;
            data.z = newPos.z;
        }
    }
    moveInDirection(angle, speed) {
        // 角度からxとyの移動量を計算
        // cos(angle)でx方向の成分、sin(angle)でy方向の成分が求まる
        const moveX = this.p5.cos(angle) * speed;
        const moveY = this.p5.sin(angle) * speed;

        for (const data of this.pointData) {
            // 各点の現在の座標に移動量を加算
            data.x += moveX;
            data.y += moveY;
        }
    }
}
class DrawGraphics {
    constructor(pointClass, p5instance) {
        this.p5 = p5instance;
        this.point = pointClass;
        this.p5.rectMode(this.p5.CENTER);
    }

    draw() {
        this.point.pointData.forEach(element => {

            this.p5.noStroke(); // 塗りつぶしなし
            this.p5.fill(element.color.r, element.color.g, element.color.b);
            this.p5.strokeWeight(1); // 線の太さを設定

            this.p5.push();
            this.p5.translate(element.x, element.y, element.z);

            switch (element.type) {
                case 0: // circle
                    this.p5.circle(0, 0, element.value);
                    break;
                case 1: // rect
                    this.p5.rect(0, 0, element.value, element.value);
                    break;
                case 2: // sphere
                    this.p5.sphere(element.value / 2);
                    break;
                default:
                    this.p5.circle(0, 0, element.value);
                    break;
            }

            this.p5.pop();
        });
    }
}