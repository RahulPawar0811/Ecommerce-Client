import { React, useContext, useState, useEffect, useRef } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { UserContext, useUser } from "../context/UserContext"; // Adjust the path as needed
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import api from '../pages/Axios'
import useFullPageLoader from './useFullPageLoader'
import Swal from "sweetalert2";
import Navbar from "./Navbar";

function MainMenu() {
  const { user } = useUser();
  const location = useLocation();
  const [activeMenu, setActiveMenu] = useState("dashboard"); // Default menu
  const [dropdownMenu, setDropdownMenu] = useState(null);
  const navigate = useNavigate();
  const { setData } = useUser();
  const [userData, setUserData] = useState(null);
  const [loader,showLoader,hideLoader] = useFullPageLoader();
  const [orders, setOrders] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [notificationsSeen, setNotificationsSeen] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const previousOrders = useRef([]);


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
  
          setUserData(user);
          setData(user); // Set user data context
  
          hideLoader();
          console.log(user);
  
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
  
  
  


  

  const confirmLogout = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to log out?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Log Out",
      cancelButtonText: "Cancel",
    }).finally(()=>{
      showLoader();
    }).then((result) => {
      if (result.isConfirmed) {
        hideLoader();
        handleLogout();
        Swal.fire("Logged out!", "You have been successfully logged out.", "success");
      }
    });
  };


// useEffect(() => {
//   // Ensure user?.orgId exists before setting up the interval
//   if (!user?.orgId) return;

//   const interval = setInterval(() => {
//     fetchOrders(); // Re-fetch orders periodically
//   }, 5000); // Poll every 5 seconds

//   return () => clearInterval(interval); // Cleanup interval on unmount or dependency change
// }, [user?.orgId]); // Dependency array ensures the interval resets when orgId changes


// console.log(user?.orgId);
//console.log("[Orders]:", orders);
//console.log("[Show All State]:", showAll);
//console.log("Rendered Orders:", orders.slice(0, showAll ? orders.length : 4));


const handleFullscreen = () => {
  const element = document.documentElement; // Fullscreen for the entire page
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else {
    element.requestFullscreen().catch((err) => {
      console.error(`Error attempting to enable full-screen mode: ${err.message}`);
    });
  }
};


  const handleLogout = () => {
    showLoader();
    api
      .get(`/logout`)
      .then((res) => {
        setUserData(null);
        setData(null);
        navigate("/signin");
      })
      .catch((err) => console.log(err))
      .finally(() => hideLoader());
  };

  // Reset active menu when route changes
  // useEffect(() => {
  //   setActiveMenu(null);
  // }, [location.pathname]);

  const isActive = (path) => location.pathname === path;

  // Handle toggle for the dropdown menus
  const toggleMenu = (menu) => {
    setDropdownMenu((prevMenu) => (prevMenu === menu ? null : menu)); // Toggle the dropdown visibility
  };

  useEffect(() => {
    // Update active menu based on the current location
    const path = location.pathname;
    if (path === "/") setActiveMenu("dashboard");
    else if (path.includes("catalog")) setActiveMenu("catalog");
  }, [location]);

  return (
    <>
    <div class="main-menu">
      <header class="header">
      <Link to="/" className="logo">
      ECOMMERCE ADMIN
</Link>
        <button
          type="button"
          class="button-close fa fa-times js__menu_close"
        ></button>
        <div class="user">
          <Link to="#" class="avatar">
            <img src="/assets/Images/download.png" alt="" />
            <span class="status online"></span>
          </Link>
          <h5 class="name">
            <Link to="/">
              {user?.fname || ""} {user?.lname || ""}
            </Link>
          </h5>
          <h5 class="position">{user?.role || "Administrator"}</h5>
          <div class="control-wrap js__drop_down">
            <i class="fa fa-caret-down js__drop_down_button"></i>
            <div class="control-list">
              <div class="control-item">
                {/* <Link to="profile.html">
                  <i class="fa fa-user"></i> Profile
                </Link> */}
              </div>
              <div class="control-item">
                {/* <Link to="#">
                  <i class="fas fa-cog"></i> Settings
                </Link> */}
              </div>
              <div className="control-item">
                <Link to="#" onClick={handleLogout}>
                &nbsp;<FontAwesomeIcon icon={faSignOutAlt} /> &nbsp;&nbsp;Log out
                </Link>
              </div>{" "}
            </div>
          </div>
        </div>
      </header>
      <div className="content">
      <div className="navigation">
        <h5 className="title">Manage Store</h5>
        <ul className="menu js__accordion">
          {/* Dashboard Link */}
          <li className={isActive("/") ? "current" : ""}>
            <Link className={`waves-effect ${isActive("/") ? "active" : ""}`} to="/">
              <i className="menu-icon fa fa-home"></i>
              <span>Dashboard</span>
            </Link>
          </li>

          {/* Catalog Menu */}
          <li className={activeMenu === "catalog" ? "current" : ""}>
            <Link
              className="waves-effect parent-item js__control"
              onClick={() => toggleMenu("catalog")}
            >
              <i className="menu-icon fa fa-th-list"></i>
              <span>Catalog</span>
              <span className="menu-arrow fa fa-angle-down"></span>
            </Link>
            <ul className={`sub-menu js__content ${dropdownMenu === "catalog" ? "active" : ""}`}>
              <li>
                <Link className={isActive("/addCategories") ? "active" : ""} to="/addCategories">
                  Category
                </Link>
              </li>
              {user?.isSubCat === "1" && (
  <li>
    <Link className={isActive("/addSubcategories") ? "active" : ""} to="/addSubcategories">
      Sub-Category
    </Link>
  </li>
)}

              <li>
                <Link className={isActive("/viewProducts") ? "active" : ""} to="/viewProducts">
                  Product
                </Link>
              </li>
              {user?.IsVariant === "1" && (
  <li>
    <Link className={isActive("/addVariantTypes") ? "active" : ""} to="/addVariantTypes">
      Variant Type
    </Link>
  </li>
)}

            </ul>
          </li>
        </ul>
      </div>
    </div>
      <Navbar/>
    </div>
    
    <Outlet/>
    </>
    

  );
}

export default MainMenu;
