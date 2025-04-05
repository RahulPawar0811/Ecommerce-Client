import { React, useEffect, useState, useContext } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { Button } from "react-bootstrap";
import AddNewValueModal from "./modals/AddNewValueModal";
import { UserContext, useUser } from "../context/UserContext";
import api from "../pages/Axios";
import Swal from "sweetalert2";
import useFullPageLoader from "../components/useFullPageLoader";

function AddProducts() {
  const {Prod_Id} = useParams();
  const [showModal, setShowModal] = useState(false);
  const [values, setValues] = useState(["value1", "value2"]); // Initial dropdown values
  const [multipleValues, setValuesForMultiple] = useState([]);
  const [modalSrNo, setModalSrNo] = useState(null); // State to store the selected Sr_No for the modal
  const [variantType, setVariantType] = useState("");
  const { user } = useUser();
  const categoryClassName = `col-${user?.isSubCat === "0" ? "6" : "4"}`;
  const productNameClassName = `col-${user?.isSubCat === "0" ? "6" : "4"}`;
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({});
  const orgId = user?.orgId || undefined;
  const [unitOfMeasurements, setUnitOfMeasurements] = useState([]);
  const [gstCategories, setGstCategories] = useState([]);
  const [variants, setVariants] = useState([]);
  const [selectedSrNoVariant1, setSelectedSrNoVariant1] = useState(null);
  const [variantValuesVariant1, setVariantValuesVariant1] = useState([]);
  const [variantValuesVariant2, setVariantValuesVariant2] = useState([]);
  const [modalVariantType, setModalVariantType] = useState(null);
  const [products, setProducts] = useState([0])
  const [productVariants,setProductVariants] = useState([])
  const [varientDetails, setVarientDetail] = useState([]);
  const navigate = useNavigate();
  const [loader,showLoader,hideLoader] = useFullPageLoader();
  const [formData, setFormData] = useState({
    Prod_Code: "",
    Branch_Id: user?.branchId,
    Org_Id: user?.orgId,
    Admin_Id: user?.userId,
    Cat_Id: "",
    Cat_Name: "",
    Sub_Cat_Id: "",
    Sub_at_Name: "",
    Prod_Name: "",
    HSN_Code: "",
    Featured_Img: "",
    Img_360: "",
    Short_Description: "",
    VideoLink: "",
    Brand_Name: "",
    Manufacturer_Name: "",
    Avg_Rating: "0",
    Prod_Description: "",
    Param1: "",
    Param1_Val: "",
    Param2: "",
    Param2_Val: "",
    Param3: "",
    Param3_Val: "",
    Param4: "",
    Param4_Val: "",
    Param5: "",
    Param5_Val: "",
    Purchase_Price: "0",
    MRP: "0",
    Web_Price: "0",
    Store_Price: "0",
    InStock: "Yes",
    Is_Variant: user?.isVariant,
    VarientType: "Single",
    GST_Applicable: "",
    GST_Category: "",
    GST_Rate: "0",
    Unit_id: "",
    UnitOfMeasurement: "",
    Status: "1",
    quantity1:"",
    Qty: "0",
    SEOTitle: "",
    SEODes: "",
    SEOKeyword: "",
    Product_Name: "",
    Variant1_Id: "",
    Variant_Name1: "",
    Value1_Id: "",
    Variant_Value1: "",
    Variant2_Id: "",
    Variant_Name2: "",
    Value2_Id: "",
    Variant_Value2: "",
    Barcode: "",
    multipleImages: [],
  });


  const handleEdit = (products) => {
    // Setting the product details


    setFormData((prevState) => ({
      ...prevState,
      Prod_Code: products.Prod_Code || "",
      Branch_Id: products.Branch_Id || user?.branchId,
      Org_Id: products.Org_Id || user?.orgId,
      Admin_Id: products.Admin_Id || user?.userId,
      Cat_Id: products.Cat_Id || "",
      Cat_Name: products.Cat_Name || "",
      Sub_Cat_Id: products.Sub_Cat_Id || "",
      Sub_at_Name: products.Sub_at_Name || "",
      Prod_Name: products.Prod_Name || "",
      HSN_Code: products.HSN_Code || "",
      Featured_Img: products.Featured_Img || "",
      Img_360: products.Img_360 || "",
      Short_Description: products.Short_Description || "",
      VideoLink: products.VideoLink || "",
      Brand_Name: products.Brand_Name || "",
      Manufacturer_Name: products.Manufacturer_Name || "",
      Avg_Rating: products.Avg_Rating || "0",
      Prod_Description: products.Prod_Description || "",
      Param1: products.Param1 || "",
      Param1_Val: products.Param1_Val || "",
      Param2: products.Param2 || "",
      Param2_Val: products.Param2_Val || "",
      Param3: products.Param3 || "",
      Param3_Val: products.Param3_Val || "",
      Param4: products.Param4 || "",
      Param4_Val: products.Param4_Val || "",
      Param5: products.Param5 || "",
      Param5_Val: products.Param5_Val || "",
      Purchase_Price: products.Purchase_Price || "0",
      MRP: products.MRP || "0",
      Web_Price: products.Web_Price || "0",
      Store_Price: products.Store_Price || "0",
      InStock: products.InStock || "Yes",
      Is_Variant: products.Is_Variant || user?.isVariant,
      VarientType: products.VarientType,
      GST_Applicable: products.GST_Applicable || "",
      GST_Category: products.GST_Category || "",
      GST_Rate: products.GST_Rate || "0",
      Unit_id: products.Unit_id || "",
      UnitOfMeasurement: products.UnitOfMeasurement || "",
      Status: products.Status || "1",
      quantity1: products.Qty,
      SEOTitle: products.SEOTitle || "",
      SEODes: products.SEODes || "",
      SEOKeyword: products.SEOKeyword || "",
      Barcode: products.Barcode || "",
      multipleImages: products.multipleImages || [],
      Added_By: `${user?.fname} ${user?.lname}`,
    }));

    fetchSubCategories(products.Cat_Id)
  };




  

  


  
  

useEffect(() => {
  const fetchProducts = async () => {
    showLoader();
    try {
      const response = await api.get(`/viewProductsByProductId/${Prod_Id}`);
      setProducts(response.data.product); // Assuming the response contains product data
      setProductVariants(response.data.variants); // Assuming variants are part of the response


      // Call handleEdit to update formData with fetched product details and variants
      handleEdit(response.data.product, response.data.variants);
    } catch (error) {
      console.error("Error fetching product details or variants", error);
    } finally{
      hideLoader();
    }
  };

  fetchProducts();
}, [Prod_Id]);




  
  


  

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // If the field requires numeric input, allow only numbers and a dot
    if (
      name === "purchasePrice" ||
      name === "mrp" ||
      name === "webPrice" ||
      name === "storePrice" ||
      name === "quantity" ||
      name === "quantity1"
    ) {
      // Allow only digits and a dot for price and quantity fields
      const numericValue = value.replace(/[^0-9.]/g, "");
      setFormData((prevData) => ({
        ...prevData,
        [name]: numericValue,
      }));
    } else {
      // For non-numeric fields, update directly without restriction
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

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

  const fetchVariants = async () => {
    showLoader();
    try {
      const response = await api.get(
        `/viewVariantTypesForProducts/${user?.orgId}`
      ); // Adjust the API endpoint accordingly
      setVariants(response.data);
    } catch (error) {
      console.error("Error fetching variants", error);
    } finally{
      hideLoader();
    }
  };

  useEffect(() => {
    if(user?.IsVariant === 1 || user?.IsVariant === "1"){
      fetchVariants();
    }
  }, [user?.orgId]);

  useEffect(() => {
showLoader();
    // Ensure Org_Id is defined before making the API call
    if (!user?.orgId) {
      console.error("Org_Id is not defined.");
      return;
    }
    // Fetch categories from backend
    api
      .get(`/viewAllCategories/${user?.orgId}`)
      .then((response) => {
        //console.log("API Response:", response);

        // Check if categories exist in the response and update state
        if (Array.isArray(response.data) && response.data.length > 0) {
          setCategories(response.data);
        } else if (
          response.data.categories &&
          Array.isArray(response.data.categories) &&
          response.data.categories.length > 0
        ) {
          setCategories(response.data.categories);
        } else {
          console.error("No valid categories found.");
        }
      })
      .catch((error) => {
        console.error("There was an error fetching categories:", error);
      }).finally(()=>{
        hideLoader();
      });
  }, [user?.orgId]); // Only runs when Org_Id changes


  

  // Fetch subcategories based on orgId and catId
  const fetchSubCategories = async (catId) => {
    if (!user?.orgId || !catId) return;

    showLoader();
    try {
      const params = { orgId, catId };


      const response = await api.get("/viewSubCategories", { params });
      setSubCategories(response.data.subCategories);
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      setError("Failed to load subcategories.");
    } finally {
      hideLoader();
    }
  };

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
  }, [user?.orgId]); // Empty array ensures this runs once when the component mounts

  useEffect(() => {
    const fetchGstCategories = async () => {
      showLoader();
      try {
        const response = await api.get(`/viewgstCategories/${user?.orgId}`); // Replace 5 with the actual Org_Id
        setGstCategories(response.data); // Set the GST categories data
      } catch (error) {
        console.error("Error fetching GST categories:", error);
      }finally{
        hideLoader();
      }
    };

    fetchGstCategories();
  }, [user?.orgId]); // Empty array ensures this runs once when the component mounts

  //---------------------------------------------------------------!!-----------------------------------------------------------------------------------------------------------------------

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

  const renameFile = (file, newName) => {
    if (!file || !file.name) {
      console.error("Invalid file object:", file);
      throw new Error("Cannot rename file because file or file.name is undefined.");
    }
  
    const extension = file.name.split('.').pop(); // Extract the original extension
    const baseName = newName.includes('.') ? newName.split('.').slice(0, -1).join('.') : newName; // Remove existing extension from newName
    const fullName = `${baseName}.${extension}`; // Combine new name with extension
    return new File([file], fullName, { type: file.type });
  };
  
  
  
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    showLoader();
  
    // Validate the form data
    if (!validation()) {
      console.error("Validation failed!");
      return;
    }
  

    try {
      // Create a FormData object for file uploads
      const formDataPayload = new FormData();
  
      // Manually append each form data field to FormData
      formDataPayload.append("Org_Id", user?.orgId);
      formDataPayload.append("Admin_Id", user?.userId);
      formDataPayload.append("Branch_Id", user?.branchId);
      formDataPayload.append("Added_By", `${user?.fname || "Admin"} ${user?.lname}`);
      formDataPayload.append("Prod_Code", formData.Prod_Code);
      formDataPayload.append("Cat_Id", formData.Cat_Id);
      formDataPayload.append("Cat_Name", formData.Cat_Name);
      formDataPayload.append("Sub_Cat_Id", formData.Sub_Cat_Id);
      formDataPayload.append("Sub_at_Name", formData.Sub_at_Name);
      formDataPayload.append("Prod_Name", formData.Prod_Name);
      formDataPayload.append("HSN_Code", formData.HSN_Code);
      formDataPayload.append("Img_360", formData.Img_360);
      formDataPayload.append("Short_Description", formData.Short_Description);
      formDataPayload.append("VideoLink", formData.VideoLink);
      formDataPayload.append("Brand_Name", formData.Brand_Name);
      formDataPayload.append("Manufacturer_Name", formData.Manufacturer_Name);
      formDataPayload.append("Avg_Rating", formData.Avg_Rating);
      formDataPayload.append("Prod_Description", formData.Prod_Description);
      formDataPayload.append("Param1", formData.Param1);
      formDataPayload.append("Param1_Val", formData.Param1_Val);
      formDataPayload.append("Param2", formData.Param2);
      formDataPayload.append("Param2_Val", formData.Param2_Val);
      formDataPayload.append("Param3", formData.Param3);
      formDataPayload.append("Param3_Val", formData.Param3_Val);
      formDataPayload.append("Param4", formData.Param4);
      formDataPayload.append("Param4_Val", formData.Param4_Val);
      formDataPayload.append("Param5", formData.Param5);
      formDataPayload.append("Param5_Val", formData.Param5_Val);
      formDataPayload.append("Purchase_Price", formData.Purchase_Price);
      formDataPayload.append("MRP", formData.MRP);
      formDataPayload.append("Web_Price", formData.Web_Price);
      formDataPayload.append("Store_Price", formData.Store_Price);
      formDataPayload.append("InStock", formData.InStock);
      formDataPayload.append("Is_Variant", user?.isVariant);
      formDataPayload.append("VarientType", formData.VarientType);
      formDataPayload.append("GST_Applicable", formData.GST_Applicable);
      formDataPayload.append("Status", formData.Status);
      formDataPayload.append("Qty", formData.quantity1);
      formDataPayload.append("SEOTitle", formData.SEOTitle);
      formDataPayload.append("SEODes", formData.SEODes);
      formDataPayload.append("SEOKeyword", formData.SEOKeyword);
      formDataPayload.append("Product_Name", formData.Product_Name);
      formDataPayload.append("Variant1_Id", formData.Variant1_Id);
      formDataPayload.append("Variant_Name1", formData.Variant_Name1);
      formDataPayload.append("Value1_Id", formData.Value1_Id);
      formDataPayload.append("Variant_Value1", formData.Variant_Value1);
      formDataPayload.append("Variant2_Id", formData.Variant2_Id);
      formDataPayload.append("Variant_Name2", formData.Variant_Name2);
      formDataPayload.append("Value2_Id", formData.Value2_Id);
      formDataPayload.append("Variant_Value2", formData.Variant_Value2);
      formDataPayload.append("Barcode", formData.Barcode);



      
      

      if (formData.Featured_Img) {
        const extension = formData.Featured_Img.name.split('.').pop(); // Extract extension
        const uniqueName = `FeaturedImg_${Date.now()}.${extension}`; // Append extension properly
        const renamedFeaturedImg = renameFile(formData.Featured_Img, uniqueName);
        formDataPayload.append("Featured_Img", renamedFeaturedImg);
      //  console.log("Renamed Featured Image:", renamedFeaturedImg.name);
      }
      

      if (formData.multipleImages && formData.multipleImages.length > 0) {
        formData.multipleImages.forEach((image, index) => {
          if (!image || !image.name) {
            console.error(`Invalid image object at index ${index}:`, image);
            return; // Skip invalid images
          }
      
          const extension = image.name.split('.').pop(); // Extract extension
          const uniqueName = `MultipleImg_${index + 1}_${Date.now()}.${extension}`;
          const renamedImage = renameFile(image, uniqueName);
          formDataPayload.append("multipleImages", renamedImage);
         // console.log(`Renamed Multiple Image ${index + 1}:`, renamedImage.name);
        });
      }
      
      

      varientDetails.forEach((variant, index) => {
        if (variant.Featured_Image) {
          // Check if Featured_Image is valid
          if (!variant.Featured_Image.name) {
            console.error(`Invalid Featured_Image for variant ${index + 1}:`, variant.Featured_Image);
          } else {
            // Append the original file directly to FormData
            formDataPayload.append("Featured_Image", variant.Featured_Image);
           // console.log(`Sending original Variant Featured Image ${index + 1}:`, variant.Featured_Image.name);
          }
        } else {
          console.warn(`No Featured_Image provided for variant ${index + 1}`);
        }
        
        
      
        if (variant.multipleImages && Array.isArray(variant.multipleImages)) {
          variant.Image_Name = [];
          variant.multipleImages.forEach((image, imgIndex) => {
            if (!image || !image.name) {
              console.error(`Invalid image object for variant ${index + 1}, image ${imgIndex + 1}:`, image);
              return; // Skip invalid images
            }
        
            const extension = image.name.split('.').pop(); // Extract extension
            const uniqueName = `VariantMultiple_${index + 1}_${imgIndex + 1}_${Date.now()}.${extension}`;
            const renamedImage = renameFile(image, uniqueName);
            formDataPayload.append("Image_Name", renamedImage);
          //  console.log(`Renamed Variant Multiple Image ${imgIndex + 1}:`, renamedImage.name);
            variant.Image_Name.push(renamedImage.name);
          });
        } else {
          console.warn(`No valid multipleImages provided for variant ${index + 1}`);
        }
        
      
        formDataPayload.append("variants", JSON.stringify(variant));
      });
      
      
      
  
 
      // Send the data to the backend API
   const response = await api.post("/addProducts", formDataPayload, {
        headers: {
          'Content-Type': 'multipart/form-data',  // for file uploads
        }
      });   
        
      // Log the complete response for debugging
    //  console.log("API Response:", response);
  
      // Check if the response contains the product data or message
      if (response && response.data) {
       // console.log("Product Added Response Data:", response.data);
        Swal.fire({
          icon: "success",
          title: "Product Added Successfully!",
          text:
            response.data.message || "The product was added to the database.",
        });
        navigate('/viewProducts')
              // Reset the form data and variant details
    //   setFormData({
    //     Prod_Code: "",
    // Branch_Id: user?.branchId,
    // Org_Id: user?.orgId,
    // Admin_Id: user?.userId,
    // Cat_Id: "",
    // Cat_Name: "",
    // Sub_Cat_Id: "",
    // Sub_at_Name: "",
    // Prod_Name: "",
    // HSN_Code: "",
    // Featured_Img: "",
    // Img_360: "",
    // Short_Description: "",
    // VideoLink: "",
    // Brand_Name: "",
    // Manufacturer_Name: "",
    // Avg_Rating: "0",
    // Prod_Description: "",
    // Param1: "",
    // Param1_Val: "",
    // Param2: "",
    // Param2_Val: "",
    // Param3: "",
    // Param3_Val: "",
    // Param4: "",
    // Param4_Val: "",
    // Param5: "",
    // Param5_Val: "",
    // Purchase_Price: "0",
    // MRP: "0",
    // Web_Price: "0",
    // Store_Price: "0",
    // InStock: "Yes",
    // Is_Variant: user?.isVariant,
    // VarientType: "Single",
    // GST_Applicable: "",
    // GST_Category: "",
    // GST_Rate: "0",
    // Unit_id: "",
    // UnitOfMeasurement: "",
    // Status: "1",
    // quantity1:"",
    // Qty: "0",
    // SEOTitle: "",
    // SEODes: "",
    // SEOKeyword: "",
    // Product_Name: "",
    // Variant1_Id: "",
    // Variant_Name1: "",
    // Value1_Id: "",
    // Variant_Value1: "",
    // Variant2_Id: "",
    // Variant_Name2: "",
    // Value2_Id: "",
    // Variant_Value2: "",
    // Barcode: "",
    // multipleImages: [],
    //   });
    //   setVarientDetail([]);

      } else {
        console.error("Unexpected response format:", response);
        Swal.fire({
          icon: "error",
          title: "Error Adding Product!",
          text: "Unexpected response format.",
        });
      }
    } catch (error) {
      console.error("Error adding product:", error);
      Swal.fire({
        icon: "error",
        title: "Error Adding Product!",
        text:
          error.response?.data?.message ||
          "There was an error adding the product.",
      });
    }finally{
      hideLoader();
    }
  };


  const editProduct = async (e) => {
    e.preventDefault();
    showLoader();
    const formDataToSend = new FormData();
  
    if (formData.Featured_Img && formData.Featured_Img.name) {
      const extension = formData.Featured_Img.name.split('.').pop(); // Extract extension
      const uniqueName = `FeaturedImg_${Date.now()}.${extension}`; // Append extension properly
      const renamedFeaturedImg = renameFile(formData.Featured_Img, uniqueName);
      formDataToSend.append("Featured_Img", renamedFeaturedImg);
    }
    
    if (Array.isArray(formData.multipleImages) && formData.multipleImages.length > 0) {
      formData.multipleImages.forEach((image, index) => {
        if (image && image.name) {
          const extension = image.name.split('.').pop(); // Extract extension
          const uniqueName = `MultipleImg_${index + 1}_${Date.now()}.${extension}`;
          const renamedImage = renameFile(image, uniqueName);
          formDataToSend.append("multipleImages", renamedImage);
        }
      });
    }
    
    // Append all other available fields
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== undefined && formData[key] !== null && key !== "multipleImages" && key !== "Featured_Img") {
        formDataToSend.append(key, formData[key]);
      }
    });
  
    // Log all key-value pairs in FormData
    // console.log("FormData contents:");
    // for (let pair of formDataToSend.entries()) {
    //   console.log(`${pair[0]}:`, pair[1]);
    // }
  
    try {
      // Send the PUT request with the FormData object
      const response = await api.put(`/editProduct/${Prod_Id}`, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
  
      if (response.status === 200) {
       // console.log("Product updated successfully:", response.data);
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Product updated successfully!",
          confirmButtonText: "OK",
        });
        navigate('/viewProducts')
  
        setFormData({
          Prod_Code: "",
          Branch_Id: user?.branchId,
          Org_Id: user?.orgId,
          Admin_Id: user?.userId,
          Cat_Id: "",
          Cat_Name: "",
          Sub_Cat_Id: "",
          Sub_at_Name: "",
          Prod_Name: "",
          HSN_Code: "",
          Featured_Img: "",
          Img_360: "",
          Short_Description: "",
          VideoLink: "",
          Brand_Name: "",
          Manufacturer_Name: "",
          Avg_Rating: "0",
          Prod_Description: "",
          Param1: "",
          Param1_Val: "",
          Param2: "",
          Param2_Val: "",
          Param3: "",
          Param3_Val: "",
          Param4: "",
          Param4_Val: "",
          Param5: "",
          Param5_Val: "",
          Purchase_Price: "0",
          MRP: "0",
          Web_Price: "0",
          Store_Price: "0",
          InStock: "Yes",
          Is_Variant: user?.isVariant,
          VarientType: "Single",
          GST_Applicable: "",
          GST_Category: "",
          GST_Rate: "0",
          Unit_id: "",
          UnitOfMeasurement: "",
          Status: "1",
          quantity1: "",
          Qty: "0",
          SEOTitle: "",
          SEODes: "",
          SEOKeyword: "",
          Product_Name: "",
          Variant1_Id: "",
          Variant_Name1: "",
          Value1_Id: "",
          Variant_Value1: "",
          Variant2_Id: "",
          Variant_Name2: "",
          Value2_Id: "",
          Variant_Value2: "",
          Barcode: "",
          multipleImages: [],
        });
      }
    } catch (error) {
      console.error("Failed to update product:", error.response?.data || error.message);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to update product. Please try again.",
        confirmButtonText: "Retry",
      });
    } finally {
      hideLoader();
    }
  };
  

  const handleFormSubmit = (e) => {
    if (Prod_Id) {
      editProduct(e); // Call editProduct if Prod_Id exists
    } else {
      handleSubmit(e); // Call handleSubmit otherwise
    }
  };



  const deleteVariant = (index) => {
    const updatedVariants = varientDetails.filter((_, i) => i !== index);
    setVarientDetail(updatedVariants);
  };

  
  

  const handleAddProduct = () => { 
    //debugger;
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
        Stock: formData.InStock,
        Qty: formData.Qty,
        Product_Name:
          formData.Prod_Name +
          " " +
          formData.Variant_Value1 +
          " " +
          formData.Variant_Value2,
        Featured_Image: formData.Featured_Img,
        multipleImages: formData.multipleImages,
        Added_By: `${user.fname} ${user?.lname}`,
      };

      

      // Update the variantDetails array
      setVarientDetail((prevDetails) => [...prevDetails, newVariant]);
      //console.log("Variants",newVariant);
      if(varientDetails.length>0){
       // console.log(varientDetails.length);
        
        setFormData({...formData,
          Featured_Img:varientDetails[0].Featured_Image,
          multipleImages:varientDetails[0].multipleImages
        })
      }
    }
  };

    



  
  

  const validation = () => {
    let error = {};
    // Create a new variant object
    if (!formData.Cat_Name) {
      error.Category = "Please Select Category";
    }
    if (user?.isSubCat === "1") {
      if (!formData.Sub_at_Name) {
        error.Sub_Category = "Please Select Sub Category";
      }
    }
    
    if (!formData.Prod_Name) {
      error.Product = "Please Enter Product Name";
    }
    if (!formData.Prod_Code) {
      error.Product_Code = "Please Select Product Code";
    }
    if (!formData.Featured_Img) {
      error.Featured_Image = "Please Select Featured Image";
    }
    if (formData.multipleImages.length === 0) {
      error.Multiple_Image = "Please Select atleast One Image";
    }
    if (!formData.HSN_Code) {
      error.HSN_Code = "Enter HSN Code";
    }
    if (user?.IsVariant === 1) {
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
    }
    
    if (!formData.Purchase_Price) {
      error.Purchase_Price = "Enter Purchase Price";
    }
    if (!formData.MRP) {
      error.MRP = "Enter MRP";
    }
    if (!formData.Web_Price) {
      error.Variant_Type_1 = "Enter Web Price";
    }
    if (!formData.Store_Price) {
      error.Variant_Type_1 = "Enter Store Price";
    }
    if (!formData.Qty) {
      error.Variant_Quantity = "Enter Quantity";
    }

    //debugger;
    setError(error);
    let a = Object.keys(error).length === 0;
    return Object.keys(error).length === 0;
  };

  return (
    <div className="wrapper">
      <div className="main-content">
        <div className="col-md-12 col-12">
          <div className="row">
          <div className="box-content card white">
          <h3 className="box-title">{Prod_Id ? 'Edit Product' : 'Add Product'}</h3>
          <div className="card-content">
              <form className="form-horizontal" onSubmit={handleFormSubmit}>
                {/* First Row: Category, Sub-Category, Product Name */}
                <div className="form-group row">
                  {/* Category Name Dropdown */}
                  <div className={categoryClassName}>
                    <label
                      htmlFor="category-dropdown"
                      className="control-label"
                    >
                      Category Name <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-control"
                      id="category-dropdown"
                      value={formData.Cat_Id} // Ensure the dropdown reflects the current Cat_Id
                      onChange={(e) => {
                        const selectedCatId = e.target.value;
                        const selectedCatName =
                          e.target.options[e.target.selectedIndex].text;
                        fetchSubCategories(selectedCatId);
                        setFormData((prevState) => ({
                          ...prevState,
                          Cat_Id: selectedCatId,
                          Cat_Name: selectedCatName,
                        }));
                      }}
                    >
                      <option value="">Select Category</option>
                      {categories.length > 0 ? (
                        categories.map((category) => (
                          <option key={category.Cat_Id} value={category.Cat_Id}>
                            {category.Cat_Name}
                          </option>
                        ))
                      ) : (
                        <></>
                      )}
                    </select>
                    <p className="text-danger mb-0">{error.Category}</p>
                  </div>

                  {/* Conditionally Render Sub-Category Dropdown */}
                  {user?.isSubCat === "1" && (
                    <div className="col-4">
                      <label
                        htmlFor="sub-category-dropdown"
                        className="control-label"
                      >
                        Sub-Category Name<span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-control"
                        id="subcategory-dropdown"
                        value={formData.Sub_Cat_Id} // Controlled by Sub_Cat_Id in formData
                        onChange={(e) => {
                          const selectedSubCatId = e.target.value;
                          const selectedSubCatName =
                            e.target.options[e.target.selectedIndex].text;

                          setFormData((prevState) => ({
                            ...prevState,
                            Sub_Cat_Id: selectedSubCatId,
                            Sub_at_Name: selectedSubCatName,
                          }));
                        }}
                        disabled={!formData.Cat_Id} // Disable if no category is selected
                      >
                        <option value="">Select Sub-Category</option>
                        {subCategories.length > 0 ? (
                          subCategories.map((subCategory) => (
                            <option key={subCategory.Id} value={subCategory.Id}>
                              {subCategory.Sub_Cat_Name}
                            </option>
                          ))
                        ) : (
                          <> </>
                        )}
                      </select>
                      <p className="text-danger mb-0">{error.Sub_Category}</p>
                    </div>
                  )}

                  {/* Product Name Input */}
                  <div className={productNameClassName}>
                    <label htmlFor="product-name" className="control-label">
                      Product Name<span className="text-danger">*</span>
                    </label>
                    <input
                      name="Prod_Name"
                      type="text"
                      className="form-control"
                      id="product-name"
                      placeholder="Enter Product Name"
                      value={formData.Prod_Name}
                      onChange={handleInputChange}
                    />
                    <p className="text-danger mb-0">{error.Product}</p>
                  </div>
                </div>

                {/* Second Row: Product Code, Manufacturer Name, Brand Name */}
                <div className="form-group row">
                  <div className="col-4">
                    <label htmlFor="product-code" className="control-label">
                      Product Code<span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="Prod_Code"
                      className="form-control"
                      id="product-code"
                      placeholder="Enter Product Code"
                      onChange={handleInputChange}
                      value={formData.Prod_Code}
                    />
                    <p className="text-danger mb-0">{error.Product_Code}</p>
                  </div>
                  <div className="col-4">
                    <label
                      htmlFor="manufacturer-name"
                      className="control-label"
                    >
                      Manufacturer Name
                    </label>
                    <input
                      type="text"
                      name="Manufacturer_Name"
                      className="form-control"
                      id="manufacturer-name"
                      placeholder="Enter Manufacturer Name"
                      onChange={handleInputChange}
                      value={formData.Manufacturer_Name}
                    />
                  </div>
                  <div className="col-4">
                    <label htmlFor="brand-name" className="control-label">
                      Brand Name
                    </label>
                    <input
                      type="text"
                      name="Brand_Name"
                      className="form-control"
                      id="brand-name"
                      placeholder="Enter Brand Name"
                      onChange={handleInputChange}
                      value={formData.Brand_Name}
                    />
                  </div>
                </div>

                {/* Third Row: Feature Image and Multiple Images */}
                <div className="form-group row">
                  <div className="col-3">
                    <label htmlFor="Featured_Img" className="control-label">
                      Feature Image<span className="text-danger">*</span>
                    </label>
                    <input
                      type="file"
                      className="form-control"
                      id="Featured_Img"
                      accept="image/*"
                      name="Featured_Img"
                      onChange={(e) => {
                        const file = e.target.files[0]; // Get the selected file
                        setFormData((prevState) => ({
                          ...prevState,
                          Featured_Img: file, // Store the file in the state
                        }));
                      }}
                    />
                    <small className="form-text text-muted">
                      Note: Image should not be greater than 1MB.
                    </small>
                    <p className="text-danger mb-0">{error.Featured_Image}</p>
                  </div>
                  <div className="col-3">
                    <label htmlFor="multipleImages" className="control-label">
                      Multiple Images<span className="text-danger">*</span>
                    </label>
                    <input
                      type="file"
                      className="form-control"
                      id="multipleImages"
                      accept="image/*"
                      multiple
                      name="multipleImages"
                      onChange={(e) => {
                        const files = Array.from(e.target.files); // Convert FileList to an array

                        if (files.length === 0) return;

                        setFormData((prevState) => ({
                          ...prevState,
                          multipleImages: files, // Store the raw File objects
                        }));

                      // console.log("Selected Files:", files);
                      }}
                    />
                    <small className="form-text text-muted">
                      Note: Image should not be greater than 1MB.
                    </small>
                    <p className="text-danger mb-0">{error.Multiple_Image}</p>
                  </div>
                  <div className="col-3">
                    <label
                      htmlFor="category-dropdown"
                      className="control-label"
                    >
                      In Stock
                    </label>
                    <select
                      name="InStock"
                      className="form-control"
                      id="category-dropdown"
                      value={formData.InStock} // Bind the value to the state
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
                    <label htmlFor="code" className="control-label">
                      HSN Code<span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="HSN_Code"
                      className="form-control"
                      id="HSN-code"
                      placeholder="Enter HSN Code"
                      onChange={handleInputChange}
                      value={formData.HSN_Code}
                    />
                    <p className="text-danger mb-0">{error.HSN_Code}</p>
                  </div>
                </div>
                <div className="row form-group">
                  {/* Conditionally render Variant Type, Variant 1, and Value 1 based on user?.isVariant */}
                  {user?.isVariant === "1" && !Prod_Id &&(
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
                          value={formData.VarientType}
                          name="VarientType"
                          onChange={(e) => {
                            setFormData((prevState) => ({
                              ...prevState,
                              VarientType: e.target.value, // Update Variant1_Id
                              Variant_Name2: "", // Update Variant_Value1
                              Variant2_Id: "0",
                              Variant_Value2: "", // Update Variant_Value2
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
                          disabled={!formData.VarientType}
                          className="form-control"
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
                          <option value="">Select Variant 1</option>
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
                            handleShowModal(
                              formData.Variant1_Id,
                              formData.Variant_Name1 || "Unknown" // Handle undefined VariantType
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
                  {formData.VarientType === "Multiple" && !Prod_Id && (
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
                          const selectedVariant =
                            e.target.options[e.target.selectedIndex].text;
                          if (formData.Variant1_Id === e.target.value) {
                            alert("Variant type is Already Selected!");
                          } else {
                            setFormData((prevState) => ({
                              ...prevState,
                              Variant_Name2: selectedVariant, // Update Variant_Value1
                              Variant2_Id: selectedVariantId, // Update Value1_Id
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
                  <div className="col-3">
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
                  <div className="col-3">
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
                  <div className="col-3">
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
                  {!Prod_Id && user?.IsVariant === 1 &&(

                    <div className="col-3">
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
                  )}

                  {/* Submit Button */}
                  {!Prod_Id && user?.IsVariant === 1 && (
  <div className="row form-group margin-top-20" style={{ margin: "0px 440px" }}>
    <button
      className="btn btn-primary"
      type="button"
      onClick={handleAddProduct}
    >
      Add Product
    </button> 
  </div>
)}

                 </div>

                  {!Prod_Id && user?.isVariant === "1" && varientDetails.length > 0 && (
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


                <div className="row form-group">
                  <div className="col-6">
                    <label htmlFor="video-link" className="control-label">
                      Video Link
                    </label>
                    <input
                      type="text"
                      name="VideoLink"
                      className="form-control"
                      id="video-link"
                      placeholder="Enter Video Link"
                      onChange={handleInputChange}
                      value={formData.VideoLink}
                    />
                  </div>
                  <div className="col-6">
                    <label htmlFor="quantity" className="control-label">
                      Quantity<span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="quantity1"
                      name="quantity1"
                      placeholder="Enter Quantity"
                      onChange={handleInputChange}
                      value={formData.quantity1}
                    />
                    <p className="text-danger mb-0">{error.Product_Quantity}</p>
                  </div>
                </div>

                {/* Second Row: Short Description */}
                <div className="row form-group">
                  <div className="col-12">
                    <label
                      htmlFor="short-description"
                      className="control-label"
                    >
                      Short Description<span className="text-danger">*</span>
                    </label>
                    <input
                      name="Short_Description"
                      type="text"
                      className="form-control"
                      id="short-description"
                      placeholder="Enter Short Description"
                      onChange={handleInputChange}
                      value={formData.Short_Description}
                    />
                  </div>
                </div>

                {/* Third Row: Description with CKEditor */}
                <div className="row form-group">
                  <div className="col-12">
                    <label htmlFor="description" className="control-label">
                      Description
                    </label>
                    {/* CKEditor */}
                    <CKEditor
                      editor={ClassicEditor}
                      data="<p>Enter your description here...</p>"
                      onChange={(event, editor) => {
                        const data = editor.getData();
                        setFormData((prevData) => ({
                          ...prevData,
                          Prod_Description: data, // Update formData.description
                        }));
                      }}
                    />
                  </div>
                </div>
                <div className="row form-group">
                  {/* SEO Title */}
                  <div className="col-6">
                    <label htmlFor="seo-title" className="control-label">
                      SEO Title
                    </label>
                    <input
                      type="text"
                      name="SEOTitle"
                      className="form-control"
                      id="seo-title"
                      placeholder="Enter SEO Title"
                      onChange={handleInputChange}
                      value={formData.SEOTitle}
                    />
                  </div>

                  {/* SEO Keyword */}
                  <div className="col-6">
                    <label htmlFor="seo-keyword" className="control-label">
                      SEO Keyword
                    </label>
                    <input
                      type="text"
                      name="SEOKeyword"
                      className="form-control"
                      id="seo-keyword"
                      placeholder="Enter SEO Keywords"
                      onChange={handleInputChange}
                      value={formData.SEOKeyword}
                    />
                  </div>
                </div>

                <div className="row form-group">
                  {/* SEO Description */}
                  <div className="col-12">
                    <label htmlFor="seo-description" className="control-label">
                      SEO Description
                    </label>
                    <textarea
                      className="form-control"
                      name="SEODes"
                      id="seo-description"
                      placeholder="Enter SEO Description"
                      rows="3"
                      onChange={handleInputChange}
                      value={formData.SEODes}
                    ></textarea>
                  </div>
                </div>

                <div className="row form-group">
                  {/* Product Specifications */}
                  <div className="col-6">
                    <label htmlFor="specification1" className="control-label">
                      Product Specification
                    </label>
                    <input
                      type="text"
                      name="Param1"
                      className="form-control"
                      id="specification1"
                      placeholder="Specification Title 1"
                      onChange={handleInputChange}
                      value={formData.Param1}
                    />
                  </div>
                  <div className="col-6 mt-3">
                    <label
                      htmlFor="specification1"
                      className="control-label"
                    ></label>
                    <input
                      type="text"
                      name="Param1_Val"
                      className="form-control"
                      id="specification2"
                      placeholder="Specification Value 1"
                      onChange={handleInputChange}
                      value={formData.Param1_Val}
                    />
                  </div>
                  <div className="col-6 mt-2">
                    <input
                      type="text"
                      name="Param2"
                      className="form-control"
                      id="specification3"
                      placeholder="Specification Title 2"
                      onChange={handleInputChange}
                      value={formData.Param2}
                    />
                  </div>
                  <div className="col-6 mt-2">
                    <input
                      type="text"
                      className="form-control"
                      name="Param2_Val"
                      id="specification4"
                      placeholder="Specification Value 2"
                      onChange={handleInputChange}
                      value={formData.Param2_Val}
                    />
                  </div>
                  <div className="col-6 mt-2">
                    <input
                      type="text"
                      className="form-control"
                      name="Param3"
                      id="specification5"
                      placeholder="Specification Title 3"
                      onChange={handleInputChange}
                      value={formData.Param3}
                    />
                  </div>
                  <div className="col-6 mt-2">
                    <input
                      type="text"
                      className="form-control"
                      name="Param3_Val"
                      id="specification6"
                      placeholder="Specification Value 3"
                      onChange={handleInputChange}
                      value={formData.Param3_Val}
                    />
                  </div>
                  <div className="col-6 mt-2">
                    <input
                      type="text"
                      className="form-control"
                      name="Param4"
                      id="specification7"
                      placeholder="Specification Title 4"
                      onChange={handleInputChange}
                      value={formData.Param4}
                    />
                  </div>
                  <div className="col-6 mt-2">
                    <input
                      type="text"
                      className="form-control"
                      name="Param4_Val"
                      id="specification8"
                      placeholder="Specification Value 4"
                      onChange={handleInputChange}
                      value={formData.Param4_Val}
                    />
                  </div>
                  <div className="col-6 mt-2">
                    <input
                      type="text"
                      className="form-control"
                      name="Param5"
                      id="specification9"
                      placeholder="Specification Title 5"
                      onChange={handleInputChange}
                      value={formData.Param5}
                    />
                  </div>
                  <div className="col-6 mt-2">
                    <input
                      type="text"
                      className="form-control"
                      name="Param5_Val"
                      id="specification10"
                      placeholder="Specification Value 5"
                      onChange={handleInputChange}
                      value={formData.Param5_Val}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button className="btn btn-primary" type="submit">
                  {Prod_Id ? 'Update ' : 'Submit'}
                </button>

              </form>
            </div>
          </div>
        </div>
        </div>
        {loader}
      </div>
    </div>
  );
}

export default AddProducts;
