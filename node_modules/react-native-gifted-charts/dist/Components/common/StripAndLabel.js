import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { View } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import { getTopAndLeftForStripAndLabel, } from 'gifted-charts-core';
export var StripAndLabel = function (props) {
    var _a;
    var pointerX = props.pointerX, pointerLabelWidth = props.pointerLabelWidth, pointerRadius = props.pointerRadius, pointerWidth = props.pointerWidth, pointerYLocal = props.pointerYLocal, pointerStripUptoDataPoint = props.pointerStripUptoDataPoint, pointerStripHeight = props.pointerStripHeight, pointerItemLocal = props.pointerItemLocal, showPointerStrip = props.showPointerStrip, pointerStripWidth = props.pointerStripWidth, containerHeight = props.containerHeight, xAxisThickness = props.xAxisThickness, pointerStripColor = props.pointerStripColor, pointerConfig = props.pointerConfig, pointerLabelComponent = props.pointerLabelComponent, secondaryPointerItem = props.secondaryPointerItem, pointerItemsForSet = props.pointerItemsForSet, secondaryPointerItemsForSet = props.secondaryPointerItemsForSet, pointerEvents = props.pointerEvents, isBarChart = props.isBarChart, pointerIndex = props.pointerIndex, hasDataSet = props.hasDataSet;
    var _b = getTopAndLeftForStripAndLabel(props), top = _b.top, left = _b.left;
    if (isNaN(top) || typeof top !== 'number')
        return null;
    return (_jsxs(View, { style: {
            position: 'absolute',
            left: pointerX + (((_a = pointerItemLocal[0]) === null || _a === void 0 ? void 0 : _a.pointerShiftX) || 0),
            top: pointerYLocal,
        }, children: [(isBarChart
                ? showPointerStrip && !pointerLabelComponent
                : showPointerStrip) ? (_jsx(View, { style: {
                    position: 'absolute',
                    left: (pointerRadius || pointerWidth) - pointerStripWidth / 4,
                    top: pointerStripUptoDataPoint
                        ? pointerRadius || pointerStripHeight / 2
                        : -pointerYLocal + 8,
                    width: pointerStripWidth,
                    height: pointerStripUptoDataPoint
                        ? containerHeight - pointerYLocal + 5 - xAxisThickness
                        : pointerStripHeight,
                    marginTop: pointerStripUptoDataPoint
                        ? 0
                        : containerHeight - pointerStripHeight,
                }, children: _jsx(Svg, { children: _jsx(Line, { stroke: pointerStripColor, strokeWidth: pointerStripWidth, strokeDasharray: (pointerConfig === null || pointerConfig === void 0 ? void 0 : pointerConfig.strokeDashArray)
                            ? pointerConfig === null || pointerConfig === void 0 ? void 0 : pointerConfig.strokeDashArray
                            : '', x1: 0, y1: 0, x2: 0, y2: pointerStripUptoDataPoint
                            ? containerHeight - pointerYLocal + 5 - xAxisThickness
                            : pointerStripHeight }) }) })) : null, pointerLabelComponent ? (_jsx(View, { pointerEvents: pointerEvents !== null && pointerEvents !== void 0 ? pointerEvents : 'none', style: [
                    {
                        position: 'absolute',
                        left: left,
                        top: top,
                        marginTop: pointerStripUptoDataPoint
                            ? 0
                            : containerHeight - pointerStripHeight,
                        width: pointerLabelWidth,
                    },
                ], children: pointerLabelComponent === null || pointerLabelComponent === void 0 ? void 0 : pointerLabelComponent(hasDataSet ? pointerItemsForSet : pointerItemLocal, hasDataSet ? secondaryPointerItemsForSet : [secondaryPointerItem], pointerIndex) })) : null] }));
};
