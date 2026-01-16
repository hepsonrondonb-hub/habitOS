import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { colors } from '../../tokens';

interface AvitioLogoProps {
    width?: number;
    height?: number;
    withText?: boolean;
}

export const AvitioLogo: React.FC<AvitioLogoProps> = ({ width = 48, height = 48, withText = false }) => {
    // Stylized "A" curve approximating the logo
    // It's like a wave or mountain peak.
    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Svg width={width} height={height} viewBox="0 0 100 100" fill="none">
                <Defs>
                    <LinearGradient id="logoGrad" x1="0" y1="100" x2="100" y2="0">
                        <Stop offset="0%" stopColor="#748D96" />
                        <Stop offset="100%" stopColor="#A7C7BD" />
                    </LinearGradient>
                </Defs>
                {/* 
                   Approximation of the logo paths:
                   Two main strokes forming an A without the crossbar, curved.
                   1. Left stroke: Bottom left curving up to peak.
                   2. Right stroke: Peak extending down to right, with a soft wave.
                 */}
                <Path
                    d="M20 80 Q 40 40 50 20 Q 60 40 80 50" // Simplified single stroke? The image has two distinct overlapping curves or one continuous ribbon.
                    // Let's try a ribbon shape.
                    // Ribbon starting bottom left, going up, looping/peaking, and coming down right.
                    d="M15 85 C 35 45, 45 15, 65 35 C 75 45, 85 85, 85 85"
                    stroke="url(#logoGrad)"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                {/* Second curve to complete the "A" feel implies a crossover or parallel flow.
                     The logo image shows a loop. Let's try to mimic the "A" shape with a dynamic curve.
                     Peak at top center. Legs at bottom.
                 */}
                <Path
                    d="M25 80 C 40 30, 50 10, 80 40" // Left leg to right shoulder
                    stroke="#5F7D88"
                    strokeWidth="10"
                    strokeLinecap="round"
                    opacity={0.8}
                />
                <Path
                    d="M45 35 C 60 20, 80 50, 85 75" // Crossing over down to right
                    stroke="#A7C7BD"
                    strokeWidth="10"
                    strokeLinecap="round"
                />
            </Svg>
            {withText && (
                <View>
                    {/* Placeholder for text if needed inside component, usually handled outside */}
                </View>
            )}
        </View>
    );
};
