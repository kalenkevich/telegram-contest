export default class Axis {
    constructor(type) {
        this.type = type;
        this.scales = [];
    }

    addScale(value, x, y) {
        this.scales.push({ value, x, y });
    }
}
