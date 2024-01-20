export class imageHolder{
    constructor(x, y, width, height, sketch){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.img = sketch.createImage(width, height);
        // default all pixels to white
        this.img.loadPixels();
        for (let i = 0; i < this.img.width; i++) {
            for (let j = 0; j < this.img.height; j++) {
                let c = sketch.color(map(i, 0, this.img.width, 0, 255), map(j, 0, this.img.height, 0, 255), 0);
                this.img.set(i, j, c);
            }
        }
        this.img.updatePixels();
        this.sketch = sketch;
    }
    display(sketch){
        sketch.image(this.img, this.x, this.y);
    }

    getImg(){
        // returns the img url
        return this.img.canvas.toDataURL();
    }

    updateImg(data){
        // update the image from data, which is the bytes of a png
        // this.img = this.sketch.loadImage(data);
        let blob = new Blob([data], { type: 'image/png' });
        let url = URL.createObjectURL(blob);
        loadImage(url, (img) => {
            this.img = img;
            console.log("Image loaded successfully");
            URL.revokeObjectURL(url);
        }, (event) => {
            console.error("Error loading image:", event);
        });
    }
}