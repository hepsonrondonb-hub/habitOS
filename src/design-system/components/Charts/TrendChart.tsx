import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle, Text as SvgText } from 'react-native-svg';
import * as d3 from 'd3-shape';
import { colors, spacing } from '../../tokens';
import { AppText } from '../AppText';

interface TrendChartProps {
    data: number[];
    labels?: string[]; // Axis labels
    width?: number;
    height?: number;
    color?: string;
}

export const TrendChart: React.FC<TrendChartProps> = ({
    data = [],
    labels = ['DIA 1', 'DIA 14'],
    width = Dimensions.get('window').width - 48, // Padding handled by parent
    height = 200,
    color = colors.primary
}) => {
    const { path, area, lastPoint } = useMemo(() => {
        if (data.length === 0) return { path: '', area: '', lastPoint: null };

        const min = 1; // Explicit scale 1-5
        const max = 5;
        const range = max - min;

        const points: [number, number][] = data.map((value, index) => [
            (index / (data.length - 1)) * width,
            height - ((value - min) / (range)) * height // Leaving some padding top/bottom? No, image shows edge to edge
        ]);

        const maxX = data.length > 1 ? data.length - 1 : 1;

        const paddedHeight = height * 0.8;
        const verticalPadding = height * 0.1;

        const scaledPoints: [number, number][] = data.map((value, index) => {
            const safeValue = isNaN(value) ? min : value; // Fallback for safety
            return [
                (index / maxX) * width,
                height - verticalPadding - ((safeValue - min) / (range)) * paddedHeight
            ];
        });


        const lineGenerator = d3.line()
            .x(d => d[0])
            .y(d => d[1])
            .curve(d3.curveMonotoneX); // Very smooth

        const areaGenerator = d3.area()
            .x(d => d[0])
            .y0(height)
            .y1(d => d[1])
            .curve(d3.curveMonotoneX);

        return {
            path: lineGenerator(scaledPoints) || '',
            area: areaGenerator(scaledPoints) || '',
            lastPoint: scaledPoints[scaledPoints.length - 1]
        };
    }, [data, width, height]);

    return (
        <View style={styles.container}>
            <Svg width={width} height={height}>
                <Defs>
                    <LinearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="0" stopColor={color} stopOpacity="0.2" />
                        <Stop offset="1" stopColor={color} stopOpacity="0" />
                    </LinearGradient>
                </Defs>

                {/* Area Fill */}
                <Path
                    d={area}
                    fill="url(#gradient)"
                />

                {/* Line */}
                <Path
                    d={path}
                    stroke={color}
                    strokeWidth={3}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Last point dot */}
                {lastPoint && (
                    <Circle
                        cx={lastPoint[0]}
                        cy={lastPoint[1]}
                        r={4}
                        fill={color}
                        stroke={colors.surface}
                        strokeWidth={2}
                    />
                )}
            </Svg>

            {/* Labels */}
            <View style={[styles.labels, { width }]}>
                <AppText variant="caption" color={colors.textSecondary}>{labels[0]}</AppText>
                <AppText variant="caption" color={colors.textSecondary}>{labels[1]}</AppText>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginVertical: spacing.lg,
    },
    labels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: spacing.sm,
    }
});
