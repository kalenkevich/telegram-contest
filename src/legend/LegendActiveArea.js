import {
    pixelRatio,
    legendWidth,
    legendHeight,
    primaryChartColor,
    legendActiveAreaDefaultWidth,
    legendActiveAreaStretchBorderWidth,
    X_AXIS_TYPE,
} from '../contansts';
import { getScale, isLineIntersectRectangle } from '../utils';
import CanvasComponent from '../base/CanvasComponent';

/**
 * Class which manage active view of legend of the Chart
 */
export default class ChartLegendActiveArea extends CanvasComponent {
    init() {
        this.data = this.props.data;
        this.dim = {
            width: legendActiveAreaDefaultWidth,
            height: legendHeight,
        };
        this.pos = {
            x: legendWidth - legendActiveAreaDefaultWidth,
            y: 0,
        };
        this.offset = {
            left: this.element.offsetLeft,
            top: this.element.offsetTop,
            width: this.element.offsetWidth,
            height: this.element.offsetHeight,
        };

        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.element.addEventListener("mousedown", this.onMouseDown);
        this.element.addEventListener("mousemove", this.onMouseMove);

        this.onActiveDataChange();
    }

    getMouseAlignmentData(pageX, pageY) {
        const grabOffset = {
            x: pageX - this.offset.left - this.pos.x,
            y: pageY - this.offset.top - this.pos.y,
        };

        const isLeftBorder = grabOffset.x >= 0
            && grabOffset.x <= legendActiveAreaStretchBorderWidth
            && grabOffset.y >= 0
            && grabOffset.y <= this.dim.height;

        const isRightBorder = grabOffset.x <= this.dim.width
            && this.dim.width - grabOffset.x <= legendActiveAreaStretchBorderWidth
            && grabOffset.y >= 0
            && grabOffset.y <= this.dim.height;

        const isPreviewArea = grabOffset.x >= legendActiveAreaStretchBorderWidth
            && grabOffset.x <= this.dim.width - legendActiveAreaStretchBorderWidth
            && grabOffset.y >= 0
            && grabOffset.y <= this.dim.height;

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
        const {
            grabOffset,
            isLeftBorder,
            isRightBorder,
            isPreviewArea,
        } = this.getMouseAlignmentData(event.pageX, event.pageY);

        if (isLeftBorder) {
            const onMouseMove = (event) => {
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
            };

            this.element.addEventListener("mousemove", onMouseMove);
            this.element.addEventListener("mouseup", () => {
                this.element.removeEventListener('mousemove', onMouseMove);
            });
        } else if (isRightBorder) {
            const onMouseMove = (event) => {
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
            };

            this.element.addEventListener("mousemove", onMouseMove);
            this.element.addEventListener("mouseup", () => {
                this.element.removeEventListener('mousemove', onMouseMove);
            });
        } else if (isPreviewArea) {
            const onMouseMove = (event) => {
                const pageX = event.pageX;
                this.pos.x = pageX - this.offset.left - grabOffset.x;

                if (this.pos.x < 0) {
                    this.pos.x = 0;
                }

                if (this.pos.x + this.dim.width > this.element.width / pixelRatio) {
                    this.pos.x = this.element.width / pixelRatio - this.dim.width;
                }

                this.onActiveDataChange();
            };
            this.element.addEventListener("mousemove", onMouseMove);
            this.element.addEventListener("mouseup", () => {
                this.element.removeEventListener('mousemove', onMouseMove);
            });
        }
    }

    getActiveColumns(data, position, dimension) {
        const newColumns = [];
        const { scaleX, scaleY } = getScale(data, this.element.width, this.element.height);

        (data.columns || []).forEach((column, index) => {
            const name = column[0];

            if (name === X_AXIS_TYPE) {
                newColumns.push(column);

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
                }
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

        this.context.strokeRect(
            this.pos.x * pixelRatio,
            this.pos.y * pixelRatio,
            this.dim.width * pixelRatio,
            this.dim.height * pixelRatio,
        );

        const fillStyle = this.context.fillStyle;
        this.context.fillStyle = primaryChartColor;
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
        this.context.fillStyle = fillStyle;
    }
}
