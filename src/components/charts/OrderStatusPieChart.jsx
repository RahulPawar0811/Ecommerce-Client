import React, { useState, useEffect, useContext } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import api from "../../pages/Axios";
import { UserContext, useUser } from '../../context/UserContext'

ChartJS.register(ArcElement, Tooltip, Legend);

const OrderStatusPieChart = ({ selectedDate }) => {
  const [apiData, setApiData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();

  // Fetch data from API with filters
  const fetchData = async (month, year) => {
    setIsLoading(true);
    try {
      const response = await api.get(
        `/viewDeliveryStatus/${user?.orgId}?month=${month}&year=${year}`
      );
      setApiData(response.data);
    } catch (error) {
      console.error("Error fetching data from API:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data when selected date changes or user orgId changes
  useEffect(() => {
    if (user?.orgId && selectedDate) {
      const selectedMonth = selectedDate.getMonth() + 1; // Months are 0-based
      const selectedYear = selectedDate.getFullYear();
      fetchData(selectedMonth, selectedYear);
    }
  }, [selectedDate, user?.orgId]);  // Fix dependency array

  // Count occurrences of each order status
  const orderStatusCounts = apiData.reduce((acc, item) => {
    acc[item.Order_Status] = (acc[item.Order_Status] || 0) + 1;
    return acc;
  }, {});

  // Prepare data for the pie chart
  const chartData = {
    labels: Object.keys(orderStatusCounts),
    datasets: [
      {
        data: Object.values(orderStatusCounts),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
        ],
        hoverBackgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
        ],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    width: 296, // Custom width
    height: 200, // Custom height
  };

  return (
    <div className="content" style={{ minWidth: "296px", minHeight: "200px" }}>
      {isLoading ? (
        <p>Loading...</p>
      ) : apiData.length === 0 ? (
        <p>No data available for the selected date.</p>
      ) : (
        <Pie data={chartData} options={chartOptions} />
      )}
    </div>
  );
};

export default OrderStatusPieChart;
