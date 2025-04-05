import React, { useContext, useState , useEffect} from 'react';
import axios from 'axios';
import Modal from 'react-bootstrap/Modal'; // Use React Bootstrap Modal
import Button from 'react-bootstrap/Button';
import { UserContext, useUser } from '../../context/UserContext';
import api from '../../pages/Axios';
import AddNewValueModal from './AddNewValueModal';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import useFullPageLoader from '../../components/useFullPageLoader';


const VariantModal = ({ showVariant, handleVariantClose, product,variant, value }) => {
    const [variants, setVariants] = useState([]);
  
    const [showModal, setShowModal] = useState(false);
      const [unitOfMeasurements, setUnitOfMeasurements] = useState([]);
    
      const [values, setValues] = useState(["value1", "value2"]); // Initial dropdown values
      const [multipleValues, setValuesForMultiple] = useState([]);
      const [modalSrNo, setModalSrNo] = useState(null); // State to store the selected Sr_No for the modal
      const [variantType, setVariantType] = useState("");
      const [error, setError] = useState({});
      const [modalVariantType, setModalVariantType] = useState(null);
      const [varientDetails, setVarientDetail] = useState([]);
      const [loader,showLoader,hideLoader] = useFullPageLoader();
      const {user} = useUser();
  
    const [selectedSrNoVariant1, setSelectedSrNoVariant1] = useState(null);
    const [variantValuesVariant1, setVariantValuesVariant1] = useState([]);
    const [variantValuesVariant2, setVariantValuesVariant2] = useState([]);



      console.log(variant,product);
      
  
    const [formData, setFormData] = useState({
        VariantType: "Single",
        Variant1_Id: "",
        Variant_Name1:  "",
        Value1_Id:  "",
        Variant_Value1: "",
        Variant2_Id:  "",
        Variant_Name2:  "",
        Value2_Id: "",
        Variant_Value2:  "",
        Barcode: "", // Add Barcode if applicable
        Purchase_Price:  "0",
        MRP:  "0",
        Web_Price:  "0",
        Store_Price: "0",
        Stock:  "Yes",
        Qty: "0",
        UnitOfMeasurement: "",
        Product_Name: "",
        Featured_Image: "",
        Image_Name: "",
        Added_By: variant?.Added_By || `${user?.fname} ${user?.lname}`
      });
      

  
      useEffect(() => {
        
        const fetchUnitOfMeasurements = async () => {
          showLoader();
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
    const fetchVariants = async () => {
      showLoader();
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


  const fetchVariantValues = async (VarientTypeId, type) => {
    showLoader();
    try {
      const response = await api.get(
        `/viewVariantValuesForProducts/${user?.orgId}/${VarientTypeId}`
      );
      if (type === 1) {
        setVariantValuesVariant1(response.data);
      } else if (type === 2) {
        setVariantValuesVariant2(response.data);
      }
    } catch (error) {
      console.error("Error fetching variant values for Variant 1", error);
      setVariantValuesVariant1([]);
    }finally{
      hideLoader();
    }
  };

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

  const deleteVariant = (index) => {
    const updatedVariants = varientDetails.filter((_, i) => i !== index);
    setVarientDetail(updatedVariants);
  };


  const handleAddProduct = () => {
   // debugger;
    if (validation()) {
      const newVariant = {
        Variant1_Id: formData.Variant1_Id || null,
        Variant_Name1: formData.Variant_Name1 || "",
        Value1_Id: formData.Value1_Id || null,
        Variant_Value1: formData.Variant_Value1 || "",
        Variant2_Id: formData.Variant2_Id || null,
        Variant_Name2: formData.Variant_Name2 || "",
        Value2_Id: formData.Value2_Id || null,
        Variant_Value2: formData.Variant_Value2 || "",
        Barcode: formData.Barcode || "", // Add Barcode if applicable
        Purchase_Price: formData.Purchase_Price,
        MRP: formData.MRP,
        Web_Price: formData.Web_Price,
        Store_Price: formData.Store_Price,
        Stock: formData.Stock,
        Qty: formData.Qty,
        Product_Name:
          product?.Prod_Name +
          " " +
          formData.Variant_Value1 +
          " " +
          formData.Variant_Value2,
        Featured_Image: formData.Featured_Image,
        Image_Name: formData.Image_Name,
        Added_By: `${user.fname} ${user?.lname}`,
      };

      

      // Update the variantDetails array
      setVarientDetail((prevDetails) => [...prevDetails, newVariant]);
      //console.log("Variants",newVariant);
      
    }
  };


  const handleEdit = () => {
    // Setting the product details


    setFormData((prevState) => ({
      ...prevState,
       Variant1_Id: formData.Variant1_Id || null,
        Variant_Name1: formData.Variant_Name1 || "",
        Value1_Id: formData.Value1_Id || null,
        Variant_Value1: formData.Variant_Value1 || "",
        Variant2_Id: formData.Variant2_Id || null,
        Variant_Name2: formData.Variant_Name2 || "",
        Value2_Id: formData.Value2_Id || null,
        Variant_Value2: formData.Variant_Value2 || "",
        Barcode: formData.Barcode || "", // Add Barcode if applicable
        Purchase_Price: formData.Purchase_Price,
        MRP: formData.MRP,
        Web_Price: formData.Web_Price,
        Store_Price: formData.Store_Price,
        Stock: formData.Stock,
        Qty: formData.Qty,
        Product_Name:
          product?.Prod_Name +
          " " +
          formData.Variant_Value1 +
          " " +
          formData.Variant_Value2,
        Featured_Image: formData.Featured_Image,
        Image_Name: formData.Image_Name,
        Added_By: `${user.fname} ${user?.lname}`,
    }));

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
  
  // Create a new variant object
  if (!formData.Featured_Image) {
    error.Featured_Image = "Please Select Featured Image";
  }
  if (formData.Image_Name.length === 0) {
    error.Image_Name = "Please Select atleast One Image";
  }
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
    const formDataPayload = new FormData(); // Create a FormData object

    formDataPayload.append("VarientType",formData.VariantType)
    formDataPayload.append("UnitOfMeasurement",formData.UnitOfMeasurement)
    formDataPayload.append("Branch_Id",user?.branchId)
    formDataPayload.append("Admin_Id",user?.userId)
    formDataPayload.append("Org_Id",user?.orgId)
    formDataPayload.append("Added_By",`${user?.fname || "Admin"} ${user?.lname}`)



    



  
    // Iterate over variant details and append data
    varientDetails.forEach((variant) => {
      const variantData = {
        Variant1_Id: variant.Variant1_Id,
        Variant_Name1: variant.Variant_Name1,
        Value1_Id: variant.Value1_Id,
        Variant_Value1: variant.Variant_Value1,
        Variant2_Id: variant.Variant2_Id,
        Variant_Name2: variant.Variant_Name2,
        Value2_Id: variant.Value2_Id,
        Variant_Value2: variant.Variant_Value2,
        Barcode: variant.Barcode || null,
        Purchase_Price: variant.Purchase_Price,
        MRP: variant.MRP,
        Web_Price: variant.Web_Price,
        Store_Price: variant.Store_Price,
        Stock: variant.Stock,
        Qty: variant.Qty,
        Product_Name: variant.Product_Name,
        Added_By: variant.Added_By,
      };
  
      // Append Featured_Image
      if (variant.Featured_Image && variant.Featured_Image instanceof File) {
        formDataPayload.append("Featured_Image", variant.Featured_Image);
        console.log("Featured_Image:", variant.Featured_Image);
        variantData.Featured_Image = variant.Featured_Image.name;
      }
  
      // Append multipleImages
      if (variant.Image_Name && Array.isArray(variant.Image_Name)) {
        variantData.Image_Name = [];
        variant.Image_Name.forEach((image, imgIndex) => {
          if (image instanceof File) {
            formDataPayload.append("Image_Name", image);
            console.log(`Image ${imgIndex + 1}:`, image);
            variantData.Image_Name.push(image.name);
          } else {
            console.warn(`Invalid image at index ${imgIndex}`);
          }
        });
      }
  
      // Append variant data as a JSON string
      formDataPayload.append("variants", JSON.stringify(variantData)); // Use a generic key 'variants' instead of 'variants_${index}'
    });
  
  
    // Log all appended fields for debugging
    console.log("All Appended Fields:");
    formDataPayload.forEach((value, key) => {
      console.log(key, value);
    });
  
    // API call
    api
      .post(`/addProductVariants/${product?.Prod_Id}`, formDataPayload, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((response) => {
        console.log("Variant added:", response.data);
  
        // Show success alert
        Swal.fire({
          title: "Success!",
          text: "Variant added successfully!",
          icon: "success",
          confirmButtonText: "OK",
        });
  
        handleVariantClose(); // Close the modal
      })
      .catch((error) => {
        console.error("Error adding variant:", error);
  
        // Show error alert
        Swal.fire({
          title: "Error!",
          text: "Failed to add the variant. Please try again.",
          icon: "error",
          confirmButtonText: "OK",
        }).finally(()=>{
          hideLoader();
        })
      });
  };
  


  
  

  


  
  

  return (
    <Modal show={showVariant} size='lg' centered >
      <Modal.Header >
      <Modal.Title>
    {variant?.Var_Id
      ? `Edit Variant for ${variant?.Product_Name}`
      : `Add Variant for ${product?.Prod_Name || ""}`}
  </Modal.Title>
          {/* Custom Cross Button */}
          <button
            type="button"
            className="btn-close"
            aria-label="Close"
            onClick={handleVariantClose}
            style={{
                position: "absolute",
                right: "16px",
                top: "16px",
                backgroundColor: "transparent",
                border: "none",
                fontSize: "20px",
                cursor: "pointer",
                color: "black", // Initial color (black)
                transition: "color 0.3s ease", // Smooth color transition
            }}
            onMouseEnter={(e) => e.target.style.color = 'red'} // Change color on hover
            onMouseLeave={(e) => e.target.style.color = 'black'} // Revert to black when hover ends
            >
            &#10005;
          </button>

      </Modal.Header>
      <Modal.Body>
        <form className='form-horizontal' onSubmit={handleSubmit}>
        <div className="row form-group">
                  {/* Conditionally render Variant Type, Variant 1, and Value 1 based on user?.isVariant */}
                  {user?.isVariant === "1" && (
                    <>
                      {/* Variant Type Dropdown */}
                      <div className="col-3">
                        <label
                            htmlFor="variant-type-dropdown"
                            className="control-label"
                        >
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
                        <label
                          htmlFor="single-dropdown"
                          className="control-label"
                        >
                          Variant 1<span className="text-danger">*</span>
                        </label>
                        <select
                          className="form-control"
                          disabled={!formData.VariantType}
                          id="single-dropdown"
                          value={formData.Variant1_Id}
                          onChange={(e) => {
                            const selectedVariantId = e.target.value;
                            const selectedVariant =
                              e.target.options[e.target.selectedIndex].text;

                            setFormData((prevState) => ({
                              ...prevState,
                              Variant1_Id: selectedVariantId, // Update Variant1_Id
                              Variant_Name1: selectedVariant, // Update Variant_Name1
                            }));
                            fetchVariantValues(e.target.value, 1);
                          }}
                        >
                          <option value="" disabled>Select Variant 1</option>
                          {variants.map((variant) => (
                            <option key={variant.Sr_No} value={variant.Sr_No}>
                              {variant.VariantType}
                            </option>
                          ))}
                        </select>
                        <p className="text-danger mb-0">
                          {error.Variant_Type_1}
                        </p>
                      </div>

                      {/* Value 1 Dropdown */}
                      <div className="col-3">
                        <label
                          htmlFor="single-dropdown"
                          className="control-label"
                        >
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

                            

                            handleShowModal(
                            formData.Value1_Id,
                            formData.Variant_Name1 || "Unknown"
                            );
                        }}
                        style={{
                            color: "blue",
                            margin: "0px 20px",
                            textDecoration: "underline",
                        }}
                        >
                        {" "}
                        Add New{" "}
                        </Link>



                        <select
                          className="form-control"
                          disabled={!formData.Variant1_Id}
                          value={formData.Value1_Id} // Bind to formData.Variant1_Id
                          onChange={(e) => {
                            const selectedVariantId = e.target.value;
                            const selectedVariant =
                              e.target.options[e.target.selectedIndex].text;
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
                            <> </>
                          )}
                        </select>
                        <p className="text-danger mb-0">
                          {error.Variant_Value_1}
                        </p>
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

                  {/* Submit Button */}
                  <div className="row form-group margin-top-20" style={{ margin: "0px 440px" }}>
                      <button
                        className="btn btn-info"
                        type="button"
                        onClick={handleAddProduct}
                        style={{margin:"0px -70px"}}
                      >
                        Add Variants
                      </button>
                    </div>
                 </div>

                  {user?.isVariant === "1" && varientDetails.length > 0 && (
                    <div className="row">
                      <div className="col-md-12">
                        <table className="table table-striped table-bordered display dataTable">
                          <thead>
                            <tr>
                              <th>Product Name</th>
                              <th>Purchase Price</th>
                              <th>MRP</th>
                              <th>Website Price</th>
                              <th>Store Price</th>
                              <th>Quantity</th>
                              <th>Operations</th>
                            </tr>
                          </thead>
                          <tbody>
                            {varientDetails.length > 0 ? (
                              varientDetails.map((product, index) => (
                                <tr key={index}>
                                  <td
                                    className="text-truncate cursor-pointer"
                                    style={{ maxWidth: "200px" }}
                                    data-bs-toggle="tooltip"
                                    data-bs-placement="top"
                                    title={product.Product_Name}
                                  >
                                    {product.Product_Name}
                                  </td>
                                  <td>{product.Web_Price}</td>
                                  <td>{product.Purchase_Price}</td>
                                  <td>{product.MRP}</td>
                                  <td>{product.Store_Price}</td>
                                  <td>{product.Qty}</td>
                                  <td className="text-center">
                                    <i
                                      className="far fa-trash-alt"
                                      style={{
                                        cursor: "pointer",
                                        color: "#dc3545", // Initially red
                                        fontSize: "1.5rem", // Slightly larger size for better visibility
                                        transition:
                                          "color 0.2s ease, transform 0.2s ease", // Smooth color and scaling animations
                                      }}
                                      onMouseEnter={(e) => {
                                        e.target.style.color = "#e74c3c"; // Red color on hover
                                        e.target.style.transform = "scale(1.2)"; // Scale up on hover
                                      }}
                                      onMouseLeave={(e) => {
                                        e.target.style.color = "black"; // Reset to black on hover out
                                        e.target.style.transform = "scale(1)"; // Reset scale
                                      }}
                                      onClick={() => deleteVariant(index)}
                                    />
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="7">No products found</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                  

          <Button type="submit" className='mt-4' style={{float:"right"}}>Save </Button>
        </form>
        {loader}
      </Modal.Body>
    </Modal>
  );
};

export default VariantModal;
