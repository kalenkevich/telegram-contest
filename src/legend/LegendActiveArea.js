import { getScale, isLineIntersectRectangle, throttle, hexToRgb } from '../utils';
import { THROTTLE_TIME_FOR_MOUSE_MOVE } from '../contansts';
import CanvasComponent from '../base/CanvasComponent';

export default class ChartLegendActiveArea extends CanvasComponent {
    init() {
        const { legend } = this.props.options;
        this.state = {
            data: this.props.data,
            pos: {
                x: legend.width - legend.activeArea.defaultWidth,
                y: 0,
            },
            dim: {
                width: legend.activeArea.defaultWidth,
                height: legend.height,
            }
        };

        this.onMouseDown = throttle(this.onMouseDown.bind(this), THROTTLE_TIME_FOR_MOUSE_MOVE);
        this.onMouseMove = throttle(this.onMouseMove.bind(this), THROTTLE_TIME_FOR_MOUSE_MOVE);
        this.element.addEventListener("mousedown", this.onMouseDown);
        this.element.addEventListener("touchstart", this.onMouseDown, { passive: true });
        this.element.addEventListener("mousemove", this.onMouseMove);

        this.onActiveDataChange();
    }

    destroy() {
        this.element.removeEventListener("mousedown", this.onMouseDown);
        this.element.removeEventListener("touchstart", this.onMouseDown, { passive: true });
        this.element.removeEventListener("mousemove", this.onMouseMove);
    }

    getPageCoors(event) {
        if (event instanceof MouseEvent) {
            return {
                pageX: event.pageX,
                pageY: event.pageY,
            }
        }

        if (event instanceof TouchEvent) {
            return {
                pageX: event.changedTouches[0].pageX,
                pageY: event.changedTouches[0].pageY,
            };
        }
    }

    getMouseAlignmentData(event) {
        const { pageX, pageY } = this.getPageCoors(event);
        const { legend, pixelRatio } = this.props.options;
        const grabOffset = {
            x: pageX - this.element.offsetLeft - this.state.pos.x,
            y: pageY - this.element.offsetTop - this.state.pos.y,
        };

        const isLeftBorder = grabOffset.x >= 0
            && grabOffset.x <= legend.activeArea.stretchBorderWidth
            && grabOffset.y >= 0
            && grabOffset.y <= this.state.dim.height * pixelRatio;

        const isRightBorder = grabOffset.x <= this.state.dim.width
            && this.state.dim.width - grabOffset.x <= legend.activeArea.stretchBorderWidth
            && grabOffset.y >= 0
            && grabOffset.y <= this.state.dim.height * pixelRatio;

        const isPreviewArea = grabOffset.x >= legend.activeArea.stretchBorderWidth
            && grabOffset.x <= this.state.dim.width - legend.activeArea.stretchBorderWidth
            && grabOffset.y >= 0
            && grabOffset.y <= this.state.dim.height * pixelRatio;

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
        } = this.getMouseAlignmentData(event);

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
        } = this.getMouseAlignmentData(event);

        if (isLeftBorder) {
            const onMouseMove = throttle((event) => {
                const { pageX } = this.getPageCoors(event);
                let newPosX = pageX - this.element.offsetLeft - grabOffset.x;

                if (newPosX < 0) {
                    newPosX = 0;
                }

                if (newPosX > this.state.pos.x + this.state.dim.width - legendActiveAreaStretchBorderWidth * 3) {
                    newPosX = this.state.dim.width + this.state.pos.x - legendActiveAreaStretchBorderWidth * 3;
                }

                if (newPosX + this.state.dim.width > this.element.width) {
                    newPosX = this.element.width - this.state.dim.width;
                }

                this.state.dim.width += this.state.pos.x - newPosX;
                this.state.pos.x = newPosX;
                this.onActiveDataChange();
            }, THROTTLE_TIME_FOR_MOUSE_MOVE);

            this.element.addEventListener("mousemove", onMouseMove);
            this.element.addEventListener("touchmove", onMouseMove, { passive: true });
            this.element.addEventListener("mouseup", () => {
                this.element.removeEventListener('mousemove', onMouseMove);
                this.element.removeEventListener('touchmove', onMouseMove);
            });
            this.element.addEventListener("touchend", () => {
                this.element.removeEventListener('mousemove', onMouseMove);
                this.element.removeEventListener('touchmove', onMouseMove);
            });
        } else if (isRightBorder) {
            const onMouseMove = throttle((event) => {
                const { pageX } = this.getPageCoors(event);
                let newPosX = pageX - this.element.offsetLeft;

                if (newPosX < this.state.pos.x + legendActiveAreaStretchBorderWidth * 3) {
                    newPosX = this.state.pos.x + legendActiveAreaStretchBorderWidth * 3;
                }

                if (newPosX > this.element.width) {
                    newPosX = this.element.width;
                }

                this.state.dim.width = newPosX - this.state.pos.x;
                this.onActiveDataChange();
            }, THROTTLE_TIME_FOR_MOUSE_MOVE);

            this.element.addEventListener("mousemove", onMouseMove);
            this.element.addEventListener("touchmove", onMouseMove, { passive: true });
            this.element.addEventListener("mouseup", () => {
                this.element.removeEventListener('mousemove', onMouseMove);
                this.element.removeEventListener('touchmove', onMouseMove);
            });
            this.element.addEventListener("touchend", () => {
                this.element.removeEventListener('mousemove', onMouseMove);
                this.element.removeEventListener('touchmove', onMouseMove);
            });
        } else if (isPreviewArea) {
            const onMouseMove = throttle((event) => {
                const { pageX } = this.getPageCoors(event);
                this.state.pos.x = pageX - this.element.offsetLeft - grabOffset.x;

                if (this.state.pos.x < 0) {
                    this.state.pos.x = 0;
                }

                if (this.state.pos.x + this.state.dim.width > this.element.width / pixelRatio) {
                    this.state.pos.x = this.element.width / pixelRatio - this.state.dim.width;
                }

                this.onActiveDataChange();
            }, THROTTLE_TIME_FOR_MOUSE_MOVE);
            this.element.addEventListener("mousemove", onMouseMove);
            this.element.addEventListener("touchmove", onMouseMove, { passive: true });
            this.element.addEventListener("mouseup", () => {
                this.element.removeEventListener('mousemove', onMouseMove);
                this.element.removeEventListener('touchmove', onMouseMove);
            });
            this.element.addEventListener("touchend", () => {
                this.element.removeEventListener('mousemove', onMouseMove);
                this.element.removeEventListener('touchmove', onMouseMove);
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
        this.state.data = data;
        this.onActiveDataChange();
    }

    onActiveDataChange() {
        this.rerender();
        const activeData = {
            ...this.state.data,
            columns: this.getActiveColumns(this.state.data, this.state.pos, this.state.dim),
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
            this.state.pos.x * pixelRatio,
            this.state.pos.y * pixelRatio,
            this.state.dim.width * pixelRatio,
            this.state.dim.height * pixelRatio,
        );
        this.context.fillRect(
            this.state.pos.x * pixelRatio,
            this.state.pos.y * pixelRatio,
            legendActiveAreaStretchBorderWidth * pixelRatio,
            this.state.dim.height * pixelRatio,
        );
        this.context.fillRect(
            (this.state.pos.x + this.state.dim.width - legendActiveAreaStretchBorderWidth)  * pixelRatio,
            this.state.pos.y * pixelRatio,
            legendActiveAreaStretchBorderWidth * pixelRatio,
            this.state.dim.height * pixelRatio,
        );
    }

    renderOverlay() {
        const { pixelRatio, legend: { overlayColor } } = this.props.options;
        const rbgColor = hexToRgb(overlayColor);

        this.context.fillStyle = `rgba(${rbgColor.r}, ${rbgColor.g}, ${rbgColor.b}, 0.5)`;
        this.context.fillRect(
            0,
            0,
            this.state.pos.x * pixelRatio,
            this.element.height,
        );
        this.context.fillRect(
            (this.state.pos.x + this.state.dim.width) * pixelRatio,
            0,
            this.element.width,
            this.element.height,
        );
    }
}
