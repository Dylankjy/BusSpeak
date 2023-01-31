import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Ring from './pages/Ring';
import BusArrival from './pages/BusArrival';

function App() {

  return (
    <Router>
      <Routes>
        <Route exact path='/' element={<Home />} />
        <Route exact path='/ring' element={<Ring />} />
        <Route exact path='/busarrival' element={<BusArrival />} />
      </Routes>
    </Router>
  );
}

export default App;
