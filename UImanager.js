
class UIBindingManager {
    constructor(shaderManager, uiManager) {
        this.sd = shaderManager;
        this.ui = uiManager;
    }

    addGroup(label, shaderName) {
        this.ui.addGroup(label, shaderName);
    }

    createBinding(shaderName, type, uniformName, options = {}) {
        const uiInstance = this.ui.add(shaderName, type, uniformName, options);
        uiInstance.addChangeEvent((value) => {
            if (uniformName === 'divisions') {
                this.sd.setUniform(shaderName, uniformName, [value, value]);
            } else {
                this.sd.setUniform(shaderName, uniformName, value);
            }
        });
        const initialValue = uiInstance.getValue();
        if (uniformName === 'divisions') {
            this.sd.setUniform(shaderName, uniformName, [initialValue, initialValue]);
        } else {
            this.sd.setUniform(shaderName, uniformName, initialValue);
        }
    }

    /**
     * ★追加: uniform名を指定してUIインスタンスを取得します。
     * @param {string} uniformName - 取得したいUIのuniform名
     * @returns {UI | null}
     */
    getElement(uniformName) {
        return this.ui.getElement(uniformName);
    }
}


class UIManager {
    constructor(config = {}) {
        this.origin = config.origin || [10, 10];
        this.gridSize = config.gridSize || 25;
        this.panelWidth = config.panelWidth || 250;
        this.elements = [];
        this._isDragging = false;
        this._dragStartMouse = { x: 0, y: 0 };
        this._dragStartOrigin = { x: 0, y: 0 };
    }

    add(shaderName, type, uniformName, options = {}) {
        const element = new UI(this, { type, label: options.label || uniformName, uniformName: uniformName, ...options });
        this.elements.push({ type: 'element', instance: element, shaderName: shaderName });
        return element;
    }

    addGroup(label, shaderName) {
        const header = createSpan(label);
        header.style('font-weight', 'bold');
        header.style('color', '#FFFFFF');
        this.elements.push({ type: 'group', instance: header, shaderName: shaderName });
    }

    updateVisibility(activeShaderNames) {
        this.elements.forEach(el => {
            const shouldBeVisible = activeShaderNames.includes(el.shaderName);
            el.instance[shouldBeVisible ? 'show' : 'hide']();
        });
        this.reposition();
    }

    reposition() {
        let visibleIndex = 0;
        this.elements.forEach((el) => {
            if (el.instance.style('display') !== 'none') {
                const yPos = this.origin[1] + (visibleIndex + 1) * this.gridSize * 1.3;
                el.instance.reposition(yPos);
                visibleIndex++;
            }
        });
    }

    handleDrag() {
        if (mouseIsPressed) {
            const headerHeight = this.gridSize;
            const isOverHeader = mouseX > this.origin[0] && mouseX < this.origin[0] + this.panelWidth &&
                mouseY > this.origin[1] && mouseY < this.origin[1] + headerHeight;
            if (isOverHeader && !this._isDragging) {
                this._isDragging = true;
                this._dragStartMouse = { x: mouseX, y: mouseY };
                this._dragStartOrigin = { x: this.origin[0], y: this.origin[1] };
            }
            if (this._isDragging) {
                this.origin[0] = this._dragStartOrigin.x + (mouseX - this._dragStartMouse.x);
                this.origin[1] = this._dragStartOrigin.y + (mouseY - this._dragStartMouse.y);
                this.reposition();
            }
        } else {
            this._isDragging = false;
        }
    }

    /**
     * ★追加: uniform名を元にUIインスタンスを検索して返します。
     * @param {string} uniformName - 検索するuniform名
     * @returns {UI | null}
     */
    getElement(uniformName) {
        const elementWrapper = this.elements.find(el => el.type === 'element' && el.instance.uniformName === uniformName);
        return elementWrapper ? elementWrapper.instance : null;
    }
}

/**
 * 個々のUI要素を表現するクラス。
 */
class UI {
    constructor(manager, config) {
        this.manager = manager;
        this.type = config.type;
        this.label = config.label;
        this.uniformName = config.uniformName; // ★uniform名を保持
        this.hasLinkedInput = false;
        this.changeCallback = null; // ★コールバックを保持

        const { iniVal = 50, minVal = 0, maxVal = 100, step = 0 } = config;

        switch (this.type) {
            case "inputSlider":
                this.p5element = createSlider(minVal, maxVal, iniVal, step);
                this.linkedInput = createInput(String(iniVal));
                this.hasLinkedInput = true;
                break;
            case "slider":
                this.p5element = createSlider(minVal, maxVal, iniVal, step);
                break;
            case "input":
                this.p5element = createInput(String(iniVal));
                break;
            default: return;
        }

        this.labelElement = createSpan(this.label);
        this.labelElement.style('color', '#DDDDDD');
    }

    show() {
        this.p5element.show();
        if (this.labelElement) this.labelElement.show();
        if (this.hasLinkedInput) this.linkedInput.show();
    }
    hide() {
        this.p5element.hide();
        if (this.labelElement) this.labelElement.hide();
        if (this.hasLinkedInput) this.linkedInput.hide();
    }
    style(prop, val) { return this.p5element.style(prop, val); }

    reposition(yPos) {
        const xPos = this.manager.origin[0];
        const grid = this.manager.gridSize;
        const panelWidth = this.manager.panelWidth;
        this.labelElement.position(xPos + 10, yPos + 2);
        const elementXPos = xPos + grid * 6;
        const elementWidth = panelWidth - (elementXPos - xPos) - 15;
        if (this.hasLinkedInput) {
            const sliderWidth = elementWidth * 0.65;
            const inputWidth = elementWidth * 0.3;
            this.p5element.position(elementXPos, yPos);
            this.p5element.size(sliderWidth);
            this.linkedInput.position(elementXPos + sliderWidth + 5, yPos);
            this.linkedInput.size(inputWidth);
        } else {
            this.p5element.position(elementXPos, yPos);
            this.p5element.size(elementWidth);
        }
    }

    getValue() {
        const val = this.p5element.value();
        return isNaN(Number(val)) ? val : Number(val);
    }

    /**
     * ★追加: スクリプトからUIの値を設定します。
     * @param {*} value - 設定したい新しい値
     */
    setValue(value) {
        this.p5element.value(value);
        if (this.hasLinkedInput) {
            this.linkedInput.value(String(value));
        }
        // ★重要: 登録されたコールバックを呼び出して変更を通知
        if (this.changeCallback) {
            this.changeCallback(value);
        }
    }

    addChangeEvent(callback) {
        this.changeCallback = callback; // ★コールバックを保存
        const eventType = (this.type.includes('Slider')) ? 'input' : 'changed';
        this.p5element[eventType](() => {
            const currentValue = this.getValue();
            if (this.hasLinkedInput) {
                this.linkedInput.value(String(currentValue));
            }
            this.changeCallback(currentValue);
        });
        if (this.hasLinkedInput) {
            this.linkedInput[eventType](() => {
                const v = Number(this.linkedInput.value());
                if (!isNaN(v)) {
                    this.p5element.value(v);
                    this.changeCallback(this.getValue());
                }
            });
        }
    }
}
