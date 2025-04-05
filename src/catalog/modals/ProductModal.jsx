// import { React, useContext, useEffect, useState } from "react";
// import { Modal, Button } from "react-bootstrap";
// import api, { imageURL } from "../../pages/Axios";
// import { UserContext } from "../../context/UserContext";
// import VariantModal from "./VariantModal";
// import EditVariantModal from "./EditVariantModal";

// const ProductModal = ({ show, handleClose, product,variantModal }) => {
//   const [variants, setVariants] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const { user } = useContext(UserContext);
//   const [editVariantModal, setEditVariantModal] = useState(false);
//   const [selectedVariant, setSelectedVariant] = useState(null);

//   const handleEditClick = (variant) => {
//     console.log("Variant selected:", variant); // Debug
//     setSelectedVariant(variant); // Set the selected variant
//     setEditVariantModal(true); // Show the modal
//     handleClose(); // Close the product modal
//   };

//   const handleCloseModal = () => {
//     setEditVariantModal(false); // Close the modal
//   };
  

//   // Fetch product variants using axios
//   const fetchVariants = async (Product_Id) => {
//     try {
//       // Send GET request to fetch product variants by Product_Id and Org_Id
//       const response = await api.get(
//         `/viewVariants/${Product_Id}?Org_Id=${user?.orgId}`
//       );

//       // Set the fetched variants into state
//       setVariants(response.data);
//       setLoading(false);
//     } catch (error) {
//       console.error("Error fetching product variants:", error.message);
//       setError("Failed to load variants");
//       setLoading(false);
//     }
//   };

//   // Fetch variants when component mounts or product changes
//   useEffect(() => {
//     if (product?.Prod_Id) {
//       fetchVariants(product?.Prod_Id, user?.orgId);
//     }
//   }, [product?.Prod_Id, user?.orgId]);

  

  

//   return (
//     <Modal show={show} onHide={handleClose} size="lg" centered>
//        <Modal.Header>
//     <Modal.Title>Variants for {product?.Prod_Name}</Modal.Title>
//          {/* Custom Cross Button */}
//          <button
//   type="button"
//   className="btn-close"
//   aria-label="Close"
//   onClick={handleClose}
//   style={{
//     position: "absolute",
//     right: "16px",
//     top: "16px",
//     backgroundColor: "transparent",
//     border: "none",
//     fontSize: "20px",
//     cursor: "pointer",
//     color: "black", // Initial color (black)
//     transition: "color 0.3s ease", // Smooth color transition
//   }}
//   onMouseEnter={(e) => e.target.style.color = 'red'} // Change color on hover
//   onMouseLeave={(e) => e.target.style.color = 'black'} // Revert to black when hover ends
// >
//   &#10005;
//             </button>
//   </Modal.Header>
//       <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
//         {/* Display loading spinner while fetching variants */}
//         {loading ? (
//           <p>Loading variants...</p>
//         ) : error ? (
//           <p>{error}</p>
//         ) : (
//           <div>
//             <h5>Variants:</h5>
//             {/* Table to display variants */}
//             <table className="table table-striped table-bordered">
//               <thead>
//                 <tr>
//                   <th>Image</th>
//                   <th>Product Name</th>
//                   <th>Variant 1</th>
//                   <th>Value 1</th>
//                   <th>Variant 2</th>
//                   <th>Value 2</th>
//                   <th>Purchase Price</th>
//                   <th>MRP</th>
//                   <th>Web Price</th>
//                   <th>Store Price</th>
//                   <th>Quantity</th>
//                   <th>Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {variants.map((variant) => (
//                   <tr key={variant.Variant_Id}>
//                     <td>
//                       {/* Display variant image */}
//                       <img
//                         src={`${imageURL}/Images/product/${variant.Featured_Image}`}
//                         alt={variant.Variant_Name}
//                         style={{
//                           width: "50px",
//                           height: "50px",
//                           objectFit: "cover",
//                         }}
//                       />
//                     </td>
//                     <td>{product?.Prod_Name}</td>
//                     <td>{variant.Variant_Name1}</td>
//                     <td>{variant.Variant_Value1}</td>
//                     <td>{variant.Variant_Name2}</td>
//                     <td>{variant.Variant_Value2}</td>
//                     <td>{variant.Purchase_Price}</td>
//                     <td>{variant.MRP}</td>
//                     <td>{variant.Web_Price}</td>
//                     <td>{variant.Store_Price}</td>
//                     <td>{variant.Qty}</td>
//                     <td className="text-center">
//                       {/* Edit Icon */}
//                       <i
//                                   className="fas fa-edit cursor-pointer"
//                                   style={{
//                                     marginRight: "15px", // Space between icons
//                                     fontSize: "16px", // Icon size
//                                     cursor: "pointer", // Pointer cursor
//                                     transition:
//                                       "transform 0.2s ease, color 0.2s ease", // Smooth hover effect
//                                   }}
//                                   onMouseEnter={(e) => {
//                                     e.target.style.color = "blue"; // Change color on hover
//                                     e.target.style.transform = "scale(1.2)"; // Slightly enlarge on hover
//                                   }}
//                                   onMouseLeave={(e) => {
//                                     e.target.style.color = ""; // Reset color
//                                     e.target.style.transform = "scale(1)"; // Reset size
//                                   }}
//                                   onClick={() => handleEditClick(variant,product)} // Trigger modal and pass variant
//                       >

//                       </i>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
            


//           </div>
//         )}
//         {selectedVariant && (
//             <EditVariantModal
//               show={editVariantModal}
//               onHide={handleCloseModal}
//               variant={selectedVariant} // Pass selected variant
//               value="Testing PRops"
//             />
//           )}
//       </Modal.Body>
//       <Modal.Footer>
//         <Button variant="danger" onClick={handleClose}>
//           Close
//         </Button>
//       </Modal.Footer>
//     </Modal>
//   );
// };

// export default ProductModal;



import { React, useContext, useEffect, useState } from "react";
import { Modal, Button } from "react-bootstrap";
import api, { imageURL } from "../../pages/Axios";
import { UserContext, useUser } from "../../context/UserContext";
import EditVariantModal from "./EditVariantModal";
import Swal from "sweetalert2";
import useFullPageLoader from "../../components/useFullPageLoader";
import VariantModal from "./VariantModal";


const ProductModal = ({ show, handleClose, product,data }) => {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const {user} = useUser();
  const [editVariantModal, setEditVariantModal] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [loader,showLoader,hideLoader] = useFullPageLoader();
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleShowVariantModal = (product) => {
    setSelectedProduct(product);
    setShowVariantModal(true);  // Open the modal
  };
  
  const handleVariantCloseModal = () => {
    setShowVariantModal(false);
    setSelectedProduct(null);
  };

  // Handle edit button click
  const handleEditClick = (variant) => {
    setSelectedVariant(variant); // Set the selected variant
    setEditVariantModal(true); // Show EditVariantModal
  };

  // Close EditVariantModal
  const handleCloseEditModal = () => {
    setEditVariantModal(false); // Close EditVariantModal
  };

  // Fetch product variants using Axios
  const fetchVariants = async (Product_Id) => {
    showLoader();
    try {
      const response = await api.get(
        `/viewVariants/${Product_Id}?Org_Id=${user?.orgId}`
      );
      setVariants(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching product variants:", error.message);
      setError("Failed to load variants");
      setLoading(false);
    }finally{
      hideLoader();
    }
  };

  // Fetch variants when the component mounts or product changes
  useEffect(() => {
    if (product?.Prod_Id) {
      fetchVariants(product?.Prod_Id);
    }
  }, [product?.Prod_Id, user?.orgId,data]);

  const handleDelete = async (Row_Id) => {
    showLoader();
    try {
      // Show confirmation dialog
      const result = await Swal.fire({
        title: "Are you sure?",
        text: `This will delete the Variant ID ${Row_Id}.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "No, cancel!",
        reverseButtons: true,
      }).finally(()=>{
        hideLoader();
      });

      // If user clicks 'Yes, delete it!'
      if (result.isConfirmed) {
        showLoader();
        // Make the DELETE request using Axios to delete the GST category by Row_Id
        const response = await api.delete(`/deleteProductVariant/${Row_Id}`);

        // Check if the deletion was successful
        if (response.status === 200) {
          // Display success message
          Swal.fire({
            title: "Deleted!",
            text: "Product Variant has been deleted.",
            icon: "success",
          });

          // After deletion, re-fetch the updated list of variant types
          fetchVariants(product?.Prod_Id);
        } else {
          // Display error message if something goes wrong
          Swal.fire({
            title: "Error!",
            text: "There was a problem deleting the Variant.",
            icon: "error",
          });
        }
      }
    } catch (error) {
      console.error("Error in handleDelete:", error);
      Swal.fire({
        title: "Error!",
        text: "An unexpected error occurred.",
        icon: "error",
      }).finally(()=>{
        hideLoader();
      })
    }
  };

  return (
    <>
      {/* ProductModal */}
      <Modal show={show && !editVariantModal} onHide={handleClose} size="lg" centered>
        <Modal.Header>
          <Modal.Title>Variants for {product?.Prod_Name}</Modal.Title>
          <button
            type="button"
            className="btn-close"
            aria-label="Close"
            onClick={handleClose}
            style={{
              position: "absolute",
              right: "16px",
              top: "16px",
              backgroundColor: "transparent",
              border: "none",
              fontSize: "20px",
              cursor: "pointer",
              color: "black",
              transition: "color 0.3s ease",
            }}
            onMouseEnter={(e) => (e.target.style.color = "red")}
            onMouseLeave={(e) => (e.target.style.color = "black")}
          >
            &#10005;
          </button>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
          {loading ? (
            <p>Loading variants...</p>
          ) : error ? (
            <p>{error}</p>
          ) : (
            <div>
              <h5>Variants:</h5>
              <table className="table table-striped table-bordered">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Product Name</th>
                    <th>Variant 1</th>
                    <th>Value 1</th>
                    <th>Variant 2</th>
                    <th>Value 2</th>
                    <th>Purchase Price</th>
                    <th>MRP</th>
                    <th>Web Price</th>
                    <th>Store Price</th>
                    <th>Quantity</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {variants.map((variant) => (
                    <tr key={variant.Variant_Id}>
                      <td>
                        <img
                          src={`${imageURL}/Images/product/${variant.Featured_Image}`}
                          alt={variant.Variant_Name}
                          style={{
                            width: "50px",
                            height: "50px",
                            objectFit: "cover",
                          }}
                        />
                      </td>
                      <td>{product?.Prod_Name}</td>
                      <td>{variant.Variant_Name1}</td>
                      <td>{variant.Variant_Value1}</td>
                      <td>{variant.Variant_Name2}</td>
                      <td>{variant.Variant_Value2}</td>
                      <td>{variant.Purchase_Price}</td>
                      <td>{variant.MRP}</td>
                      <td>{variant.Web_Price}</td>
                      <td>{variant.Store_Price}</td>
                      <td>{variant.Qty}</td>
                      <td style={{ textAlign: "center" }}>
                          {/* Bootstrap Dropdown */}
                          <div className="dropdown">
                            {/* Trigger Button */}
                            <i
                              className="fas fa-ellipsis-v"
                              style={{
                                cursor: "pointer",
                                fontSize: "18px",
                              }}
                              data-bs-toggle="dropdown"
                              data-bs-target="#dropdownMenu"
                              aria-expanded="false"
                            ></i>

                            {/* Dropdown Menu */}
                            <ul
                              id="dropdownMenu"
                              className="dropdown-menu"
                              style={{
                                position: "absolute",
                                top: "100%",
                                left: "auto",
                                right: 0,
                                zIndex: 1050,
                                float: "none",
                                minWidth: "10rem",
                                padding: "0.5rem 0",
                                fontSize: "14px",
                                color: "#212529",
                                textAlign: "left",
                                listStyle: "none",
                                backgroundColor: "#fff",
                                border: "1px solid rgba(0, 0, 0, 0.15)",
                                borderRadius: "0.25rem",
                                boxShadow: "0 0.5rem 1rem rgba(0, 0, 0, 0.175)",
                              }}
                            >
                              <li>
                                <a
                                  className="dropdown-item"
                                  href="#"
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    padding: "0.25rem 1rem",
                                    color: "#28a745", // Blue for Edit
                                    textDecoration: "none",
                                    whiteSpace: "nowrap",
                                    transition:
                                      "background-color 0.15s ease-in-out, color 0.15s ease-in-out",
                                  }}
                                  onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = "#d4edda"; // Light green on hover
                                    e.target.style.color = "#155724"; // Darker green for hover
                                  }}
                                  onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = "transparent";
                                    e.target.style.color = "#28a745"; // Reset to green
                                  }}
                                  onClick={() => handleShowVariantModal(product)}
                                >
                                  <i
                                    className="fas fa-plus"
                                    style={{
                                      marginRight: "10px",
                                      color: "#28a745", // Blue color for the icon
                                    }}
                                    onClick={() => handleShowVariantModal(variant)} // Pass the full category object to handleEdit
                                  ></i>
                                  Add
                                </a>
                              </li>
                              {/* Edit Option */}
                              <li>
                                <a
                                  className="dropdown-item"
                                  href="#"
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    padding: "0.25rem 1rem",
                                    color: "#007bff", // Blue for Edit
                                    textDecoration: "none",
                                    whiteSpace: "nowrap",
                                    transition:
                                      "background-color 0.15s ease-in-out, color 0.15s ease-in-out",
                                  }}
                                  onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = "#f0f8ff"; // Light blue on hover
                                    e.target.style.color = "#0056b3"; // Darker blue for hover
                                  }}
                                  onMouseLeave={(e) => {
                                    e.target.style.backgroundColor =
                                      "transparent";
                                    e.target.style.color = "#007bff"; // Reset to blue
                                  }}
                                  onClick={() => handleEditClick(variant)}
                                >
                                  <i
                                    className="fas fa-edit"
                                    style={{
                                      marginRight: "10px",
                                      color: "#007bff", // Blue color for the icon
                                    }}
                                    onClick={() => handleEditClick(variant)} // Pass the full category object to handleEdit
                                  ></i>
                                  Edit
                                </a>
                              </li>

                              {/* Delete Option */}
                              <li>
                                <a
                                  className="dropdown-item"
                                  href="#"
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    padding: "0.25rem 1rem",
                                    color: "#dc3545", // Red for Delete
                                    textDecoration: "none",
                                    whiteSpace: "nowrap",
                                    transition:
                                      "background-color 0.15s ease-in-out, color 0.15s ease-in-out",
                                  }}
                                  onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = "#f8d7da"; // Light red on hover
                                    e.target.style.color = "#721c24"; // Darker red for hover
                                  }}
                                  onMouseLeave={(e) => {
                                    e.target.style.backgroundColor =
                                      "transparent";
                                    e.target.style.color = "#dc3545"; // Reset to red
                                  }}
                                  onClick={() => handleDelete(variant.Var_Id)}
                                >
                                  <i
                                    className="far fa-trash-alt"
                                    style={{
                                      marginRight: "10px",
                                      color: "#dc3545", // Red color for the icon
                                    }}
                                    onClick={() =>
                                      handleDelete(variant.Var_Id)
                                    }
                                  ></i>
                                  Delete
                                </a>
                              </li>
                            </ul>
                          </div>
                        </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {loader}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* EditVariantModal */}
      {editVariantModal && (
        <EditVariantModal
          show={editVariantModal}
          onHide={handleCloseEditModal}
          variant={selectedVariant}
          product={product}
        />
      )}
      {showVariantModal && (
        <VariantModal
        showVariant={handleShowVariantModal}
        handleVariantClose={handleVariantCloseModal}
          variant={selectedProduct}
          product={product}
        />
      )}
    </>
  );
};

export default ProductModal;

