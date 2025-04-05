import React, { useContext, useEffect, useState } from 'react';
import { Modal, Table, Button } from 'react-bootstrap';
import { UserContext, useUser } from '../../context/UserContext';
import AddNewValueModal from './AddNewValueModal';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from '../../pages/Axios';
import useFullPageLoader from '../../components/useFullPageLoader';


function EditVariantModal({ variant, show, onHide,product }) {
  const [variants, setVariants] = useState([]);
  
  const [showModal, setShowModal] = useState(false);
    const [unitOfMeasurements, setUnitOfMeasurements] = useState([]);
    const [loader,showLoader,hideLoader] = useFullPageLoader();
  
    const [values, setValues] = useState(["value1", "value2"]); // Initial dropdown values
    const [multipleValues, setValuesForMultiple] = useState([]);
    const [modalSrNo, setModalSrNo] = useState(null); // State to store the selected Sr_No for the modal
    const [variantType, setVariantType] = useState("");
    const {user} = useUser();
    const [error, setError] = useState({});
    const [modalVariantType, setModalVariantType] = useState(null);
    const [varientDetails, setVarientDetail] = useState([]);

  const [selectedSrNoVariant1, setSelectedSrNoVariant1] = useState(null);
  const [variantValuesVariant1, setVariantValuesVariant1] = useState([]);
  const [variantValuesVariant2, setVariantValuesVariant2] = useState([]);



    console.log(variant);
    

  const [formData, setFormData] = useState({
      VariantType: variant?.VarientType ||  "Single",
      Variant1_Id: variant?.Variant1_Id || "",
      Variant_Name1: variant?.Variant_Name1 || "",
      Value1_Id: variant?.Value1_Id || "",
      Variant_Value1: variant?.Variant_Value1 || "",
      Variant2_Id: variant?.Variant2_Id || "",
      Variant_Name2: variant?.Variant_Name2 || "",
      Value2_Id: variant?.Value2_Id || "",
      Variant_Value2: variant?.Variant_Value2 || "",
      Barcode: variant?.Barcode || "", // Add Barcode if applicable
      Purchase_Price: variant?.Purchase_Price || "0",
      MRP: variant?.MRP || "0",
      Web_Price: variant?.Web_Price || "0",
      Store_Price: variant?.Store_Price || "0",
      Stock: variant?.Stock || "Yes",
      Qty: variant?.Qty || "0",
      UnitOfMeasurement: variant?.UnitOfMeasurement || "",
      Product_Name:variant?.Product_Name || "",
      Featured_Image: variant?.Featured_Image || null,
      Image_Name: variant?.Image_Name || null,
      Added_By: variant?.Added_By || `${user?.fname} ${user?.lname}`

    });
    


    useEffect(() => {
      showLoader();
      const fetchUnitOfMeasurements = async () => {
        try {
          const response = await api.get(`/viewMeasurements/${user?.orgId}`); // Replace 5 with the actual Org_Id you want to query
          setUnitOfMeasurements(response.data); // Assuming the response is an array of unit measurements
        } catch (error) {
          console.error("Error fetching unit of measurements", error);
        }finally{
          hideLoader();
        }
      };
  
      fetchUnitOfMeasurements();
    }, [user?.orgId]);


useEffect(() => {
  showLoader();
  const fetchVariants = async () => {
    try {
      const response = await api.get(
        `/viewVariantTypesForProducts/${user?.orgId}`
      ); // Adjust the API endpoint accordingly
      setVariants(response.data);
    } catch (error) {
      console.error("Error fetching variants", error);
    }finally{
      hideLoader();
    }
  };
  fetchVariants();
}, [user?.orgId]);


  // Function to fetch variant values for Variant 1
  const fetchVariantValues = async (VariantTypeId, type) => {
    showLoader();

    try {
      const response = await api.get(
        `/viewVariantValuesForProducts/${user?.orgId}/${VariantTypeId}`
      );
      console.log("API Response:", response.data); // Log the response data for debugging

      if (type === 1) {
        setVariantValuesVariant1(response.data); // Set Variant 1 values
      } else if (type === 2) {
        setVariantValuesVariant2(response.data); // Set Variant 2 values
      }
    } catch (error) {
      console.error("Error fetching variant values for Variant 1", error);
      setVariantValuesVariant1([]); // Clear variant values in case of error
    }finally{
      hideLoader();
    }
  };

  // UseEffect to fetch Variant 1 values when `Variant1_Id` changes
  useEffect(() => {
    if (formData.Variant1_Id) {
      fetchVariantValues(formData.Variant1_Id, 1); // Fetch values for Variant 1
    }
  }, [formData.Variant1_Id]);

 // Handle modal show
 const handleShowModal = (srNo, variantType) => {
  setModalSrNo(srNo);
  setModalVariantType(variantType);
  setShowModal(true);
};

// Handle modal close
const handleCloseModal = () => {
  setShowModal(false);
  fetchVariantValues();
};

// Handle adding new value (this should handle adding the new value to the appropriate values state)
const handleAddValue = (newValue) => {
  if (variantType === "variant2") {
    // If multiple variant type is selected, add to multipleValues
    setValuesForMultiple([...multipleValues, newValue]);
  } else {
    // Add to the single values state if variant type is single
    setValues([...values, newValue]);
  }
  setShowModal(false);
};



// Handle input change for the form fields
const handleInputChange = (e) => {
  const { name, value } = e.target;
  setFormData((prevState) => ({
    ...prevState,
    [name]: value,
  }));
};


const validation = () => {
let error = {};


if (!formData.Variant_Name1) {
  error.Variant_Type_1 = "Please Select Variant Type";
}
if (!formData.Variant_Value1) {
  error.Variant_Value_1 = "Please Select Variant Value";
}
if (formData.VarientType === "Multiple" && !formData.Variant_Name2) {
  error.Variant_Type_2 = "Please Select Variant Type";
}
if (formData.VarientType === "Multiple" && !formData.Variant_Value2) {
  error.Variant_Value_2 = "Please Select Variant Value";
}
if (!formData.Purchase_Price) {
  error.Purchase_Price = "Enter Purchase Price";
}
if (!formData.MRP) {
  error.MRP = "Enter MRP";
}
if (!formData.Web_Price) {
  error.Web_Price = "Enter Web Price";
}
if (!formData.Store_Price) {
  error.Store_Price = "Enter Store Price";
}
if (!formData.Qty) {
  error.Qty = "Enter Quantity";
}

setError(error);

// If there are any errors, show them in a Swal alert
if (Object.keys(error).length > 0) {
  Swal.fire({
    title: 'Validation Error',
    text: 'Please correct the highlighted fields.',
    icon: 'error',
    confirmButtonText: 'OK',
  });
}

return Object.keys(error).length === 0;
};

// Handle form submission

const handleSubmit = (e) => {
  e.preventDefault();
  showLoader();
  if (!validation()) return;


  const formDataPayload = new FormData(); // Create a FormData object

  // Append general fields
  formDataPayload.append("VarientType", formData.VariantType);
  formDataPayload.append("UnitOfMeasurement", formData.UnitOfMeasurement);
  formDataPayload.append("Branch_Id", user?.branchId);
  formDataPayload.append("Admin_Id", user?.userId);
  formDataPayload.append("Org_Id", user?.orgId);
  formDataPayload.append(
    "Added_By",
    `${user?.fname || "Admin"} ${user?.lname || ""}`
  );
  formDataPayload.append("Is_Variant",user?.isVariant)

  // Append variant details
  formDataPayload.append("Variant1_Id", formData.Variant1_Id || null);
  formDataPayload.append("Variant_Name1", formData.Variant_Name1 || "");
  formDataPayload.append("Value1_Id", formData.Value1_Id || null);
  formDataPayload.append("Variant_Value1", formData.Variant_Value1 || "");
  formDataPayload.append("Variant2_Id", formData.Variant2_Id || null);
  formDataPayload.append("Variant_Name2", formData.Variant_Name2 || "");
  formDataPayload.append("Value2_Id", formData.Value2_Id || null);
  formDataPayload.append("Variant_Value2", formData.Variant_Value2 || "");

  // Append pricing and stock information
  formDataPayload.append("Barcode", formData.Barcode || "");
  formDataPayload.append("Purchase_Price", formData.Purchase_Price);
  formDataPayload.append("MRP", formData.MRP);
  formDataPayload.append("Web_Price", formData.Web_Price);
  formDataPayload.append("Store_Price", formData.Store_Price);
  formDataPayload.append("Stock", formData.Stock);
  formDataPayload.append("Qty", formData.Qty);

  // Append product name and images
  formDataPayload.append(
    "Product_Name",
    `${product?.Prod_Name || ""} ${formData.Variant_Value1 || ""} ${formData.Variant_Value2 || ""}`
  );

  if (formData.Featured_Image) {
    formDataPayload.append("Featured_Image", formData.Featured_Image);
  }

  if (formData.Image_Name) {
    Array.from(formData.Image_Name).forEach((image) => {
      formDataPayload.append("Image_Name", image);
    });
  }

  // Log all appended fields for debugging
  console.log("All Appended Fields:");
  formDataPayload.forEach((value, key) => {
    console.log(key, value);
  });

  // API call to edit the variant
  api
    .put(`/EditVariant/${variant?.Var_Id}`, formDataPayload, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((response) => {
      console.log("Variant updated successfully:", response.data);

      // Show success alert
      Swal.fire({
        title: "Success!",
        text: "Variant updated successfully!",
        icon: "success",
        confirmButtonText: "OK",
      });
      onHide();
    })
    .catch((error) => {
      console.error("Error updating variant:", error);

      // Show error alert
      Swal.fire({
        title: "Error!",
        text: "Failed to update the variant. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
      }).finally(() => {
        hideLoader(); // Hide the loader in the finally block to ensure it always runs
      });
    });
};



useEffect(() => {
  if (formData.Variant2_Id) {
    fetchVariantValues(formData.Variant2_Id, 2); // Fetch values for Variant 2
  }
}, [formData.Variant2_Id]); 

  
  return (
    <Modal show={show} onHide={onHide} size='lg' centered>
      <Modal.Header >
      <button
            type="button"
            className="btn-close"
            aria-label="Close"
            onClick={onHide}
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
        <Modal.Title>Edit Variant For {variant?.Product_Name}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
      <form className='form-horizontal' onSubmit={handleSubmit}>
        <div className="row form-group">
                  {/* Conditionally render Variant Type, Variant 1, and Value 1 based on user?.isVariant */}
                  {user?.isVariant === "1" && (
  <>
    {/* Variant Type Dropdown */}
    <div className="col-3">
      <label htmlFor="variant-type-dropdown" className="control-label">
        Variant Type<span className="text-danger">*</span>
      </label>
      <select
        className="form-control"
        id="variant-type-dropdown"
        value={formData.VariantType} // Correct spelling
        name="VariantType" // Ensure consistency
        onChange={(e) => {
          setFormData((prevState) => ({
            ...prevState,
            VariantType: e.target.value, // Correct spelling
            Variant_Name2: "",
            Variant2_Id: "0",
            Variant_Value2: "",
            Value2_Id: "0",
          }));
        }}
      >
        <option value="Single">Single</option>
        <option value="Multiple">Multiple</option>
      </select>
    </div>

    {/* Variant 1 Dropdown */}
    <div className="col-3">
      <label htmlFor="single-dropdown" className="control-label">
        Variant 1<span className="text-danger">*</span>
      </label>
      <select
        className="form-control"
        disabled={!formData.VariantType}
        id="single-dropdown"
        value={formData.Variant1_Id}
        onChange={(e) => {
          const selectedVariantId = e.target.value;
          const selectedVariant = e.target.options[e.target.selectedIndex].text;

          setFormData((prevState) => ({
            ...prevState,
            Variant1_Id: selectedVariantId, // Update Variant1_Id
            Variant_Name1: selectedVariant, // Update Variant_Name1
          }));

          fetchVariantValues(selectedVariantId, 1); // Fetch values for Variant 1
        }}
      >
        <option value="" disabled>
          Select Variant 1
        </option>
        {variants.map((variant) => (
          <option key={variant.Sr_No} value={variant.Sr_No}>
            {variant.VariantType}
          </option>
        ))}
      </select>
      <p className="text-danger mb-0">{error.Variant_Type_1}</p>
    </div>

    {/* Value 1 Dropdown */}
    <div className="col-3">
      <label htmlFor="single-dropdown" className="control-label">
        Value 1<span className="text-danger">*</span>
      </label>
      <Link
        variant="link"
        onClick={() => {
          if (!formData.Variant_Name1) {
            Swal.fire({
              icon: "error",
              title: "Oops...",
              text: "Please select a variant first before adding a new value!",
            });
            return; // Prevent further execution
          }

          handleShowModal(formData.Value1_Id, formData.Variant_Name1 || "Unknown");
        }}
        style={{
          color: "blue",
          margin: "0px 20px",
          textDecoration: "underline",
        }}
      >
        Add New
      </Link>

      <select
        className="form-control"
        disabled={!formData.Variant1_Id}
        value={formData.Value1_Id || ""} // Make sure it has a valid value
        onChange={(e) => {
          const selectedVariantId = e.target.value;
          const selectedVariant = e.target.options[e.target.selectedIndex].text;

          setFormData((prevState) => ({
            ...prevState,
            Variant_Value1: selectedVariant, // Update Variant_Value1
            Value1_Id: selectedVariantId, // Update Value1_Id
          }));
        }}
      >
        <option value="">Select Value 1</option>
        {variantValuesVariant1.length > 0 ? (
          variantValuesVariant1.map((value, index) => (
            <option key={index} value={value.Sr_No}>
              {value.VariantValue}
            </option>
          ))
        ) : (
          <></> // Handle empty state
        )}
      </select>
      <p className="text-danger mb-0">{error.Variant_Value_1}</p>

      {/* Add New Value Modal */}
      <AddNewValueModal
        show={showModal}
        handleClose={handleCloseModal}
        handleAddValue={handleAddValue}
        srNo={modalSrNo}
        variantType={modalVariantType}
      />
    </div>
  </>
)}

                  {/* Conditionally render Variant 2 and Value 2 when Variant Type is "Multiple" */}
                  {formData.VariantType === "Multiple" &&  (
                  <>
                    {/* Variant 2 Dropdown */}
                    <div className="col-3">
                    <label htmlFor="multiple-dropdown" className="control-label">
                      Variant 2<span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-control"
                      id="multiple-dropdown"
                      value={formData.Variant2_Id}
                      onChange={(e) => {
                        const selectedVariantId = e.target.value;
                        const selectedVariant = e.target.options[e.target.selectedIndex].text;
                        if (formData.Variant1_Id === e.target.value) {
                          Swal.fire({
                            title: 'Variant Already Selected!',
                            text: 'Variant type 1 and variant type 2 cannot be the same.',
                            icon: 'error',
                            confirmButtonText: 'OK',
                          });
                        } else {
                          setFormData((prevState) => ({
                            ...prevState,
                            Variant_Name2: selectedVariant, // Update Variant_Name2
                            Variant2_Id: selectedVariantId, // Update Variant2_Id
                          }));

                          fetchVariantValues(e.target.value, 2);
                        }
                      }}
                    >
                      <option value="">Select Variant 2</option>
                      {variants.map((variant) => (
                        <option key={variant.Sr_No} value={variant.Sr_No}>
                          {variant.VariantType}
                        </option>
                      ))}
                    </select>
                    <p className="text-danger mb-0">{error.Variant_Type_2}</p>
                    </div>

                    {/* Value 2 Dropdown */}
                    <div className="col-3">
                      <label htmlFor="multiple-dropdown" className="control-label">
                        Value 2<span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-control"
                        disabled={!formData.Variant2_Id}
                        value={formData.Value2_Id} // Bind to formData.Variant_Value2
                        onChange={(e) => {
                          const selectedVariantId = e.target.value;
                          const selectedVariant =
                            e.target.options[e.target.selectedIndex].text;
                          setFormData((prevState) => ({
                            ...prevState,
                            Variant_Value2: selectedVariant, // Update Variant_Value2
                            Value2_Id: selectedVariantId, // Update Value2_Id
                          }));
                        }}
                      >
                        <option value="">Select Value 2</option>
                        {variantValuesVariant2.length > 0 ? (
                          variantValuesVariant2.map((value, index) => (
                            <option key={index} value={value.Sr_No}>
                              {value.VariantValue}
                            </option>
                          ))
                        ) : (
                          <></>
                        )}
                      </select>
                      <p className="text-danger mb-0">{error.Variant_Value_2}</p>
                      {/* Add New Value Modal */}
                      <AddNewValueModal
                        show={showModal}
                        handleClose={handleCloseModal}
                        handleAddValue={handleAddValue}
                        srNo={modalSrNo}
                      />
                    </div>
                  </>
                  )}
                  <div className="col-3">
                    <label
                      htmlFor="category-dropdown"
                      className="control-label"
                    >
                      In Stock
                    </label>
                    <select
                      name="Stock"
                      className="form-control"
                      id="category-dropdown"
                      value={formData.Stock} // Bind the value to the state
                      onChange={handleInputChange}
                    >
                      <option value="" disabled selected>
                        Select In Stock
                      </option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                  <div className="col-3">
                    <label
                      htmlFor="unit-of-measurement-dropdown"
                      className="control-label"
                    >
                      Unit Of Measurement<span className="text-danger">*</span>
                    </label>
                    <select
                      name="UnitOfMeasurement"
                      className="form-control"
                      id="unit-of-measurement-dropdown"
                      value={formData.Unit_id} // Controlled by Unit_id in formData
                      onChange={(e) => {
                        const selectedUnitId = e.target.value;
                        const selectedUnit =
                          e.target.options[e.target.selectedIndex].text;
                        setFormData((prevState) => ({
                          ...prevState,
                          Unit_id: selectedUnitId, // Update Unit_id
                          UnitOfMeasurement: selectedUnit, // Update UnitOfMeasurement
                        }));
                      }}
                    >
                      <option value="" disabled>
                        Select Unit of Measurement
                      </option>
                      {unitOfMeasurements.map((unit) => (
                        <option key={unit.Id} value={unit.Id}>
                          {unit.Measurement_Type}
                        </option>
                      ))}
                    </select>
                    <p className="text-danger mb-0">{error.UM}</p>
                  </div>

                  {/* Purchase Price Input */}
                  <div className="col-3">
                    <label htmlFor="purchase-price" className="control-label">
                      Purchase Price<span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="purchase-price"
                      placeholder="Enter Purchase Price"
                      name="Purchase_Price"
                      value={formData.Purchase_Price}
                      onChange={handleInputChange}
                    />
                    <p className="text-danger mb-0">{error.Purchase_Price}</p>
                  </div>

                  {/* MRP Input */}
                  <div className={formData.VariantType === "Multiple" ? "col-4" : "col-3"}>
                    <label htmlFor="MRP" className="control-label">
                      MRP<span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="MRP"
                      placeholder="Enter MRP"
                      name="MRP"
                      onChange={handleInputChange}
                      value={formData.MRP}
                    />
                    <p className="text-danger mb-0">{error.MRP}</p>
                  </div>

                  {/* Web Price Input */}
                  <div className={formData.VariantType === "Multiple" ? "col-4" : "col-3"}>
                    <label htmlFor="web-price" className="control-label">
                      Web Price<span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="web-price"
                      placeholder="Enter Web Price"
                      name="Web_Price"
                      onChange={handleInputChange}
                      value={formData.Web_Price}
                    />
                    <p className="text-danger mb-0">{error.Web_Price}</p>
                  </div>

                  {/* Store Price Input */}
                  <div className={formData.VariantType === "Multiple" ? "col-4" : "col-6"}>
                    <label htmlFor="store-price" className="control-label">
                      Store Price<span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="store-price"
                      placeholder="Enter Store Price"
                      onChange={handleInputChange}
                      value={formData.Store_Price}
                      name="Store_Price"
                    />
                    <p className="text-danger mb-0">{error.Store_Price}</p>
                  </div>

                  {/* Quantity Input */}
                  <div className ={formData.VariantType === "Single" ? "col-6" : "col-4"}>
                    <label htmlFor="quantity1" className="control-label">
                        Quantity<span className="text-danger">*</span>
                    </label>
                    <input
                        type="text"
                        className="form-control"
                        id="quantity1"
                        placeholder="Enter Quantity"
                        onChange={handleInputChange}
                        value={formData.Qty}
                        name="Qty"
                    />
                    <p className="text-danger mb-0">{error.Variant_Quantity}</p>
                    </div>

                    <div className={formData.VariantType === "Single" ? "col-6" : "col-4"}>
                    <label htmlFor="Featured_Img" className="control-label">
                        Feature Image<span className="text-danger">*</span>
                    </label>
                    <input
                        type="file"
                        className="form-control"
                        id="Featured_Img"
                        accept="image/*"
                        name="Featured_Image"
                        onChange={(e) => {
                        const file = e.target.files[0]; // Get the selected file
                        console.log('Selected Featured Image:', file); // Debugging step

                        setFormData((prevState) => ({
                            ...prevState,
                            Featured_Image: file, // Store the file in the state
                        }));
                        }}
                    />
                    <small className="form-text text-muted">
                        Note: Image should not be greater than 1MB.
                    </small>
                    <p className="text-danger mb-0">{error.Featured_Image}</p>
                    </div>

                    <div className={formData.VariantType === "Single" ? "col-6" : "col-4"}>
                    <label htmlFor="multipleImages" className="control-label">
                        Multiple Images<span className="text-danger">*</span>
                    </label>
                    <input
                        type="file"
                        className="form-control"
                        id="multipleImages"
                        accept="image/*"
                        multiple
                        name="Image_Name"
                        onChange={(e) => {
                        const files = Array.from(e.target.files); // Convert FileList to an array
                        console.log('Selected Multiple Images:', files); // Debugging step

                        setFormData((prevState) => ({
                            ...prevState,
                            Image_Name: files, // Store the array of files
                        }));
                        }}
                    />
                    <small className="form-text text-muted">
                        Note: Image should not be greater than 1MB.
                    </small>
                    <p className="text-danger mb-0">{error.Multiple_Image}</p>
                    </div>
                 </div>
                  

          <Button type="submit" className='mt-4' style={{float:"right"}}>Save </Button>
        </form>
              </Modal.Body>
    </Modal>
  );
}

export default EditVariantModal;
