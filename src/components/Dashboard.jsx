import { React, useContext, useEffect, useState, useRef } from "react";
import "chartist/dist/chartist.min.css";
import api, { apiUrl } from "../pages/Axios";
import { FaCalendarAlt } from "react-icons/fa";
import Chartist from "chartist";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import OrderStatusPieChart from "../components/charts/OrderStatusPieChart";
import "../components/customstyles.css";
import { UserContext, useUser } from "../context/UserContext";
import CustomerBarGraph from "./charts/CustomerBarGraph";
import FollowUpTable from "./tables/FollowUpTable";
import useFullPageLoader from "./useFullPageLoader";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const chartRef = useRef(null);
  const [salesData, setSalesData] = useState([]);
  const [years, setYears] = useState([]); // State for years list
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // Default to current year
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loader,showLoader,hideLoader] = useFullPageLoader();
  const { user } = useUser();
  const navigate = useNavigate();

  

  
  useEffect(() => {
    if (user) return; // Prevent unnecessary API calls if user exists
  
    api.get(`/dashboard`, { withCredentials: true })
      .then((res) => {
        if (res.data.Success === "Success") {
          console.log(res.data);
  
          const user = {
            userId: res.data.UserId,
            orgId: res.data.Org_ID,
            branchId: res.data.Branch_Id,
            mobile: res.data.Mobile,
            fname: res.data.First_Name,
            lname: res.data.Last_Name,
            email: res.data.Email,
            photo: res.data.Photo,
            role: res.data.Role,
            isSubCat: res.data.IsSubCat,
            isVariant: res.data.IsVariant,
            variant: res.data.Variant,
            isInventory: res.data.IsInventory,
            isDealer: res.data.IsDealer,
          };
  
  
          hideLoader();
  
          // ✅ FIX: Only navigate to "/" if the user is logging in for the first time
          if (res.data.UserId && window.location.pathname === "/signin") {
            navigate("/");
          }
        } else {
          navigate("/signin");
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
  
        if (error.response?.status === 401) {
          console.warn("Unauthorized access. Redirecting to signin.");
          navigate("/signin");
        } else {
          console.error("An unexpected error occurred:", error.message);
        }
      });
  }, [user]); 

  // Fetch available years
  useEffect(() => {
    const fetchYears = async () => {
      showLoader();
      try {
        if (!user?.orgId || isNaN(user?.orgId)) {
          throw new Error("Invalid Org_Id");
        }
  
        const response = await api.get(`/viewYears/${user?.orgId}`);
        const yearsFromApi = response.data.map((yearObj) => yearObj.Year);
        setYears(yearsFromApi);
  
        // If the current year is not in the list, add it
        if (!yearsFromApi.includes(new Date().getFullYear())) {
          setYears(
            [...yearsFromApi, new Date().getFullYear()].sort((a, b) => a - b)
          );
        }
      } catch (error) {
        console.error("Error fetching years:", error);
      } finally {
        hideLoader();
      }
    };
  
    fetchYears();
  }, [user?.orgId]);
  

  // Fetch sales data based on the selected year
  useEffect(() => {
    const fetchSalesData = async () => {
      showLoader();
      try {
        const response = await api.get(`/viewSales/${user?.orgId}?year=${selectedYear}`);
        const data = response.data;

        const monthNames = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];

        const completeData = monthNames.map((month, index) => {
          const monthIndex = index + 1;
          const salesRecord = data.find(
            (record) =>
              record.Month === monthIndex && record.Year === selectedYear
          );

          return {
            Month: month,
            Total_Sales: salesRecord ? salesRecord.Total_Sales : 0,
          };
        });

        setSalesData(completeData);
      } catch (error) {
        console.error("Error fetching sales data:", error);
      }finally{
        hideLoader();
      }
    };

    fetchSalesData();
  }, [selectedYear]);

  // Initialize Chartist chart
  useEffect(() => {
    if (!chartRef.current || salesData.length === 0) return;

    const step = 10000; // Step size for ticks
    const maxSales = Math.max(...salesData.map((data) => data.Total_Sales), 0);
    const roundedHigh = Math.ceil(maxSales / step) * step;

    const yTicks = Array.from(
      { length: Math.floor(roundedHigh / step) + 1 },
      (_, i) => i * step
    );

    const chartData = {
      labels: salesData.map((data) => data.Month),
      series: [salesData.map((data) => data.Total_Sales)],
    };

    const chartOptions = {
      fullWidth: true,
      chartPadding: { right: 40 },
      axisX: { showGrid: false },
      axisY: {
        labelInterpolationFnc: (value) => `${value}`,
        low: 0,
        high: roundedHigh,
        ticks: yTicks,
      },
    };

    const chart = new Chartist.Line(chartRef.current, chartData, chartOptions);

    return () => {
      chart.detach();
    };
  }, [salesData]);

  return (
    <div className="wrapper">
      <div className="main-content">
        <div className="row small-spacing">
          <div className="col-12">
            <div className="box-content">
              <div
                className="box-title"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "10px",
                }}
              >
                <h4 className="box-title" style={{ margin: 0 }}>
                  Sales Chart
                </h4>{" "}
                {/* Title on the left */}
                <div style={{ display: "flex", alignItems: "center" }}>
                  {" "}
                  {/* Dropdown + Icon */}
                  <FaCalendarAlt style={{ marginRight: "8px" }} />
                  <select
                    value={selectedYear}
                    onChange={(e) =>
                      setSelectedYear(parseInt(e.target.value, 10))
                    }
                    style={{ padding: "5px" }}
                  >
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div
                ref={chartRef}
                className="chartist-chart"
                style={{ height: 150 }}
              ></div>
            </div>

          </div>
          
        
          
         
          {/* /.col-xl-3 col-lg-6 col-12 */}
          <div className="col-xl-6 col-12">
            <div className="box-content">
              <h4 className="box-title">Statistics</h4>
              
              <div className="dropdown js__drop_down">
                <a
                  href="#"
                  className="dropdown-icon glyphicon glyphicon-option-vertical js__drop_down_button"
                />
                <ul className="sub-menu">
                  <li>
                    <a href="#">Action</a>
                  </li>
                  <li>
                    <a href="#">Another action</a>
                  </li>
                  <li>
                    <a href="#">Something else there</a>
                  </li>
                  <li className="split" />
                  <li>
                    <a href="#">Separated link</a>
                  </li>
                </ul>
                {/* /.sub-menu */}
              </div>
              {/* /.dropdown js__dropdown */}
              <div className="content">
                {/* Replace the static chart with the BarGraph component */}
                <CustomerBarGraph />
              </div>
              {/* /.content */}
            </div>
            {/* /.box-content */}
          </div>
          <div className="col-xl-6 col-12">
            <div className="box-content">
              <h4 className="box-title">Daily Sales</h4>
              <div className="dropdown js__drop_down">
                <div
                  className="date-picker-wrapper"
                  style={{ position: "relative" }}
                >
                  <DatePicker
                    selected={selectedDate}
                    onChange={(date) => setSelectedDate(date)}
                    showMonthYearPicker
                    dateFormat="MM/yyyy"
                    className="custom-date-picker small-datepicker"
                    style={{
                      fontSize: "14px", // Decrease font size
                      padding: "5px 10px", // Adjust padding
                      width: "auto", // Adjust width if necessary
                    }}
                  />
                  <FaCalendarAlt
                    style={{
                      position: "absolute",
                      top: "50%",
                      right: "10px",
                      transform: "translateY(-50%)",
                      pointerEvents: "none",
                      color: "#aaa",
                    }}
                  />
                </div>
              </div>
              <OrderStatusPieChart
                selectedDate={selectedDate}
                width={296}
                height={200}
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                }}
              />
            </div>
          </div>


          <div className="col-xl-12 col-12">
      <div className="box-content">
        <h4 className="box-title">Leads</h4>
        <div className="dropdown js__drop_down">
          <a
            href="#"
            className="dropdown-icon glyphicon glyphicon-option-vertical js__drop_down_button"
          />
          <ul className="sub-menu">
            <li>
              <a href="#">Product</a>
            </li>
            <li>
              <a href="#">Another action</a>
            </li>
            <li>
              <a href="#">Something else there</a>
            </li>
            <li className="split" />
            <li>
              <a href="#">Separated link</a>
            </li>
          </ul>
        </div>
        {/* Call FollowupTable Component */}
        <FollowUpTable />
      </div>
    </div>
        </div>
        <footer className="footer">
          <ul className="list-inline">
            <li>2025 © Rahul.</li>
            <li>
              <a href="#">Privacy</a>
            </li>
            <li>
              <a href="#">Terms</a>
            </li>
            <li>
              <a href="#">Help</a>
            </li>
          </ul>
        </footer>
      </div>
      {loader}
    </div>
  );
}

export default Dashboard;
