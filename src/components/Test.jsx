import React from "react";
import useFullPageLoader from "./useFullPageLoader";

const App = () => {
  const [loader, showLoader, hideLoader] = useFullPageLoader();

  const simulateAction = async () => {
    showLoader(); // Show loader
    await new Promise((resolve) => setTimeout(resolve, 5000)); // Simulate a delay
    hideLoader(); // Hide loader
  };

  return (
    <div className="wrapper">
      <div className="main-content">
      <button onClick={simulateAction}>Show Loader</button>
      </div>
      {loader}
    </div>
  );
};

export default App;
