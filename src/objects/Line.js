import AnimationEffects from '../animation/Effects';

export default class Line {
    constructor(x1, y1, x2, y2, value) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.value = value;
    }

    render(context, animationType = 'none', color) {
        const deltaX = ((this.x2 - this.x1) / 45);
        const deltaY = ((this.y2 - this.y1) / 45);
        const maxX = this.x1 > this.x2 ? this.x1 : this.x2;
        let currentX = this.x1 > this.x2 ? this.x2 : this.x1;
        let currentY = this.y1;
        let index = 0;

        while (currentX < maxX) {
            const animationFunction = AnimationEffects[animationType];

            if (animationType === 'none') {
                const path = new Path2D();

                context.strokeStyle = color;

                path.moveTo(currentX, currentY);
                path.lineTo(currentX + deltaX, currentY+ deltaY);

                context.stroke(path);
            } else {
                ((x1, y1, x2, y2) => {
                    setTimeout(() => {
                        const path = new Path2D();

                        context.strokeStyle = color;

                        path.moveTo(x1, y1);
                        path.lineTo(x2, y2);

                        context.stroke(path);
                    }, animationFunction(0));
                })(currentX, currentY, currentX + deltaX, currentY+ deltaY);
            }

            currentX += deltaX;
            currentY += deltaY;
            index++;
        }
    }
}
