import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { colors } from '../../tokens';

interface DividerProps extends ViewProps {
    color?: string;
    vertical?: boolean;
}

export const Divider: React.FC<DividerProps> = ({
    style,
    color = colors.divider,
    vertical = false,
    ...props
}) => {
    return (
        <View
            style={[
                vertical ? { width: 1, height: '100%' } : { height: 1, width: '100%' },
                { backgroundColor: color },
                style
            ]}
            {...props}
        />
    );
};
