import { React, useContext, useEffect, useRef, useState } from "react";
import { UserContext, useUser } from "../context/UserContext";
import { Link, useNavigate } from "react-router-dom";
import api from "../pages/Axios";
import Swal from "sweetalert2";
import useFullPageLoader from "./useFullPageLoader";

function Navbar() {
  const { user } = useUser();
  const [orders, setOrders] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [notificationsSeen, setNotificationsSeen] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const previousOrders = useRef([]);
  const navigate = useNavigate();
  const [loader,showLoader,hideLoader] = useFullPageLoader();


  const handleLogout = () => {
    showLoader();
    api
      .get(`/logout`)
      .then((res) => {
        navigate("/signin");
      })
      .catch((err) => console.log(err))
      .finally(() => hideLoader());
  };

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




  return (
    <div className="fixed-navbar">
      <div className="float-left">
        <button
          type="button"
          className="menu-mobile-button fas fa-bars js__menu_mobile"
        />
        {/* <h1 className="page-title">Home</h1> */}
        {/* /.page-title */}
      </div>
      {/* /.float-left */}
      <div className="float-right">
      {/*  <div className="ico-item">
          <Link
            className="ico-item fa fa-search js__toggle_open"
            data-target="#searchform-header"
          />
          <form
            action="#"
            id="searchform-header"
            className="searchform js__toggle"
          >
            <input
              type="search"
              placeholder="Search..."
              className="input-search"
            />
            <button className="fa fa-search button-search" type="submit" />
          </form>
        </div>*/}
        {/* /.ico-item */}
        <div
      className="ico-item fa fa-arrows-alt js__full_screen"
      onClick={handleFullscreen}
      style={{ cursor: "pointer" }} // Optional for better UX
    />        {/* /.ico-item fa fa-fa-arrows-alt */}
        {/* <div className="ico-item toggle-hover js__drop_down">
          <span className="fa fa-th js__drop_down_button" />
          <div className="toggle-content">
            <ul>
              <li>
                <Link >
                  <i className="fa fa-github" />
                  <span className="txt">Github</span>
                </Link>
              </li>
              <li>
                <Link>
                  <i className="fa fa-bitbucket" />
                  <span className="txt">Bitbucket</span>
                </Link>
              </li>
              <li>
                <Link>
                  <i className="fa fa-slack" />
                  <span className="txt">Slack</span>
                </Link>
              </li>
              <li>
                <Link>
                  <i className="fa fa-dribbble" />
                  <span className="txt">Dribbble</span>
                </Link>
              </li>
              <li>
                <Link>
                  <i className="fa fa-amazon" />
                  <span className="txt">Amazon</span>
                </Link>
              </li>
              <li>
                <Link>
                  <i className="fa fa-dropbox" />
                  <span className="txt">Dropbox</span>
                </Link>
              </li>
            </ul>
            <Link className="read-more">
              More
            </Link>
          </div>
        </div> */}

        {/* /.ico-item */}
        {/* <Link
          className="ico-item fa fa-envelope notice-alarm js__toggle_open"
          data-target="#message-popup"
        />
        <div
          id="message-popup"
          className="notice-popup js__toggle"
          data-space={75}
        >
          <h2 className="popup-title">
            Recent Messages
            <a href="#" className="float-right text-danger">
              New message
            </a>
          </h2>
          <div className="content">
            <ul className="notice-list">
              <li>
                <Link>
                  <span className="avatar">
                    <img src="assets/images/avatar-sm-1.jpg" alt />
                  </span>
                  <span className="name">John Doe</span>
                  <span className="desc">
                    Amet odio neque nobis consequuntur consequatur a quae,
                    impedit facere repellat voluptates.
                  </span>
                  <span className="time">10 min</span>
                </Link>
              </li>
              <li>
                <Link>
                  <span className="avatar">
                    <img src="assets/images/avatar-sm-3.jpg" alt />
                  </span>
                  <span className="name">Harry Halen</span>
                  <span className="desc">
                    Amet odio neque nobis consequuntur consequatur a quae,
                    impedit facere repellat voluptates.
                  </span>
                  <span className="time">15 min</span>
                </Link>
              </li>
              <li>
                <Link>
                  <span className="avatar">
                    <img src="assets/images/avatar-sm-4.jpg" alt />
                  </span>
                  <span className="name">Thomas Taylor</span>
                  <span className="desc">
                    Amet odio neque nobis consequuntur consequatur a quae,
                    impedit facere repellat voluptates.
                  </span>
                  <span className="time">30 min</span>
                </Link>
              </li>
              <li>
                <Link>
                  <span className="avatar">
                    <img src="assets/images/avatar-1.jpg" alt />
                  </span>
                  <span className="name">Jennifer</span>
                  <span className="desc">
                    Amet odio neque nobis consequuntur consequatur a quae,
                    impedit facere repellat voluptates.
                  </span>
                  <span className="time">45 min</span>
                </Link>
              </li>
              <li>
                <Link>
                  <span className="avatar">
                    <img src="assets/images/avatar-sm-5.jpg" alt />
                  </span>
                  <span className="name">Helen Candy</span>
                  <span className="desc">
                    Amet odio neque nobis consequuntur consequatur a quae,
                    impedit facere repellat voluptates.
                  </span>
                  <span className="time">45 min</span>
                </Link>
              </li>
              <li>
                <Link>
                  <span className="avatar">
                    <img src="assets/images/avatar-2.jpg" alt />
                  </span>
                  <span className="name">Anna Cavan</span>
                  <span className="desc">
                    Amet odio neque nobis consequuntur consequatur a quae,
                    impedit facere repellat voluptates.
                  </span>
                  <span className="time">1 hour ago</span>
                </Link>
              </li>
              <li>
                <Link>
                  <span className="avatar bg-success">
                    <i className="fa fa-user" />
                  </span>
                  <span className="name">Jenny Betty</span>
                  <span className="desc">
                    Amet odio neque nobis consequuntur consequatur a quae,
                    impedit facere repellat voluptates.
                  </span>
                  <span className="time">1 day ago</span>
                </Link>
              </li>
              <li>
                <Link>
                  <span className="avatar">
                    <img src="assets/images/avatar-5.jpg" alt />
                  </span>
                  <span className="name">Denise Peterson</span>
                  <span className="desc">
                    Amet odio neque nobis consequuntur consequatur a quae,
                    impedit facere repellat voluptates.
                  </span>
                  <span className="time">1 year ago</span>
                </Link>
              </li>
            </ul>
            <Link  className="notice-read-more">
              See more messages <i className="fa fa-angle-down" />
            </Link>
          </div>
        </div>
        <Link
        
        className={`ico-item ${hasChanges ? 'pulse' : ''}`}
        onClick={handleBellClick}
      >
        <span
          className="ico-item fa fa-bell notice-alarm js__toggle_open"
          data-target="#notification-popup"
        />
        <div
          id="notification-popup"
          className="notice-popup js__toggle"
          data-space={75}
          style={{ maxHeight: '400px', overflowY: 'auto' }}
        >
          <h2 className="popup-title">Your Notifications</h2>
          <div className="content">
            <ul className="notice-list">
              {orders.slice(0, showAll ? orders.length : 5).map((order) => (
                <li key={order.Order_Id}>
                  <a href="#" onClick={() => handleNotificationClick(order)}>
                    <span className="avatar"><img src="/assests/Images/download.png" alt="" /></span>
                    <span className="name">{order.User_Name}</span>
                    <span className="desc">
                      Order Status: {order.Order_Status}
                    </span>
                    <span className="time">
                      {new Date(order.Ordered_On).toLocaleString()}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
            
          </div>
        </div>
      </Link> */}

        <Link
          to="#"
          className="ico-item fa fa-power-off "
          onClick={confirmLogout}
        ></Link>
      </div>
      {loader}
    </div>
  );
}

export default Navbar;
