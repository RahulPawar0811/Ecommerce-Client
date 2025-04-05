import React from "react";
import './FullPageLoader.css'

const FullPageLoader = () => {
    return (
        <div className="wrapper">
        <div className="loader-overlay">
            <img src='/assets/Images/loader-9342_512.gif' className="loader-gif" alt="loading" />
        </div>
        </div>
    );
};

export default FullPageLoader;
