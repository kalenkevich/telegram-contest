import Line from './objects/Line';
import Axis from './objects/Axis';

export const getMaxValueFromArray = (array) => {
    return (array || []).reduce((maxVal, value) => maxVal > value ? maxVal : value, 0);
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
    }, 0);
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
        return [];
    }
    const lines = [];

    for (let i = 0; i < values.length;) {
        const x1 = i * scaleX;
        const y1 = elementHeight - values[i] * scaleY;
        i++;
        const x2 = i * scaleX;
        const y2 = elementHeight - values[i] * scaleY;

        lines.push(new Line(x1, y1, x2, y2));
    }

    return lines;
};

export const getLineSets = (data, elementWidth, elementHeight, options) => {
    const { xAxisType } = options;

    return (data.columns || []).reduce((linesSet, column, index) => {
        const newLines = getLines(data, index, elementWidth, elementHeight, xAxisType);
        const columnName = data.columns[index][0];

        linesSet.push({
            name: columnName,
            color: data.colors[columnName],
            lines: newLines,
        });

        return linesSet;
    }, []);
};

export const getFormattedDate = (date) => {
    const formatter = new Intl.DateTimeFormat('ru-RU', {
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
    });

    return formatter.format(new Date(date));
};

export const getXAxis = (data, elementWidth, elementHeight, options) => {
    const { axisScale } = options;
    const stepWidth = elementWidth / axisScale;
    const xAxis = new Axis('x');

    for (let i = 0; i < axisScale; i++) {
        const formattedDate = getFormattedDate(new Date());
        const x = stepWidth * i;

        xAxis.addScale(formattedDate, x, elementHeight);
    }

    return xAxis;
};

export const getYAxis = (data, elementHeight, options) => {
    const {
        axisScale,
        xAxisType,
    } = options;
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

export const getAxes = (data, elementWidth, elementHeight, options) => {
    return {
        x: getXAxis(data, elementWidth, elementHeight, options),
        y: getYAxis(data, elementHeight, options),
    };
};
