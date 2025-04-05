import React, { useState, useEffect, useContext} from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import api from "../../pages/Axios"; // Adjust path if needed
import { FaCalendarAlt } from "react-icons/fa"; // Importing an icon for the dropdown
import '../customstyles.css'
import {UserContext, useUser} from "../../context/UserContext";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const CustomerBarGraph = () => {
  const [data, setData] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear()); // Default to current year
  const [availableYears, setAvailableYears] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const {user} = useUser();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user?.orgId || isNaN(user.orgId)) {
          throw new Error("Invalid Org_Id");
        }
  
        setIsLoading(true);
  
        // Fetch available years
        const yearResponse = await api.get(`/viewCustomersYears/${user.orgId}`);
        setAvailableYears(yearResponse.data);
  
        // Fetch data for the selected year
        const yearParam = year || new Date().getFullYear();
        const response = await api.get(`/viewCustomers/${user.orgId}?year=${yearParam}`);
  
        // Map the data to monthly counts
        const monthlyData = Array(12).fill(0);
        response.data.forEach((item) => {
          const monthIndex = item.Month - 1; // 0-based index
          monthlyData[monthIndex] = item.CustomerCount;
        });
  
        setData(monthlyData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchData();
  }, [year, user?.orgId]);

  // Handle the change in year selection from dropdown
  const handleYearChange = (event) => {
    setYear(event.target.value); // Update the year state
  };

  // Prepare chart data
  const chartData = {
    labels: [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ],
    datasets: [
      {
        label: "Customer Count",
        data: data,
        backgroundColor: "#36A2EB", // Blue color for the bars
        borderColor: "#36A2EB",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: `Monthly Statistics for ${year || "Current Year"}`,
      },
      legend: {
        position: "top",
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Months",
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Count",
        },
      },
    },
  };

  return (
    <div className="content bargraph-container">
      {/* Dropdown for year selection */}
      <div className="year-dropdown">
        <select 
          onChange={handleYearChange} 
          value={year || ""}
          className="custom-dropdown"
        >
          <option value="">Select Year</option>
          {availableYears.map((yearOption, index) => (
            <option key={index} value={yearOption}>{yearOption}</option>
          ))}
        </select>
        <FaCalendarAlt className="dropdown-icon" />
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <Bar
          data={chartData}
          options={chartOptions}
          className="custom-bar-chart"
        />
      )}
    </div>
  );
};

export default CustomerBarGraph;
