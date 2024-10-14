import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { FiSearch } from "react-icons/fi";
import axiosInstance from '../axios';
import { useNavigate, useLocation  } from 'react-router-dom';


ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ProvinceComponent = () => {
  const useQuery = () => {
    return new URLSearchParams(useLocation().search);
  };
  const query = useQuery();
  const region = query.get('region');
  const province = query.get('province');
  const provinceName = query.get('name-province')
  const navigate = useNavigate();
  const [data, setData] = useState({
    labels: [],
    datasets: [{
      label: "Rent Price/Sell Price",
      data: [],
      backgroundColor: []
    }]
  });
  const [rentPrice, setRentPrice] = useState([]);
  const [sellPrice, setSellPrice] = useState([]);
  const [urlValues, setUrlValues] = useState("")
  const [deepValues, setDeepValues] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedRentPrice, setSelectedRentPrice] = useState(null);
  const [selectedSellPrice, setSelectedSellPrice] = useState(null);
  const [selectedValue, setSelectedValue] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [filteredCities, setFilteredCities] = useState([]);
  const [selectedBarIndex, setSelectedBarIndex] = useState(null);
  const [keyboardSelectedIndex, setKeyboardSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await axiosInstance.get(`province-prices/?region=${region}&province=${province}`);
        const apiData = response.data.values;
        const labels = apiData.map(item => item.name);
        const prices = apiData.map(item => item.ratio);
        setRentPrice(apiData.map(item => item.rent_price));
        setSellPrice(apiData.map(item => item.sell_price));
        setUrlValues(apiData.map(item => item.value));
        const backgroundColors = apiData.map(() => `rgba(75, 192, 192, 0.6)`);

        setData({
          labels: labels,
          datasets: [{
            label: "Rent Price/Sell Price",
            data: prices,
            backgroundColor: backgroundColors
          }]
        });
        setFilteredCities(labels);
      } catch (err) {
        setError("Failed to fetch data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: `Cities of ${provinceName}`,
      },
      tooltip: {
        callbacks: {
          label: (context) => `$${context.parsed.y.toLocaleString()}`,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          callback: function(value, index) {
            return this.getLabelForValue(value);
          },
          autoSkip: false,
          maxRotation: 90,
          minRotation: 90
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Price ($)",
        },
      },
    },
    onClick: (event, elements) => {
      const index = elements[0].index;
      const city = data.labels[index];
      const checkDeep = async () => {
        const response = await axiosInstance.get(`deep-values/?region=${region}&province=${province}&city=${urlValues[index]}`);
        setDeepValues(response.data); 
      }
      checkDeep();
      if (elements.length > 0) {
        setSelectedCity(city);
        setSelectedRentPrice(rentPrice[index]);
        setSelectedSellPrice(sellPrice[index]);
        setSelectedValue(urlValues[index]);
        setSelectedBarIndex(index);
      }
    },
    onHover: (event, chartElement) => {
      event.native.target.style.cursor = chartElement[0] ? "pointer" : "default";
    },
  };

  const handleSearch = (event) => {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);
    filterCities(term);
    setIsDropdownOpen(term.length > 0);
    setKeyboardSelectedIndex(-1);
  };

  const handleCitySelect = (city) => {
    setSearchTerm(city);
    setIsDropdownOpen(false);
    const index = data.labels.indexOf(city);
    if (index !== -1) {
      const checkDeep = async () => {
        const response = await axiosInstance.get(`deep-values/?region=${region}&province=${province}&city=${urlValues[index]}`);
        setDeepValues(response.data); 
      }
      checkDeep();
      setSelectedCity(city);
      setSelectedRentPrice(rentPrice[index]);
      setSelectedSellPrice(sellPrice[index]);
      setSelectedValue(urlValues[index]);
      setSelectedBarIndex(index);
    }
  };

  const filterCities = (term) => {
    const filtered = data.labels.filter(city => 
      city.toLowerCase().includes(term)
    );
    setFilteredCities(filtered);
  };

  const handleKeyDown = (event) => {
    if (!isDropdownOpen) return;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setKeyboardSelectedIndex(prevIndex => 
          prevIndex < filteredCities.length - 1 ? prevIndex + 1 : prevIndex
        );
        break;
      case "ArrowUp":
        event.preventDefault();
        setKeyboardSelectedIndex(prevIndex => 
          prevIndex > 0 ? prevIndex - 1 : 0
        );
        break;
      case "Enter":
        event.preventDefault();
        if (keyboardSelectedIndex >= 0 && keyboardSelectedIndex < filteredCities.length) {
          handleCitySelect(filteredCities[keyboardSelectedIndex]);
        }
        break;
      case "Escape":
        setIsDropdownOpen(false);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      setData((prevData) => ({
        ...prevData,
        datasets: [
          {
            ...prevData.datasets[0],
            barThickness: isMobile ? 10 : 20,
          },
        ],
      }));
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const newBackgroundColors = data.labels.map((_, index) =>
      index === selectedBarIndex ? "rgba(255, 99, 132, 1)" : "rgba(75, 192, 192, 0.6)"
    );
    setData(prevData => ({
      ...prevData,
      datasets: [{
        ...prevData.datasets[0],
        backgroundColor: newBackgroundColors
      }]
    }));
  }, [selectedBarIndex]);

  const handleCityValues = () => {
    navigate(`/city-price?region=${region}&city=${selectedValue}&name-city=${selectedCity}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-2xl font-bold text-indigo-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-2xl font-bold text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
        <header className="bg-indigo-600 text-white p-4 md:p-6">
        <a href="/"><h1 className="text-2xl md:text-3xl font-bold">Real Estate Italy Investment Advisor</h1></a>
        </header>
        <main className="p-4 md:p-6">
          <div className="mb-6 flex flex-wrap justify-between items-center">
            <div className="relative flex-grow md:max-w-xs">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search cities..."
                  value={searchTerm}
                  onChange={handleSearch}
                  onFocus={() => setIsDropdownOpen(searchTerm.length > 0)}
                  onKeyDown={handleKeyDown}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              {isDropdownOpen && searchTerm.length > 0 && (
                <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredCities.map((city, index) => (
                    <li
                      key={index}
                      className={`px-4 py-2 hover:bg-gray-100 cursor-pointer ${index === keyboardSelectedIndex ? "bg-blue-100" : ""}`}
                      onClick={() => handleCitySelect(city)}
                    >
                      {city}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="text-sm text-gray-600 mt-4 md:mt-0">
              Click on a bar or select a city for more details
            </div>
          </div>
          <div className="overflow-x-auto" style={{ width: "100%", height: "400px", transformOrigin: "top left" }}>
            <Bar
              data={data}
              options={options}
              aria-label="Bar graph showing average property prices in US cities"
            />
          </div>
          {selectedCity && (
            <div className="mt-6 p-4 bg-blue-100 rounded-lg">
              <h2 className="text-xl font-semibold mb-2">{selectedCity}</h2>
              <p className="text-lg">Average Rent Price: {selectedRentPrice} €/m²</p>
              <p className="text-lg">Average Sell Price: {selectedSellPrice} €/m²</p>
              {deepValues && (
                <button
                  onClick={handleCityValues}
                  className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors flex items-center"
                >
                  City Values
                </button>
              )}
            </div>
          )}
        </main>
        <footer className="bg-gray-100 text-gray-600 p-4 md:p-6 mt-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm mb-2 md:mb-0">Data from : <a href="https://www.immobiliare.it/mercato-immobiliare/"><b>immobiliare.it</b></a></p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default ProvinceComponent;