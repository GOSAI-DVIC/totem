export class ImageLoader {
    constructor() {
        this.images = [];
        this.paths = [];
        this.angles = [];
        this.selectedIndex = 0;
        this.constantAngle = -3.14/2;
        this.currentAngle = 0;
        this.currentAngleSpeed = 0;
        this.friction = 0.97;
        this.threshold = 2;
        this.centerX = 0;
        this.centerY = 50;
        this.minsize = 1;
        this.maxsize = 200;
        this.border = 4;
        // click logic
        this.isholding = false;
        this.oldAngle = 0;
        this.newAngle = 0;
        this.oldCurrentAngle = 0;
    }

    // load each image in assets
    preload(image_paths) {
        for (let i = 0; i < image_paths.length; i++) {
            let img = loadImage("./platform/home/apps/totem_app/images/"+image_paths[i]);
            this.images.push(img);
            this.paths.push(image_paths[i]);
        }
        // if less than 20 images, repeat the images
        if (this.images.length < 20) {
            let length = this.images.length;
            for (let i = 1; i < length; i++) {
                let img = this.images[i];
                this.images.push(img);
                this.paths.push(this.paths[i]);
            }
        }
        //  build angles
        for (let i = 0; i < this.images.length; i++) {
            this.angles.push(i * TWO_PI / this.images.length);
        }
        this.centerY = height/2;
    }

    // display the current image
    display(sketch) {
        // norm all angles
        for (let i = 0; i < this.angles.length; i++) {
            this.angles[i] = this.angles[i]% TWO_PI;
        }

        // build sizes according to the angle 
        let sizes = [];
        let visible = [];
        for (let i = 0; i < this.angles.length; i++) {
            sizes.push(map(sin(this.angles[i] - this.currentAngle + this.constantAngle), -1, 1, this.minsize, this.maxsize));
            visible.push(sin(this.angles[i] - this.currentAngle + this.constantAngle) > 0);
        }
        // find index of the biggest image
        let maxIndex = 0;
        let max_ = sizes[0];
        for (let i = 0; i < sizes.length; i++) {
            if (sizes[i] > max_) {
                maxIndex = i;
                max_ = sizes[i];
            }
        }
        this.selectedIndex = maxIndex;

        // draw the images
        for (let i = 0; i < this.images.length; i++) {
            if (visible[i]) {
                let x = this.centerX;
                // let y = width/2 + sin(this.angles[i]) * 200;
                // let y = map(sin(this.angles[i] - this.currentAngle), -1, 1, 0, height/2);
                let y = sketch.height/2 - this.maxsize/2 + cos(this.angles[i] - this.currentAngle +this.constantAngle) * sketch.height/2;
                // change color 
                if (i == maxIndex) {
                    sketch.fill(255, 0, 0);
                }
                else {
                    sketch.fill(255);
                }
                //  draw a square for each image
                sketch.rect(x-this.border+40*sizes[i]/this.maxsize, y-this.border, sizes[i]+this.border*2, sizes[i]+this.border*2);
                // draw the image
                sketch.image(this.images[i], x+40*sizes[i]/this.maxsize, y, sizes[i], sizes[i]);
            }
        }
    }

    getSelected() {
        return this.paths[this.selectedIndex];
    }

    update(sketch, newY){
        if (! this.isholding){
            // move the current angle
            this.currentAngle += this.currentAngleSpeed;
            this.currentAngleSpeed *= this.friction/(1+Math.abs(this.currentAngleSpeed));
        }
        else {
            const alpha = 0.9;
            const delta = this.currentAngle*alpha + (1-alpha)*(this.oldCurrentAngle + map(newY - this.oldAngle, -sketch.height, sketch.height, -Math.PI, Math.PI));
            this.currentAngleSpeed = delta - this.currentAngle;
            this.currentAngle = delta;
            // this.oldAngle = newY;
        }
        this.newAngle = newY;
    }

    onReleased(x,y) {
        // if the mouse is within the gallery
        this.isholding = false;
    }
    onPressed(x,y) {
        if (x > this.centerX && x < 40+this.centerX+this.maxsize*1.1 && y > 0 && y < height) {
            // change the angle speed
            this.oldAngle = y;
            this.newAngle = y;
            this.isholding = true;
            this.oldCurrentAngle = this.currentAngle;
        }
    }
}