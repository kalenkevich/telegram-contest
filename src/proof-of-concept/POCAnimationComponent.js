import CanvasComponent from '../base/CanvasComponent';
import Line from '../objects/Line';
import { getMaxValueFromArray } from '../utils';

const data = {
    yValues: [10, 15, 8, 20, 17, 6, 12, 31, 24],
    color: "#3DC23F",
};

const effects = {
    linear: function(t) {
        return t;
    },

    easeInQuad: function(t) {
        return t * t;
    },

    easeOutQuad: function(t) {
        return -t * (t - 2);
    },

    easeInOutQuad: function(t) {
        if ((t /= 0.5) < 1) {
            return 0.5 * t * t;
        }
        return -0.5 * ((--t) * (t - 2) - 1);
    },

    easeInCubic: function(t) {
        return t * t * t;
    },

    easeOutCubic: function(t) {
        return (t = t - 1) * t * t + 1;
    },

    easeInOutCubic: function(t) {
        if ((t /= 0.5) < 1) {
            return 0.5 * t * t * t;
        }
        return 0.5 * ((t -= 2) * t * t + 2);
    },

    easeInQuart: function(t) {
        return t * t * t * t;
    },

    easeOutQuart: function(t) {
        return -((t = t - 1) * t * t * t - 1);
    },

    easeInOutQuart: function(t) {
        if ((t /= 0.5) < 1) {
            return 0.5 * t * t * t * t;
        }
        return -0.5 * ((t -= 2) * t * t * t - 2);
    },

    easeInQuint: function(t) {
        return t * t * t * t * t;
    },

    easeOutQuint: function(t) {
        return (t = t - 1) * t * t * t * t + 1;
    },

    easeInOutQuint: function(t) {
        if ((t /= 0.5) < 1) {
            return 0.5 * t * t * t * t * t;
        }
        return 0.5 * ((t -= 2) * t * t * t * t + 2);
    },

    easeInSine: function(t) {
        return -Math.cos(t * (Math.PI / 2)) + 1;
    },

    easeOutSine: function(t) {
        return Math.sin(t * (Math.PI / 2));
    },

    easeInOutSine: function(t) {
        return -0.5 * (Math.cos(Math.PI * t) - 1);
    },

    easeInExpo: function(t) {
        return (t === 0) ? 0 : Math.pow(2, 10 * (t - 1));
    },

    easeOutExpo: function(t) {
        return (t === 1) ? 1 : -Math.pow(2, -10 * t) + 1;
    },

    easeInOutExpo: function(t) {
        if (t === 0) {
            return 0;
        }
        if (t === 1) {
            return 1;
        }
        if ((t /= 0.5) < 1) {
            return 0.5 * Math.pow(2, 10 * (t - 1));
        }
        return 0.5 * (-Math.pow(2, -10 * --t) + 2);
    },

    easeInCirc: function(t) {
        if (t >= 1) {
            return t;
        }
        return -(Math.sqrt(1 - t * t) - 1);
    },

    easeOutCirc: function(t) {
        return Math.sqrt(1 - (t = t - 1) * t);
    },

    easeInOutCirc: function(t) {
        if ((t /= 0.5) < 1) {
            return -0.5 * (Math.sqrt(1 - t * t) - 1);
        }
        return 0.5 * (Math.sqrt(1 - (t -= 2) * t) + 1);
    },

    easeInElastic: function(t) {
        var s = 1.70158;
        var p = 0;
        var a = 1;
        if (t === 0) {
            return 0;
        }
        if (t === 1) {
            return 1;
        }
        if (!p) {
            p = 0.3;
        }
        if (a < 1) {
            a = 1;
            s = p / 4;
        } else {
            s = p / (2 * Math.PI) * Math.asin(1 / a);
        }
        return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t - s) * (2 * Math.PI) / p));
    },

    easeOutElastic: function(t) {
        const s = 1.70158;
        let p = 0;
        let a = 1;
        if (t === 0) {
            return 0;
        }
        if (t === 1) {
            return 1;
        }
        if (!p) {
            p = 0.3;
        }
        if (a < 1) {
            a = 1;
            s = p / 4;
        } else {
            s = p / (2 * Math.PI) * Math.asin(1 / a);
        }
        return a * Math.pow(2, -10 * t) * Math.sin((t - s) * (2 * Math.PI) / p) + 1;
    },

    easeInOutElastic: function(t) {
        const s = 1.70158;
        let p = 0;
        let a = 1;
        if (t === 0) {
            return 0;
        }
        if ((t /= 0.5) === 2) {
            return 1;
        }
        if (!p) {
            p = 0.45;
        }
        if (a < 1) {
            a = 1;
            s = p / 4;
        } else {
            s = p / (2 * Math.PI) * Math.asin(1 / a);
        }
        if (t < 1) {
            return -0.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t - s) * (2 * Math.PI) / p));
        }
        return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t - s) * (2 * Math.PI) / p) * 0.5 + 1;
    },
    easeInBack: function(t) {
        const s = 1.70158;
        return t * t * ((s + 1) * t - s);
    },

    easeOutBack: function(t) {
        const s = 1.70158;
        return (t = t - 1) * t * ((s + 1) * t + s) + 1;
    },

    easeInOutBack: function(t) {
        const s = 1.70158;
        if ((t /= 0.5) < 1) {
            return 0.5 * (t * t * (((s *= (1.525)) + 1) * t - s));
        }
        return 0.5 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2);
    },

    easeInBounce: function(t) {
        return 1 - effects.easeOutBounce(1 - t);
    },

    easeOutBounce: function(t) {
        if (t < (1 / 2.75)) {
            return 7.5625 * t * t;
        }
        if (t < (2 / 2.75)) {
            return 7.5625 * (t -= (1.5 / 2.75)) * t + 0.75;
        }
        if (t < (2.5 / 2.75)) {
            return 7.5625 * (t -= (2.25 / 2.75)) * t + 0.9375;
        }
        return 7.5625 * (t -= (2.625 / 2.75)) * t + 0.984375;
    },

    easeInOutBounce: function(t) {
        if (t < 0.5) {
            return effects.easeInBounce(t * 2) * 0.5;
        }
        return effects.easeOutBounce(t * 2 - 1) * 0.5 + 0.5;
    }
};


class RenderFactory {
    static addToQueue(renderFunction, args, ms, animationType) {
        const animationFunction = effects[animationType];

        setTimeout(() => window.requestAnimationFrame(() => renderFunction(...args)), animationFunction(ms));
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
            }, [currentX, currentY, currentX + deltaX, currentY+ deltaY], lineIndex,  this.props.animationType);

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
