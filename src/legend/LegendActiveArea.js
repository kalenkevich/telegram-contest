import { getScale, isLineIntersectRectangle, throttle, hexToRgb } from '../utils';
import { THROTTLE_TIME_FOR_MOUSE_MOVE } from '../contansts';
import CanvasComponent from '../base/CanvasComponent';
import DataChangeEvent from '../base/DataChangeEvent';

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
        this.prevState = { ...this.state };

        this.onMouseDown = throttle(this.onMouseDown.bind(this), THROTTLE_TIME_FOR_MOUSE_MOVE);
        this.onMouseMove = throttle(this.onMouseMove.bind(this), THROTTLE_TIME_FOR_MOUSE_MOVE);
        this.element.addEventListener("mousedown", this.onMouseDown);
        this.element.addEventListener("touchstart", this.onMouseDown, { passive: true });
        this.element.addEventListener("mousemove", this.onMouseMove);

        this.onActiveDataChange(DataChangeEvent.EventTypes.STRETCHED);
    }

    destroy() {
        this.element.removeEventListener("mousedown", this.onMouseDown);
        this.element.removeEventListener("touchstart", this.onMouseDown, { passive: true });
        this.element.removeEventListener("mousemove", this.onMouseMove);
    }

    onMouseMove(event) {
        const {
            isLeftBorder,
            isRightBorder,
            isPreviewArea,
        } = ChartLegendActiveArea.getMouseAlignmentData(this.state.pos, this.state.dim, this.element, event, this.props.options);

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
        } = ChartLegendActiveArea.getMouseAlignmentData(this.state.pos, this.state.dim, this.element, event, this.props.options);

        if (isLeftBorder) {
            const onMouseMove = throttle((event) => {
                const { pageX } = ChartLegendActiveArea.getPageCoors(event);
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
                this.onActiveDataChange(DataChangeEvent.EventTypes.STRETCHED);
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
                const { pageX } = ChartLegendActiveArea.getPageCoors(event);
                let newPosX = pageX - this.element.offsetLeft;

                if (newPosX < this.state.pos.x + legendActiveAreaStretchBorderWidth * 3) {
                    newPosX = this.state.pos.x + legendActiveAreaStretchBorderWidth * 3;
                }

                if (newPosX > this.element.width) {
                    newPosX = this.element.width;
                }

                this.state.dim.width = newPosX - this.state.pos.x;
                this.onActiveDataChange(DataChangeEvent.EventTypes.STRETCHED);
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
                const { pageX } = ChartLegendActiveArea.getPageCoors(event);
                this.state.pos.x = pageX - this.element.offsetLeft - grabOffset.x;

                if (this.state.pos.x < 0) {
                    this.state.pos.x = 0;
                }

                if (this.state.pos.x + this.state.dim.width > this.element.width / pixelRatio) {
                    this.state.pos.x = this.element.width / pixelRatio - this.state.dim.width;
                }

                this.onActiveDataChange(DataChangeEvent.EventTypes.SHIFTED);
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

    onDataChanged(event) {
        this.state.data = event.data;

        this.onActiveDataChange(event.type);

        this.prevState.data = this.state.data;
    }

    onActiveDataChange(eventType) {
        this.rerender();

        const newData = {
            ...this.state.data,
            columns: ChartLegendActiveArea.getActiveColumns(this.state.data, this.state.pos, this.state.dim, this.element, this.props),
        };

        this.props.onDataChange(new DataChangeEvent(eventType, newData, this.state.data));

        this.prevState.pos = this.state.pos;
        this.prevState.dim = this.state.dim;
    }

    render() {
        super.render();

        ChartLegendActiveArea.renderActiveArea(this.state.pos, this.state.dim, this.context, this.props.options);
        ChartLegendActiveArea.renderOverlay(this.state.pos, this.state.dim, this.element, this.context, this.props.options);
    }

    static getPageCoors(event) {
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

    static getMouseAlignmentData(pos, dim, element, event, options) {
        const { pageX, pageY } = ChartLegendActiveArea.getPageCoors(event);
        const { legend, pixelRatio } = options;
        const grabOffset = {
            x: pageX - element.offsetLeft - pos.x,
            y: pageY - element.offsetTop - pos.y,
        };

        const isLeftBorder = grabOffset.x >= 0
            && grabOffset.x <= legend.activeArea.stretchBorderWidth
            && grabOffset.y >= 0
            && grabOffset.y <= dim.height * pixelRatio;

        const isRightBorder = grabOffset.x <= dim.width
            && dim.width - grabOffset.x <= legend.activeArea.stretchBorderWidth
            && grabOffset.y >= 0
            && grabOffset.y <= dim.height * pixelRatio;

        const isPreviewArea = grabOffset.x >= legend.activeArea.stretchBorderWidth
            && grabOffset.x <= dim.width - legend.activeArea.stretchBorderWidth
            && grabOffset.y >= 0
            && grabOffset.y <= dim.height * pixelRatio;

        return {
            grabOffset,
            isLeftBorder,
            isRightBorder,
            isPreviewArea,
        };
    }

    static getActiveColumns(data, position, dimension, element, props) {
        const { axis: { xAxisType }, pixelRatio } = props.options;
        const { scaleX, scaleY } = getScale(data, element.width, element.height, xAxisType);
        let xAxisColumnIndex = null;
        let xAxisNewColumnIndex = null;
        let isXAxisColumnFinished = false;

        return (data.columns || []).reduce((newColumns, column, index) => {
            const name = column[0];

            if (name === xAxisType) {
                newColumns.push([name]);
                xAxisColumnIndex = index;
                xAxisNewColumnIndex = newColumns.length - 1;

                return newColumns;
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

            return newColumns;
        }, []);
    }

    static renderActiveArea(pos, dim, context, options) {
        const { primaryChartColor, pixelRatio, legend } = options;
        const legendActiveAreaStretchBorderWidth = legend.activeArea.stretchBorderWidth;
        const rbgColor = hexToRgb(primaryChartColor);
        const rgbaStyle = `rgba(${rbgColor.r}, ${rbgColor.g}, ${rbgColor.b}, 1)`;

        context.fillStyle = rgbaStyle;
        context.strokeStyle = rgbaStyle;
        context.strokeRect(
            pos.x * pixelRatio,
            pos.y * pixelRatio,
            dim.width * pixelRatio,
            dim.height * pixelRatio,
        );
        context.fillRect(
            pos.x * pixelRatio,
            pos.y * pixelRatio,
            legendActiveAreaStretchBorderWidth * pixelRatio,
            dim.height * pixelRatio,
        );
        context.fillRect(
            (pos.x + dim.width - legendActiveAreaStretchBorderWidth)  * pixelRatio,
            pos.y * pixelRatio,
            legendActiveAreaStretchBorderWidth * pixelRatio,
            dim.height * pixelRatio,
        );
    }

    static renderOverlay(pos, dim, element, context, options) {
        const { pixelRatio, legend: { overlayColor } } = options;
        const rbgColor = hexToRgb(overlayColor);

        context.fillStyle = `rgba(${rbgColor.r}, ${rbgColor.g}, ${rbgColor.b}, 0.5)`;
        context.fillRect(0, 0, pos.x * pixelRatio, element.height);
        context.fillRect((pos.x + dim.width) * pixelRatio, 0, element.width, element.height);
    }
}
