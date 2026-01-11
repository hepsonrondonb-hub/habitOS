import React, { useMemo } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import * as d3 from 'd3-shape';
import { colors } from '../../tokens';

interface SparklineProps {
    data: number[];
    width?: number;
    height?: number;
    color?: string;
    style?: ViewStyle;
}

export const Sparkline: React.FC<SparklineProps> = ({
    data = [],
    width = 100,
    height = 40,
    color = colors.primary,
    style
}) => {
    const path = useMemo(() => {
        if (data.length === 0) return '';

        // Normalize data to fit in height
        const min = Math.min(...data);
        const max = Math.max(...data);
        const range = max - min || 1; // Avoid divide by zero

        const maxX = data.length > 1 ? data.length - 1 : 1;

        // Map points to [x, y] coordinates
        // x: distributed evenly across width
        // y: scaled to height (inverted because SVG y=0 is top)
        const points: [number, number][] = data.map((value, index) => {
            const safeValue = isNaN(value) ? min : value;
            return [
                (index / maxX) * width,
                height - ((safeValue - min) / range) * height
            ];
        });

        const lineGenerator = d3.line()
            .x(d => d[0])
            .y(d => d[1])
            .curve(d3.curveBasis); // Smooth curve

        return lineGenerator(points) || '';
    }, [data, width, height]);

    return (
        <View style={[styles.container, style, { width, height }]}>
            <Svg width={width} height={height}>
                <Path
                    d={path}
                    stroke={color}
                    strokeWidth={2}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </Svg>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
    }
});
