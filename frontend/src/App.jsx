import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomeComponent from './HomeComponent';
import RegionComponent from './RegionComponent';
import ProvinceComponent from './ProvinceComponent'
import CityComponent from './CityComponent';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomeComponent />} />
        <Route path="/region-price" element={<RegionComponent />} />
        <Route path="/province-price" element={<ProvinceComponent />} />
        <Route path="/city-price" element={<CityComponent />} />
      </Routes>
    </Router>
  );
}

export default App;

