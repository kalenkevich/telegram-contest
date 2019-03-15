export default class Axis {
    constructor(type) {
        this.type = type;
        this.scales = [];
    }

    addScale(value, x, y, width, height) {
        this.scales.push({ value, x, y });
    }
}
