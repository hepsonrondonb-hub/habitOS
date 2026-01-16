import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { colors } from '../../tokens';
import { AppText } from '../AppText';

interface CircularProgressProps {
    size?: number;
    strokeWidth?: number;
    progress: number; // 0 to 100
    color?: string;
    showText?: boolean;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export const CircularProgress: React.FC<CircularProgressProps> = ({
    size = 120,
    strokeWidth = 10,
    progress,
    color = colors.primary,
    showText = true,
}) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const animatedValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(animatedValue, {
            toValue: progress, // precise value
            duration: 1000,
            useNativeDriver: true,
            easing: Easing.out(Easing.cubic),
        }).start();
    }, [progress]);

    // Stroke Dashoffset interpolation
    // progress 0 -> offset = circumference
    // progress 100 -> offset = 0
    const strokeDashoffset = animatedValue.interpolate({
        inputRange: [0, 100],
        outputRange: [circumference, 0],
    });

    return (
        <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
            <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
                    {/* Background Track */}
                    <Circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={colors.surface} // Or a lighter shade of primary?
                        strokeWidth={strokeWidth}
                        fill="transparent"
                        strokeOpacity={0.3} // Make it subtle if surface is dark, or gray if light
                    />
                    {/* Progress Circle */}
                    <AnimatedCircle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={color}
                        strokeWidth={strokeWidth}
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                    />
                </G>
            </Svg>

            {showText && (
                <View style={styles.textContainer}>
                    <AppText variant="heading" style={{ fontSize: size * 0.25, color: colors.textPrimary }}>
                        {Math.round(progress)}%
                    </AppText>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    textContainer: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
