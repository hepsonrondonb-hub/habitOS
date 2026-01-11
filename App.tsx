import { registerRootComponent } from 'expo';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation';
import { HabitProvider } from './src/store/HabitContext';

import { AuthProvider } from './src/store/AuthContext';
import { OnboardingProvider } from './src/store/OnboardingContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <OnboardingProvider>
          <HabitProvider>
            <RootNavigator />
          </HabitProvider>
        </OnboardingProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

registerRootComponent(App);
