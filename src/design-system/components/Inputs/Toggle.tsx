import React from 'react';
import { Switch, SwitchProps, Platform } from 'react-native';
import { colors } from '../../tokens';

export const Toggle: React.FC<SwitchProps> = (props) => {
    return (
        <Switch
            trackColor={{ false: colors.disabled, true: colors.primary }}
            thumbColor={colors.surface}
            ios_backgroundColor={colors.disabled}
            {...props}
        />
    );
};
