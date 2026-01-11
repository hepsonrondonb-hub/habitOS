import { registerRootComponent } from 'expo';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation';
import { HabitProvider } from './src/store/HabitContext';

import { AuthProvider } from './src/store/AuthContext';
import { OnboardingProvider } from './src/store/OnboardingContext';

import { ErrorBoundary } from './src/components/ErrorBoundary';

export default function App() {
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <AuthProvider>
          <OnboardingProvider>
            <HabitProvider>
              <RootNavigator />
            </HabitProvider>
          </OnboardingProvider>
        </AuthProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

registerRootComponent(App);
