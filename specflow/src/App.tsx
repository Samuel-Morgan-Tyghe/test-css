import SpecTree from './components/SpecTree';
import StageTabs from './components/StageTabs';
import StageEditor from './components/StageEditor';
import './App.css';

function App() {
  return (
    <div className="app">
      <SpecTree />
      <main className="app__main">
        <header className="app__header">
          <div className="app__logo">
            <span className="app__logo-icon">◈</span>
            <span className="app__logo-text">SpecFlow</span>
          </div>
          <span className="app__tagline">Spec-driven development platform</span>
        </header>
        <StageTabs />
        <StageEditor />
      </main>
    </div>
  );
}

export default App;
