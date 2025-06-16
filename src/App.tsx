import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import UserStats from './pages/UserStats';
import Layout from './components/Layout';

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/user/:username" element={<UserStats />} />
      </Route>
    </Routes>
  );
}

export default App;