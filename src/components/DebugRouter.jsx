import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function DebugRouter() {
  const location = useLocation();
  useEffect(() => {
    // console.log("Route changed:", location.pathname);
  }, [location]);
  return null;
}

export default DebugRouter;
