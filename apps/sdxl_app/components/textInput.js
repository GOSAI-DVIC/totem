import { Button } from "./button.js";

export class TextInput {
    constructor(x, y, w, h, defaultText) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.text = defaultText;
        this.isSelected = false;
        this.cursorVisible = false;
        this.lastCursorBlink = millis();
        this.cursorBlinkRate = 500;
        this.keyboard = new Keyboard(this.x - this.w/2 + 40, this.y + this.h / 2 + 10, this);
    }

    select() {
        this.isSelected = true;
    }

    deselect() {
        this.isSelected = false;
    }

    appendText(character) {
        this.text += character;
    }

    backspace() {
        this.text = this.text.substring(0, this.text.length - 1);
    }

    display(sketch) {
        sketch.push();
        sketch.translate(this.x, this.y);

        // Draw the text box
        sketch.stroke(0);
        sketch.fill(255);
        sketch.rectMode(sketch.CENTER);
        sketch.rect(0, 0, this.w, this.h);

        // Draw the text
        sketch.fill(0);
        sketch.strokeWeight(1);
        sketch.textSize(this.h / 2);
        sketch.textAlign(sketch.LEFT, sketch.CENTER);
        sketch.text(this.text, -this.w / 2 + 10, 0);

        // Draw the cursor if selected
        if (this.isSelected && this.cursorVisible) {
            let cursorX = sketch.textWidth(this.text) - this.w / 2 + 10;
            sketch.stroke(0);
            sketch.strokeWeight(1);
            sketch.line(cursorX, -this.h / 4, cursorX, this.h / 4);
        }

        if (millis() - this.lastCursorBlink > this.cursorBlinkRate) {
            this.cursorVisible = !this.cursorVisible;
            this.lastCursorBlink = millis();
        }

        sketch.pop();
        if (this.isSelected) {
            this.keyboard.display(sketch);
        }
    }

    isHovered(pointer) {
        return pointer.x > this.x - this.w / 2 &&
            pointer.x < this.x + this.w / 2 &&
            pointer.y > this.y - this.h / 2 &&
            pointer.y < this.y + this.h / 2;
    }

    update(pointer) {
        if (pointer.clicked) {
            if (this.isHovered(pointer)) {
                this.select();
            } else {
                this.deselect();
            }
            this.keyboard.update(pointer);
        }
    }

}


export class Keyboard {
    constructor(x, y, inputField) {
        this.x = x;
        this.y = y;
        this.inputField = inputField;
        this.keys = [];
        this.layout = ["azertyuiop", "qsdfghjklm", "wxcvbn", "$< "]; // Simple layout for demonstration

        let keyWidth = 50;
        let keyHeight = 50;
        let xOffset = -5;
        let yOffset = 20;
        this.keyWidth = keyWidth;
        this.keyHeight = keyHeight;
        this.yOffset = yOffset;
        this.xOffset = xOffset;

        for (let row of this.layout) {
            xOffset = 0;
            for (let char of row) {
                let key = new Button(this.x + xOffset, this.y + yOffset, keyWidth, keyHeight, char, "white");
                key.setOnClick(() => {
                    this.inputField.isSelected = true;
                    console.log(char);
                    if (char === '<') {
                        this.inputField.backspace();
                    } else {
                        this.inputField.appendText(char);
                    }
                });
                key.enabled = true;
                key.visible = true;
                this.keys.push(key);
                xOffset += keyWidth + 10;
            }
            yOffset += keyHeight + 10;
        }
    }

    display(sketch) {

        
        if (!this.inputField.isSelected) return;
        // draw the background
        sketch.fill(60);
        sketch.stroke(0);
        sketch.strokeWeight(3);
        sketch.rect(this.x + 10*this.xOffset, this.y - this.yOffset, 12 * this.keyWidth - this.xOffset*5, 5 * this.keyWidth + 10, 20);
        // sketch.noStroke();
        // sketch.rect(this.x, this.y, 500, 300);

        // Draw the keyboard
        for (let key of this.keys) {
            key.display(sketch);
        }
    }

    update(pointer) {
        // console.log(pointer);
        // if (!this.inputField.isSelected) return;
        for (let key of this.keys) {
            key.update(pointer);
            // console.log(key.onClick);
        }
    }
}
