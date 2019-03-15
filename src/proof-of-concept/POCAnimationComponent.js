import CanvasComponent from '../base/CanvasComponent';
import { getMaxValueFromArray } from '../utils';

const data = {
    yValues: [10, 15, 8, 20, 17, 6, 12, 31, 24],
    color: "#3DC23F",
};

class RenderFactory {
    static addToQueue(renderFunction, args, ms) {
        setTimeout(() => window.requestAnimationFrame(() => renderFunction(...args)), ms);
    }
}

class Line {
    constructor(x1, y1, x2, y2) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
    }
}

export default class POCAnimationComponent extends CanvasComponent {
    init() {
        this.data = data;

        setInterval(() => {
            this.clear();

            setTimeout(() => this.render(), 200);
        }, 2000);
    }

    getScale(data) {
        const elementWidth = this.element.width;
        const elementHeight = this.element.height;

        return {
            scaleX: elementWidth / (data.yValues.length - 1),
            scaleY: elementHeight / getMaxValueFromArray(data.yValues),
        };
    }

    getLine(x1, y1, x2, y2, scaleX, scaleY) {
        return new Line(
            x1 * scaleX,
            this.element.height - y1 * scaleY,
            x2 * scaleX,
            this.element.height - y2 * scaleY,
        );
    }

    renderLine(line, lineIndex) {
        const deltaX = (line.x2 - line.x1) / 150;
        const deltaY = (line.y2 - line.y1) / 150;
        const maxX = line.x1 > line.x2 ? line.x1 : line.x2;
        let currentX = line.x1 > line.x2 ? line.x2 : line.x1;
        let currentY = line.y1;
        let index = 0;

        while (currentX < maxX) {
            RenderFactory.addToQueue((x1, y1, x2, y2) => {
                const path = new Path2D();

                path.moveTo(x1, y1);
                path.lineTo(x2, y2);

                this.context.stroke(path);
            }, [currentX, currentY, currentX + deltaX, currentY+ deltaY], lineIndex);

            currentX += deltaX;
            currentY += deltaY;
            index++;
        }
    }

    render() {
        const { scaleX, scaleY } = this.getScale(this.data);
        this.context.strokeStyle = this.data.color;
        this.context.lineWidth = 5;

        for (let i = 0; i < data.yValues.length;) {
            const x1 = i;
            const y1 = data.yValues[i];
            ++i;
            const x2 = i;
            const y2 = data.yValues[i];
            const line = this.getLine(x1, y1, x2, y2, scaleX, scaleY);

            this.renderLine(line, i);
        }
    }
}