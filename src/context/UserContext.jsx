// import React, { createContext, useEffect, useState } from 'react';
// import Cookies from 'js-cookie';
// import api from '../pages/Axios'

// export const UserContext = createContext();

// export const UserProvider = ({ children }) => {
//     const [user, setUser] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);

//     console.log("user data",user);
    


    // useEffect(() => {
    //     fetchUserData(); // Fetch user data when the component mounts
    // }, []);

    // const fetchUserData = async () => {
    //     setLoading(true); // Start loading indicator
    //     const token = Cookies.get('user_token'); // Get token from cookies
    //     console.log("Fetched token:", token); // Log token for debugging
    
    //     if (token) {
    //         try {
    //             console.log("Sending request with token...");
    //             const response = await api.get("/protected", {
    //                 headers: {
    //                     'Authorization': `Bearer ${token}`, // Add token in Authorization header
    //                     'Content-Type': 'application/json',
    //                 },
    //                 withCredentials: true, // Ensure cookies are included in the request
    //             });
    
    //             console.log("User data fetched successfully:", response.data);
    //             setUser(response.data.user); // Set user data from the response
    //             setError(null); // Reset error state on successful response
    //         } catch (error) {
    //             console.error("Error during fetchUserData:", error);
    
    //             if (error.response) {
    //                 console.error("Error response:", error.response);
    //                 switch (error.response.status) {
    //                     case 401:
    //                         setError('Session expired. Please log in again.');
    //                         Cookies.remove('user_token'); // Clear expired token
    //                         window.location.href = "/signin"; // Redirect to login
    //                         break;
    //                     case 403:
    //                         setError('Access denied. Contact support if this is unexpected.');
    //                         break;
    //                     default:
    //                         setError('Failed to fetch user data.');
    //                 }
    //             } else if (error.request) {
    //                 console.error("No response received:", error.request);
    //                 setError('No response from the server. Please check your connection.');
    //             } else {
    //                 console.error("Error setting up request:", error.message);
    //                 setError('An error occurred while setting up the request.');
    //             }
    //         }
    //     } else {
    //         console.warn("No token found in cookies.");
    //         setUser(null); // Clear user data
    //         setError('No User or Token found. Please login.');
    //     }
    
    //     setLoading(false); // Stop loading indicator
    // };
    

//     const handleLogout = () => {
//         Cookies.remove('user_token');
//         setUser(null);
//         setError(null);
//     };
    
//     const refreshUserData = () => {
//         fetchUserData(); // Call fetchUserData to refresh user data
//     };

//     const updateUser = (newUserData) => {
//         setUser((prevUser) => ({
//             ...prevUser,
//             ...newUserData,
//         }));
//     };
    

//     const userInfo = {
//         user,
//         loading,
//         error,
//         handleLogout,
//         refreshUserData, // Add refreshUserData to context
//         updateUser,
//     };


    

//     return (
//         <UserContext.Provider value={userInfo}>
//             {children}
//         </UserContext.Provider>
//     );
// };

// export default UserProvider;




import React, { createContext, useContext, useState } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setData] = useState(null);

  return (
    <UserContext.Provider value={{ user, setData }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  return useContext(UserContext);
};

