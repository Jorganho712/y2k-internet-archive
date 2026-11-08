import { PrefsProvider } from './lib/prefs';
import { Shell } from './components/Shell';
import { IconDefs } from './components/Icon';

export default function App() {
  return (
    <PrefsProvider>
      <IconDefs />
      <Shell />
    </PrefsProvider>
  );
}
