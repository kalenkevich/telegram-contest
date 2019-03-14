import { X_AXIS_TYPE } from './contansts';

export const getMaxValueFromArray = (array) => {
    return (array || []).reduce((maxVal, value) => maxVal > value ? maxVal : value);
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

export const getMaxValueFromColumns = (data) => {
    return (data.columns || []).reduce((maxValue, column) => {
        const [name, ...values] = column;

        if (data.types[name] === X_AXIS_TYPE) {
            return;
        }

        const currentMaxValue = getMaxValueFromArray(values);

        return maxValue > currentMaxValue ? maxValue : currentMaxValue;
    }, 0);
};

export const getScale = (data, elementWidth, elementHeight) => {
    const column = (data.columns || []).find(
        column => data.types[column[0]] !== X_AXIS_TYPE) || [];

    return {
        scaleX: elementWidth / column.length,
        scaleY: elementHeight / getMaxValueFromColumns(data),
    };
};
