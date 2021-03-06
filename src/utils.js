import Line from './objects/Line';
import Axis from './objects/Axis';
import LineSet from './objects/LineSet';

export const animate = (options) => {
    const start = performance.now();

    options.onAnimationStarted();

    requestAnimationFrame(function animate(time) {
        let timeFraction = (time - start) / options.duration;
        if (timeFraction > 1) timeFraction = 1;

        const progress = options.timing(timeFraction);

        options.draw(progress);

        if (timeFraction < 1) {
            requestAnimationFrame(animate);
        }

        if (timeFraction === 1) {
            options.onAnimationFinished();
        }
    });
};

export const throttle = (func, ms) => {
    let isThrottled = false;
    let savedArgs;
    let savedThis;

    function wrapper() {
        if (isThrottled) {
            savedArgs = arguments;
            savedThis = this;
            return;
        }

        func.apply(this, arguments);

        isThrottled = true;

        setTimeout(() => {
            isThrottled = false;

            if (savedArgs) {
                wrapper.apply(savedThis, savedArgs);
                savedArgs = savedThis = null;
            }
        }, ms);
    }

    return wrapper;
};

export const getMaxValueFromArray = (array) => {
    return (array || []).reduce((maxVal, value) => maxVal > value ? maxVal : value);
};

export const isLineIntersectRectangle = (x1, y1, x2, y2, minX, minY, maxX, maxY) => {
    if ((x1 <= minX && x2 <= minX) || (y1 <= minY && y2 <= minY) || (x1 >= maxX && x2 >= maxX) || (y1 >= maxY && y2 >= maxY))
        return false;

    let m = (y2 - y1) / (x2 - x1);

    let y = m * (minX - x1) + y1;
    if (y > minY && y < maxY) return true;

    y = m * (maxX - x1) + y1;
    if (y > minY && y < maxY) return true;

    let x = (minY - y1) / m + x1;
    if (x > minX && x < maxX) return true;

    x = (maxY - y1) / m + x1;

    return x > minX && x < maxX;
};

export const getMaxValueFromColumns = (data, xAxisType) => {
    return (data.columns || []).reduce((maxValue, column) => {
        const [name, ...values] = column;

        if (data.types[name] === xAxisType) {
            return;
        }

        const currentMaxValue = getMaxValueFromArray(values);

        return maxValue > currentMaxValue ? maxValue : currentMaxValue;
    }, Infinity);
};

export const getScale = (data, elementWidth, elementHeight, xAxisType) => {
    const column = (data.columns || []).find(
        column => data.types[column[0]] !== xAxisType) || [];

    return {
        scaleX: elementWidth / (column.length - 2),
        scaleY: elementHeight / getMaxValueFromColumns(data, xAxisType),
    };
};

export const getLines = (data, columnIndex, elementWidth, elementHeight, xAxisType) => {
    const { scaleX, scaleY } = getScale(data, elementWidth, elementHeight, xAxisType);
    const [name, ...values] = data.columns[columnIndex];

    if (data.types[name] === xAxisType) {
        return values;
    }
    const lines = [];

    for (let i = 0; i < values.length;) {
        const x1 = i * scaleX;
        const y1 = elementHeight - values[i] * scaleY;
        i++;
        const x2 = i * scaleX;
        const y2 = elementHeight - values[i] * scaleY;

        lines.push(new Line(x1, y1, x2, y2, values[i - 1]));
    }

    return lines;
};

export const getLineSets = (data, elementWidth, elementHeight, options) => {
    const { axis: { xAxisType } } = options;

    return (data.columns || []).reduce((linesSet, column, index) => {
        const newLines = getLines(data, index, elementWidth, elementHeight, xAxisType);
        const columnName = data.columns[index][0];

        linesSet.push(new LineSet(columnName, data.names[columnName], data.colors[columnName], newLines));

        return linesSet;
    }, []);
};

export const getFormattedDate = (date, options = {}) => {
    if (date) {
        const formatter = new Intl.DateTimeFormat('en-EN', {
            month: 'short',
            day: 'numeric',
            ...options,
        });

        return formatter.format(new Date(date));
    }

    return '';
};

export const getNearestValueIndexes = (x, lineSets, options) => {
    const { pixelRatio, axis: { xAxisType }  } = options;

    return (lineSets || []).reduce((nearestValueIndexes, lineSet) => {
        const isXAxisColumn = lineSet.name === xAxisType;

        if (isXAxisColumn) {
            nearestValueIndexes.push({ index: -1, resultX: 0 });

            return nearestValueIndexes;
        }

        const { index, resultX } = (lineSet.lines || []).reduce((result, line, index) => {
            const distance = Math.abs(x * pixelRatio - line.x1);

            if (result.minDistance > distance) {
                return {
                    index,
                    minDistance: distance,
                    resultX: line.x1,
                }
            }

            return result;
        }, { index: -1, minDistance: Infinity, resultX: 0 });

        nearestValueIndexes.push({ index, resultX });

        return nearestValueIndexes;
    }, []);
};

export const getXAxis = (data, elementWidth, elementHeight, options, lineSets) => {
    const { axis: { xAxisType, scale: axisScale }, pixelRatio } = options;
    const stepWidth = Math.floor(elementWidth / axisScale);
    const xAxis = new Axis('x');
    const xAxisLines = (lineSets || []).find(lineSet => lineSet.name === xAxisType);

    for (let i = 0; i < axisScale; i++) {
        const x = i * stepWidth + 50;
        const result = getNearestValueIndexes(x / pixelRatio, lineSets, options).find(value => value.index !== -1);

        if (result) {
            const { index, resultX } = result;

            const formattedDate = getFormattedDate(xAxisLines.lines[index]);

            xAxis.addScale(formattedDate, resultX, elementHeight);
        }
    }

    return xAxis;
};

export const getYAxis = (data, elementHeight, options) => {
    const { axis: { xAxisType, scale: axisScale } } = options;
    const maxValue = getMaxValueFromColumns(data, xAxisType);
    const stepHeight = elementHeight / axisScale;
    const stepValue = maxValue / axisScale;
    const yAxis = new Axis('y');

    for (let i = 0; i < axisScale; i++ ) {
        const value =  Math.floor(maxValue - stepValue * i || 0);
        const x = 0;
        const y = stepHeight * i;

        yAxis.addScale(value, x, y);
    }

    return yAxis;
};

export const getAxes = (data, elementWidth, elementHeight, options, lineSets) => {
    return {
        x: getXAxis(data, elementWidth, elementHeight, options, lineSets),
        y: getYAxis(data, elementHeight, options),
    };
};

export const hexToRgb = (hex) => {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
};

export const isEqual = (a, b) => {
    const isArray = Array.isArray;
    const keyList = Object.keys;
    const hasProp = Object.prototype.hasOwnProperty;

    if (a === b) return true;

    if (a && b && typeof a === 'object' && typeof b === 'object') {
        let arrA = isArray(a);
        let arrB = isArray(b);

        if (arrA && arrB) {
            let length = a.length;

            if (length !== b.length) {
                return false;
            }

            for (let i = length; i-- !== 0;) {
                if (!isEqual(a[i], b[i])) {
                    return false;
                }
            }

            return true;
        }

        if (arrA != arrB) {
            return false;
        }

        let keys = keyList(a);
        length = keys.length;

        if (length !== keyList(b).length)
            return false;

        for (let i = length; i-- !== 0;) {
            if (!hasProp.call(b, keys[i])) {
                return false;
            }
        }

        for (let i = length; i-- !== 0;) {
            const key = keys[i];

            if (!isEqual(a[key], b[key])) {
                return false;
            }
        }

        return true;
    }

    return a !== a && b !== b;
};
