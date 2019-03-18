import { getScale, isLineIntersectRectangle, throttle, hexToRgb } from '../utils';
import { THROTTLE_TIME_FOR_MOUSE_MOVE } from '../contansts';
import CanvasComponent from '../base/CanvasComponent';

/**
 * Class which manage active view of legend of the Chart
 */
export default class ChartLegendActiveArea extends CanvasComponent {
    init() {
        const { legend } = this.props.options;
        this.data = this.props.data;
        this.dim = {
            width: legend.activeArea.defaultWidth,
            height: legend.height,
        };
        this.pos = {
            x: legend.width - legend.activeArea.defaultWidth,
            y: 0,
        };
        this.offset = {
            left: this.element.offsetLeft,
            top: this.element.offsetTop,
            width: this.element.offsetWidth,
            height: this.element.offsetHeight,
        };

        this.onMouseDown = throttle(this.onMouseDown.bind(this), THROTTLE_TIME_FOR_MOUSE_MOVE);
        this.onMouseMove = throttle(this.onMouseMove.bind(this), THROTTLE_TIME_FOR_MOUSE_MOVE);
        this.element.addEventListener("mousedown", this.onMouseDown);
        this.element.addEventListener("mousemove", this.onMouseMove);

        this.onActiveDataChange();
    }

    getMouseAlignmentData(pageX, pageY) {
        const { legend, pixelRatio } = this.props.options;
        const grabOffset = {
            x: pageX - this.offset.left - this.pos.x,
            y: pageY - this.offset.top - this.pos.y,
        };

        const isLeftBorder = grabOffset.x >= 0
            && grabOffset.x <= legend.activeArea.stretchBorderWidth
            && grabOffset.y >= 0
            && grabOffset.y <= this.dim.height * pixelRatio;

        const isRightBorder = grabOffset.x <= this.dim.width
            && this.dim.width - grabOffset.x <= legend.activeArea.stretchBorderWidth
            && grabOffset.y >= 0
            && grabOffset.y <= this.dim.height * pixelRatio;

        const isPreviewArea = grabOffset.x >= legend.activeArea.stretchBorderWidth
            && grabOffset.x <= this.dim.width - legend.activeArea.stretchBorderWidth
            && grabOffset.y >= 0
            && grabOffset.y <= this.dim.height * pixelRatio;

        return {
            grabOffset,
            isLeftBorder,
            isRightBorder,
            isPreviewArea,
        };
    }

    onMouseMove(event) {
        const {
            isLeftBorder,
            isRightBorder,
            isPreviewArea,
        } = this.getMouseAlignmentData(event.pageX, event.pageY);

        if (isPreviewArea) {
            this.element.style.cursor = 'pointer';
        } else if (isLeftBorder || isRightBorder) {
            this.element.style.cursor = 'ew-resize';
        } else {
            this.element.style.cursor = 'default';
        }
    }

    onMouseDown(event) {
        const { legend, pixelRatio } = this.props.options;
        const legendActiveAreaStretchBorderWidth = legend.activeArea.stretchBorderWidth;
        const {
            grabOffset,
            isLeftBorder,
            isRightBorder,
            isPreviewArea,
        } = this.getMouseAlignmentData(event.pageX, event.pageY);

        if (isLeftBorder) {
            const onMouseMove = throttle((event) => {
                const pageX = event.pageX;
                let newPosX = pageX - this.offset.left - grabOffset.x;

                if (newPosX < 0) {
                    newPosX = 0;
                }

                if (newPosX > this.pos.x + this.dim.width - legendActiveAreaStretchBorderWidth * 3) {
                    newPosX = this.dim.width + this.pos.x - legendActiveAreaStretchBorderWidth * 3;
                }

                if (newPosX + this.dim.width > this.element.width) {
                    newPosX = this.element.width - this.dim.width;
                }

                this.dim.width += this.pos.x - newPosX;
                this.pos.x = newPosX;
                this.onActiveDataChange();
            }, THROTTLE_TIME_FOR_MOUSE_MOVE);

            this.element.addEventListener("mousemove", onMouseMove);
            this.element.addEventListener("mouseup", () => {
                this.element.removeEventListener('mousemove', onMouseMove);
            });
        } else if (isRightBorder) {
            const onMouseMove = throttle((event) => {
                const pageX = event.pageX;
                let newPosX = pageX - this.offset.left;

                if (newPosX < this.pos.x + legendActiveAreaStretchBorderWidth * 3) {
                    newPosX = this.pos.x + legendActiveAreaStretchBorderWidth * 3;
                }

                if (newPosX > this.element.width) {
                    newPosX = this.element.width;
                }

                this.dim.width = newPosX - this.pos.x;
                this.onActiveDataChange();
            }, THROTTLE_TIME_FOR_MOUSE_MOVE);

            this.element.addEventListener("mousemove", onMouseMove);
            this.element.addEventListener("mouseup", () => {
                this.element.removeEventListener('mousemove', onMouseMove);
            });
        } else if (isPreviewArea) {
            const onMouseMove = throttle((event) => {
                const pageX = event.pageX;
                this.pos.x = pageX - this.offset.left - grabOffset.x;

                if (this.pos.x < 0) {
                    this.pos.x = 0;
                }

                if (this.pos.x + this.dim.width > this.element.width / pixelRatio) {
                    this.pos.x = this.element.width / pixelRatio - this.dim.width;
                }

                this.onActiveDataChange();
            }, THROTTLE_TIME_FOR_MOUSE_MOVE);
            this.element.addEventListener("mousemove", onMouseMove);
            this.element.addEventListener("mouseup", () => {
                this.element.removeEventListener('mousemove', onMouseMove);
            });
        }
    }

    getActiveColumns(data, position, dimension) {
        const newColumns = [];
        const { axis: { xAxisType }, pixelRatio } = this.props.options;
        const { scaleX, scaleY } = getScale(data, this.element.width, this.element.height, xAxisType);
        let xAxisColumnIndex = null;
        let xAxisNewColumnIndex = null;
        let isXAxisColumnFinished = false;

        (data.columns || []).forEach((column, index) => {
            const name = column[0];

            if (name === xAxisType) {
                newColumns.push([name]);
                xAxisColumnIndex = index;
                xAxisNewColumnIndex = newColumns.length - 1;

                return;
            }

            newColumns.push([name]);

            for (let i = 1; i < column.length;) {
                const isIntersectRectangle = isLineIntersectRectangle(
                    i * scaleX,
                    column[i] * scaleY,
                    ++i * scaleX,
                    column[i] * scaleY,
                    position.x * pixelRatio,
                    position.y * pixelRatio,
                    (position.x + dimension.width) * pixelRatio,
                    (position.y + dimension.height) * pixelRatio,
                );

                if (isIntersectRectangle) {
                    newColumns[index].push(column[i]);

                    if (xAxisColumnIndex !== null && !isXAxisColumnFinished) {
                        newColumns[xAxisNewColumnIndex].push(data.columns[xAxisColumnIndex][i]);
                    }
                }
            }

            if (xAxisColumnIndex !== null && !isXAxisColumnFinished) {
                isXAxisColumnFinished = true;
            }
        });

        return newColumns;
    }

    onDataChanged(data) {
        this.data = data;
        this.onActiveDataChange();
    }

    onActiveDataChange() {
        this.rerender();
        const activeData = {
            ...this.data,
            columns: this.getActiveColumns(this.data, this.pos, this.dim),
        };

        this.props.onDataChange(activeData);
    }

    render() {
        super.render();

        this.renderActiveArea();
        this.renderOverlay();
    }

    renderActiveArea() {
        const {
            primaryChartColor,
            pixelRatio,
            legend,
        } = this.props.options;
        const legendActiveAreaStretchBorderWidth = legend.activeArea.stretchBorderWidth;
        const rbgColor = hexToRgb(primaryChartColor);
        const rgbaStyle = `rgba(${rbgColor.r}, ${rbgColor.g}, ${rbgColor.b}, 1)`;

        this.context.fillStyle = rgbaStyle;
        this.context.strokeStyle = rgbaStyle;
        this.context.strokeRect(
            this.pos.x * pixelRatio,
            this.pos.y * pixelRatio,
            this.dim.width * pixelRatio,
            this.dim.height * pixelRatio,
        );
        this.context.fillRect(
            this.pos.x * pixelRatio,
            this.pos.y * pixelRatio,
            legendActiveAreaStretchBorderWidth * pixelRatio,
            this.dim.height * pixelRatio,
        );
        this.context.fillRect(
            (this.pos.x + this.dim.width - legendActiveAreaStretchBorderWidth)  * pixelRatio,
            this.pos.y * pixelRatio,
            legendActiveAreaStretchBorderWidth * pixelRatio,
            this.dim.height * pixelRatio,
        );
    }

    renderOverlay() {
        const { pixelRatio, legend: { overlayColor } } = this.props.options;
        const rbgColor = hexToRgb(overlayColor);

        this.context.fillStyle = `rgba(${rbgColor.r}, ${rbgColor.g}, ${rbgColor.b}, 0.5)`;
        this.context.fillRect(
            0,
            0,
            this.pos.x * pixelRatio,
            this.element.height,
        );
        this.context.fillRect(
            (this.pos.x + this.dim.width) * pixelRatio,
            0,
            this.element.width,
            this.element.height,
        );
    }
}
