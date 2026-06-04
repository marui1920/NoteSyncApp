import 'react-native-url-polyfill/auto';

import {StatusBar, useColorScheme} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import {NotesScreen} from './src/features/notes/NotesScreen';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <NotesScreen />
    </SafeAreaProvider>
  );
}

export default App;
