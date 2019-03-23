import { animate, hexToRgb } from '../utils';
import Axis from '../objects/Axis';
import AnimationEffects from '../animation/Effects';
import CanvasComponent from '../base/CanvasComponent';

export default class ChartGrid extends CanvasComponent {
    init() {
        const { axes } = this.props;

        this.state = { axes };
        this.prevState = { axes: null };
    }

    get canAnimate() {
        return this.prevState.axes !== this.state.axes;
    }

    onAxesChanged(axes) {
        this.state.axes = axes;
    }

    render() {
        super.render();

        if (this.state.isAnimationInProgress) {
            return;
        }

        this.canAnimate ? this.renderWithAnimation() : this.renderWithoutAnimation();
    }

    renderWithAnimation() {
        const {
            animationDuration,
            animationType,
        } = this.props;
        const delta = 400;

        animate({
            onAnimationStarted: () => this.state.isAnimationInProgress = true,
            onAnimationFinished: () => {
                this.state.isAnimationInProgress = false;
                this.prevState.axes = this.state.axes;
            },
            duration: animationDuration,
            timing: (timeFraction) => {
                const { axes } = this.prevState;
                const progress = AnimationEffects[animationType](timeFraction);
                const prevXAxis = new Axis('x');
                const currentXAxis = new Axis('x');
                const prevYAxis = new Axis('y');
                const currentYAxis = new Axis('y');

                ((axes && axes.y.scales) || []).forEach((scale) => {
                    prevYAxis.addScale(scale.value, scale.x, scale.y + (delta * progress));
                });

                ((this.state.axes.y.scales) || []).forEach((scale) => {
                    currentYAxis.addScale(scale.value, scale.x, scale.y - delta + (delta * progress));
                });

                ((axes && axes.x.scales) || []).forEach((scale) => {
                    prevXAxis.addScale(scale.value, scale.x + (delta * progress), scale.y);
                });

                ((this.state.axes.x.scales) || []).forEach((scale) => {
                    currentXAxis.addScale(scale.value, scale.x - delta + (delta * progress), scale.y);
                });

                return {
                    currentXAxis,
                    prevXAxis,
                    currentYAxis,
                    prevYAxis,
                    progress,
                    originalAxis: this.state.axes.y,
                };
            },
            draw: ({ currentXAxis, prevXAxis, currentYAxis, prevYAxis, originalAxis, progress }) => {
                this.rerender();

                const {
                    lineWidth,
                    options: {
                        textColor,
                        primaryChartColor,
                        pixelRatio,
                        axis,
                    },
                } = this.props;
                const colorRGB = hexToRgb(textColor);

                this.context.strokeStyle = primaryChartColor;
                this.context.font = `${axis.fontSize * pixelRatio}px Arial`;
                this.context.lineWidth = lineWidth * pixelRatio;

                this.context.fillStyle = `rgba(${colorRGB.r}, ${colorRGB.g}, ${colorRGB.b}, ${(1 - progress).toFixed(2)})`;
                (prevXAxis.scales || []).forEach((scale) => {
                    this.context.fillText(scale.value, scale.x - 40, scale.y - 10);
                });

                (prevYAxis.scales || []).forEach((scale) => {
                    this.context.fillText(scale.value, scale.x + 10, scale.y - 10);
                });

                this.context.fillStyle = `rgba(${colorRGB.r}, ${colorRGB.g}, ${colorRGB.b}, ${(progress).toFixed(2)})`;
                (currentXAxis.scales || []).forEach((scale) => {
                    this.context.fillText(scale.value, scale.x - 40, scale.y - 10);
                });
                (currentYAxis.scales || []).forEach((scale) => {
                    this.context.fillText(scale.value, scale.x + 10, scale.y - 10);
                });

                (originalAxis.scales || []).forEach((scale) => {
                    const path = new Path2D();

                    path.moveTo(0, scale.y);
                    path.lineTo(this.element.width, scale.y);

                    this.context.stroke(path);
                });
            },
        });
    }

    renderWithoutAnimation() {
        this.renderXAxis(this.state.axes.x);
        this.renderYAxis(this.state.axes.y);
    }

    renderXAxis(xAxis) {
        const {
            lineWidth,
            options: {
                textColor,
                primaryChartColor,
                pixelRatio,
                axis,
            },
        } = this.props;
        this.context.fillStyle = textColor;
        this.context.strokeStyle = primaryChartColor;
        this.context.font = `${axis.fontSize * pixelRatio}px Arial`;
        this.context.lineWidth = lineWidth * pixelRatio;

        (xAxis.scales || []).forEach((scale) => {
            this.context.fillText(scale.value, scale.x - 40, scale.y - 10);
        });
    }

    renderYAxis(yAxis) {
        const {
            lineWidth,
            options: {
                textColor,
                primaryChartColor,
                pixelRatio,
                axis,
            },
        } = this.props;
        this.context.fillStyle = textColor;
        this.context.font = `${axis.fontSize * pixelRatio}px Arial`;
        this.context.lineWidth = lineWidth * pixelRatio;

        (yAxis.scales || []).forEach((scale) => {
            const path = new Path2D();

            path.moveTo(0, scale.y);
            path.lineTo(this.element.width, scale.y);

            this.context.fillText(scale.value, scale.x + 10, scale.y - 10);
            this.context.strokeStyle = primaryChartColor;
            this.context.stroke(path);
        });
    }
}
