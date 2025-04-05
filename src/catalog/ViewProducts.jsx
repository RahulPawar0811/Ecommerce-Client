import { React, useEffect, useState, useContext } from "react";
import { Link,useNavigate,useLocation} from "react-router-dom";
import api, { imageURL } from "../pages/Axios";
import { UserContext, useUser } from "../context/UserContext";
import { Button } from "react-bootstrap";
import ProductModal from "./modals/ProductModal";
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import VariantModal from './modals/VariantModal'
import Swal from "sweetalert2";
import useFullPageLoader from "../components/useFullPageLoader";
import ProductTable from "./tables/ProductTable";



function ViewProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useUser();
  const Org_Id = user?.orgId || undefined;
  const Admin_Id = user?.userId || undefined;
  const [catId, setCatId] = useState("");
  const [subCatId, setSubCatId] = useState("");
  const orgId = user?.orgId || undefined;
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filteredProducts, setFilteredProducts] = useState([]); // Filtered products after search or filtering
  const [paginatedProducts, setPaginatedProducts] = useState([]);
  const [sortColumn, setSortColumn] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [showModal, setShowModal] = useState(false);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loader,showLoader,hideLoader] = useFullPageLoader();
  const [changedData, setChangedData] =  useState('')
  
  const navigate = useNavigate();

  const handleShowVariantModal = (product) => {
    setSelectedProduct(product);
    setShowVariantModal(true);  // Open the modal
  };
  
  const handleVariantCloseModal = () => {
    setShowVariantModal(false);
    setSelectedProduct(null);
  };


  const handleShowModal = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
  };
  
  useEffect(() => {
    // Ensure Org_Id is defined before making the API call
    if (!user?.orgId) {
      console.error("Org_Id is not defined.");
      return;
    }

    // Set loading state before making the API call
showLoader();
  setError(null);  // Clear any previous errors

    // Fetch categories from backend
    api
      .get(`/viewAllCategories/${user?.orgId}`)
      .then((response) => {
        // Check if categories exist in the response and update state
        const categoriesData = response?.data?.categories;
        if (Array.isArray(categoriesData) && categoriesData.length > 0) {
          setCategories(categoriesData);
        } else {
          setError("No categories found.");
          console.error("No valid categories found.");
        }
      })
      .catch((error) => {
        setError("Error fetching categories.");
        console.error("There was an error fetching categories:", error);
      })
      .finally(() => {
        // Set loading state to false after the request is complete
hideLoader();
      });
  }, [user?.orgId]); // Only runs when


  // Fetch subcategories based on orgId and catId
  useEffect(() => {
    const fetchSubCategories = async () => {
      if (!user?.orgId || !catId) return;

      showLoader();
      try {
        const params = { orgId, catId };

        //  console.log("Fetching subcategories with params:", params);

        const response = await api.get("/viewSubCategories", { params });
        //  console.log("Subcategories response:", response.data);

        if (response?.data?.subCategories) {
          setSubCategories(response.data.subCategories);
        } else {
          setSubCategories([]);
        }
      } catch (error) {
        console.error("Error fetching subcategories:", error);
        setError("Failed to load subcategories.");
      } finally {
hideLoader();
      }
    };

    fetchSubCategories();
  }, [user?.orgId, catId]); // Fetch subcategories when catId changes

  // Handle category change
  const handleCategoryChange = (e) => {
    const selectedCatId = e.target.value;
    setCatId(selectedCatId); // Set selected category
    setSubCatId(""); // Reset subcategory when category changes

    // Clear subcategories if no subcategories exist for the selected category
    const selectedCategory = categories.find(
      (category) => category.Cat_Id === selectedCatId
    );
    if (!selectedCategory || selectedCategory.subCategories.length === 0) {
      setSubCategories([]); // Clear subcategories if none are available
    }
    setCurrentPage(1);
  };

  // Handle subcategory change
  const handleSubCategoryChange = (e) => {
    setSubCatId(e.target.value);
    setCurrentPage(1);
    // Set selected subcategory
  };

  // Fetch products from backend
  const fetchProducts = async () => {
    showLoader();
    try {
      if (!user || !user.orgId) {
        console.error("User or Org_Id is not available");
        return;
      }

      const query = `/viewProducts/${user.orgId}${
        catId ? `?Cat_Id=${catId}` : ""
      }${subCatId ? `&Sub_Cat_Id=${subCatId}` : ""}`;

      const response = await api.get(query);

      // Directly log and set the response data (no need for .products if it's the root of the response)
      console.log("Fetched Products:", response.data); // Check entire response structure
      setProducts(response.data || []);
      setFilteredProducts(response.data || []); // Adjust if necessary
    } catch (error) {
      console.error("Error fetching products:", error);
    }finally{
      hideLoader();
    }
  };

  // Fetch products on component mount or when filters change
  useEffect(() => {
    fetchProducts();
  }, [catId, subCatId, user]); // Added user as dependency to re-fetch if user changes

  // Handle search input
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    const filtered = products.filter((product) =>
      product.Prod_Name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredProducts(filtered);
    setCurrentPage(1); // Reset to page 1 after search
  };

  // Update paginated products whenever filters or pagination change
  useEffect(() => {
    const paginated = filteredProducts.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
    setPaginatedProducts(paginated);
  }, [filteredProducts, currentPage, itemsPerPage]);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (event) => {
    setItemsPerPage(Number(event.target.value));
    setCurrentPage(1); // Reset to the first page
  };

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const handleSorting = (column) => {
    // Toggle the sort order (asc/desc) when the same column is clicked again
    const newSortOrder =
      sortColumn === column && sortOrder === "asc" ? "desc" : "asc";

    // Update the state for the current column and its sort order
    setSortColumn(column);
    setSortOrder(newSortOrder);

    // Sorting logic
    const sortedProducts = [...paginatedProducts].sort((a, b) => {
      // Handle different data types (e.g., strings, numbers)
      const valueA = a[column];
      const valueB = b[column];

      if (valueA < valueB) return newSortOrder === "asc" ? -1 : 1;
      if (valueA > valueB) return newSortOrder === "asc" ? 1 : -1;
      return 0;
    });

    // Update the state with the sorted array
    setPaginatedProducts(sortedProducts);
  };


   // Function to handle exporting data to Excel
   const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(paginatedProducts);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Products");
    XLSX.writeFile(wb, "products.xlsx");
  };

  // Function to handle exporting data to PDF
// Function to handle exporting data to PDF in tabular format
const handleExportPDF = () => {
  const doc = new jsPDF();

  // Define table headers
  const headers = [
    ["Product Name", "Price", "Category", "Sub-Category", "Product Code", "GST Category", "In Stock"]
  ];

  // Map product data into rows
  const rows = paginatedProducts.map(product => [
    product.Prod_Name,
    product.Web_Price,
    product.Cat_Name,
    product.Sub_at_Name,
    product.Prod_Code,
    product.GST_Category,
    product.InStock,
  ]);

  // Add title to the PDF
  doc.text("Product List", 14, 15);

  // Add the table to the PDF
  autoTable(doc, {
    startY: 20,
    head: headers,
    body: rows,
  });

  // Save the PDF
  doc.save("products.pdf");
};


const handleDelete = (Prod_Id) => {
  // Show a confirmation Swal popup
  Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!',
  }).then((result) => {
    if (result.isConfirmed) {
      // If confirmed, send a DELETE request with Axios
      api
        .delete(`/deleteProduct/${Prod_Id}`)
        .then((response) => {
          // Handle success
          Swal.fire('Deleted!', 'The product has been deleted.', 'success');
          // Optionally, you can trigger re-fetch of data or update the UI here
          fetchProducts()
          setChangedData('DeletedData')
        })
        .catch((error) => {
          // Handle error
          Swal.fire('Error!', 'There was a problem deleting the product.', 'error');
        });
    }
  });
};



  return (
    <div className="wrapper">
      <div className="main-content">
        <div className="row small-spacing">
          <div className="col-12">
            <div className="box-content">

              <ProductTable handleDelete={handleDelete} data={changedData} fetchProductTable= {fetchProducts} products={products}/>

              {/* <div className="d-flex justify-content-between align-items-center">
                <div className="filter-by-category col-3 margin-bottom-20">
                  <label htmlFor="categoryFilter" className="filter-label">
                    <i className="fas fa-filter"></i> Filter By Category
                  </label>
                  <select
                    className="form-control"
                    id="category-dropdown"
                    value={catId}
                    onChange={handleCategoryChange}
                  >
                    <option value="">Select Category</option>
                    {categories.length > 0 ? (
                      categories.map((category) => (
                        <option key={category.Cat_Id} value={category.Cat_Id}>
                          {category.Cat_Name}
                        </option>
                      ))
                    ) : (
                      <option value="">No categories available</option>
                    )}
                  </select>
                </div>

                <div className="filter-by-category col-3 margin-bottom-20">
                  <label htmlFor="subcategoryFilter" className="filter-label">
                    <i className="fas fa-filter"></i> Filter By Sub-Category
                  </label>
                  <select
                    className="form-control"
                    id="subcategory-dropdown"
                    value={subCatId}
                    onChange={handleSubCategoryChange}
                    disabled={!catId} // Disable if no category is selected
                  >
                    <option value="">Select Sub-Category</option>
                    {subCategories.length > 0 ? (
                      subCategories.map((subCategory) => (
                        <option key={subCategory.Id} value={subCategory.Id}>
                          {subCategory.Sub_Cat_Name}
                        </option>
                      ))
                    ) : (
                      <option value="">No subcategories available</option>
                    )}
                  </select>
                </div>

                <Link 
  className="btn btn-sm btn-primary ml-auto" 
  to="/addProducts" 
  style={{color: "white", fontSize: "14px", padding: "4px 8px" , borderRadius:"4px"}}  // Adjusting font size and padding for small size
>
  <i className="fas fa-plus" style={{ marginRight: '4px', fontSize: "12px" }}></i> 
  Add Products
</Link>

              </div>

              <div
                id="example_wrapper"
                className="dataTables_wrapper form-inline dt-bootstrap4"
              >
                <div className="row">
                  <div className="col-md-6">
                    <div className="dataTables_length" id="example_length"style={{
                        display: "flex",
                        alignItems: "center",
                      }}>
                      <label>
                        Show
                        <select
                          name="example_length"
                          aria-controls="example"
                          className="form-control input-sm"
                          value={itemsPerPage}
                          onChange={handleItemsPerPageChange}
                        >
                          <option value={10}>10</option>
                          <option value={25}>25</option>
                          <option value={50}>50</option>
                          <option value={100}>100</option>
                        </select>
                        entries
                      </label>
                      <div
                        className="export-icons"
                        style={{
                          display: "flex",
                          gap: "15px",
                          margin:"0px 10px"
                        }}
                      >
                        <i
                          className="fas fa-file-excel"
                          title="Export to Excel"
                          style={{
                            fontSize: "30px",
                            cursor: "pointer",
                            color: "green",
                            transition: "transform 0.2s ease, color 0.2s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.transform = "scale(1.1)";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.transform = "scale(1)";
                          }}
                         onClick={() => handleExportExcel()}
                        ></i>

                        <i
                          className="fas fa-file-pdf"
                          title="Export to PDF"
                          style={{
                            fontSize: "30px",
                            cursor: "pointer",
                            color: "red",
                            transition: "transform 0.2s ease, color 0.2s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.transform = "scale(1.1)";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.transform = "scale(1)";
                          }}
                         onClick={() => handleExportPDF()}
                        ></i>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div id="example_filter" className="dataTables_filter">
                      <label>
                        Search:
                        <input
                          type="text"
                          id="searchInput"
                          className="form-control input-sm"
                          placeholder="Search by Name"
                          value={searchTerm}
                          onChange={handleSearchChange}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-12"style={{ overflowX: 'auto' }}>
                    <table className="table table-striped  table-bordered display dataTable">
                      <thead>
                        <tr>
                          <th>Image</th>
                          <th
                            className="sorting"
                            aria-label="Product Name: activate to sort column ascending"
                            onClick={() => handleSorting("productName")}
                          >
                            Product Name
                          </th>
                          <th
                            className="sorting"
                            aria-label="Price: activate to sort column ascending"
                            onClick={() => handleSorting("price")}
                          >
                            Price
                          </th>
                          <th
                            className="sorting"
                            aria-label="Category: activate to sort column ascending"
                            onClick={() => handleSorting("category")}
                          >
                            Category
                          </th>
                          <th
                            className="sorting"
                            aria-label="Sub-Category: activate to sort column ascending"
                            onClick={() => handleSorting("subCategory")}
                          >
                            Sub-Category
                          </th>
                          <th
                            className="sorting"
                            aria-label="Product Code: activate to sort column ascending"
                            onClick={() => handleSorting("productCode")}
                          >
                            Product Code
                          </th>
                          <th
                            className="sorting"
                            aria-label="Gst Category: activate to sort column ascending"
                            onClick={() => handleSorting("gstCategory")}
                          >
                            Gst Category
                          </th>
                          <th
                            className="sorting"
                            aria-label="Instock: activate to sort column ascending"
                            onClick={() => handleSorting("inStock")}
                          >
                            Instock
                          </th>
                          <th
                            className="sorting"
                            aria-label="Variants: activate to sort column ascending"
                            onClick={() => handleSorting("variants")}
                          >
                            Variants
                          </th>
                          <th>Operations</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedProducts.length > 0 ? (
                          paginatedProducts.map((product, index) => (
                            <tr key={index}>
                              <td>
                                <img
                                  src={`${imageURL}/Images/product/${product.Featured_Img}`}
                                  alt={product.Prod_Name}
                                  style={{ width: "50px" }}
                                />
                              </td>
                              <td
                                className="text-truncate cursor-pointer"
                                style={{ maxWidth: "200px" }}
                                data-bs-toggle="tooltip"
                                data-bs-placement="top"
                                title={product.Prod_Name}
                              >
                                {product.Prod_Name}
                              </td>
                              <td>{product.Web_Price}</td>
                              <td>{product.Cat_Name}</td>
                              <td>{product.Sub_at_Name}</td>
                              <td>{product.Prod_Code}</td>
                              <td>{product.GST_Category}</td>
                              <td>{product.InStock}</td>
                               <td>
                                {product.Is_Variant === "1" ? (
                                //   <Button
                                //   variant="primary"
                                //   size="sm"
                                //   onClick={() => handleShowModal(product)}
                                //   style={{
                                //     backgroundImage:
                                //       "linear-gradient(to right, #6a11cb, #2575fc)", // Gradient background
                                //     border: "none", // Remove border
                                //     borderRadius: "15px", // Rounded edges
                                //     color: "#fff", // White text
                                //     fontWeight: "bold", // Bold text
                                //     padding: "3px 10px", // Smaller padding
                                //     fontSize: "12px", // Smaller text size
                                //     display: "flex", // Flexbox for aligning the icon and text
                                //     alignItems: "center",
                                //     justifyContent: "center",
                                //     transition:
                                //       "transform 0.3s ease, box-shadow 0.3s ease", // Smooth hover effect
                                //   }}
                                //   onMouseEnter={(e) => {
                                //     e.target.style.transform = "scale(1.1)"; // Slight zoom-in on hover
                                //     e.target.style.boxShadow =
                                //       "0 4px 10px rgba(0, 0, 0, 0.3)"; // Shadow effect on hover
                                //   }}
                                //   onMouseLeave={(e) => {
                                //     e.target.style.transform = "scale(1)"; // Reset size
                                //     e.target.style.boxShadow = "none"; // Reset shadow
                                //   }}
                                // >
                                //   <i
                                //     className="fas fa-eye"
                                //     style={{
                                //       marginRight: "3px", // Smaller margin between icon and text
                                //       fontSize: "12px", // Smaller icon size
                                //     }}
                                //   ></i>{" "}
                                //   View
                                // </Button>
                                
                                ) : (
                                  "No Variants"
                                )}
                              </td> 
                              <td className="text-center">
  {product.Is_Variant === "1" ? (
    <div
      onClick={() => handleShowModal(product)}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "40px", // Icon container size
        height: "40px", // Icon container size
        margin:"0px 15px",
        cursor: "pointer", // Pointer cursor for interaction
      }}
    >
      <i
        className="fas fa-eye"
        style={{
          fontSize: "20px", // Icon size
          background: "linear-gradient(45deg,rgb(253, 119, 75), #f55d2a,rgb(243, 66, 7) )", // Colorful gradient
          WebkitBackgroundClip: "text", // Clip the background to the text
          color: "transparent", // Make icon text transparent to show the gradient
          transition: "background 0.5s ease", // Smooth background transition
          
        }}
      ></i>
    </div>
  ) : (
    "No Variants"
  )}
</td>

                              
                              <td style={{ textAlign: "center" }}>
                          <div className="dropdown">
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
                                    color: "#28a745", // Green for Add
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
                                    className="fas fa-plus" // Add icon from Font Awesome
                                    style={{
                                      marginRight: "10px",
                                      color: "#28a745", // Green color for the icon
                                    }}
                                  ></i>
                                  Add Variant
                                </a>
                              </li>

                              <li>
                                <Link
                                  className="dropdown-item"
                                  to={`/editProduct/${product.Prod_Id}`}
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
                                
                                  
                                                                    
                                >
                                  <i
                                    className="fas fa-edit"
                                    style={{
                                      marginRight: "10px",
                                      color: "#007bff", // Blue color for the icon
                                    }}
                                   
                                    
                                  ></i>
                                  Edit Product
                                </Link>
                              </li>

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
                                  onClick={() => handleDelete(product.Prod_Id)}
                                >
                                  <i
                                    className="far fa-trash-alt"
                                    style={{
                                      marginRight: "10px",
                                      color: "#dc3545", // Red color for the icon
                                    }}
                                    onClick={() =>
                                      handleDelete(product.Prod_Id)
                                    }
                                  ></i>
                                  Delete Product
                                </a>
                              </li>

                              
                            </ul>
                          </div>
                        </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="6">No products found</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                    <ProductModal
                      variantModal = {handleShowVariantModal}
                      show={showModal}
                      handleClose={handleCloseModal}
                      product={selectedProduct}
                    />
                     <VariantModal
                      showVariant={showVariantModal}
                      handleVariantClose={handleVariantCloseModal}
                      product={selectedProduct}
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-5">
                    <div
                      className="dataTables_info"
                      id="example_info"
                      role="status"
                      aria-live="polite"
                    >
                      Showing {paginatedProducts.length} of{" "}
                      {filteredProducts.length} products
                    </div>
                  </div>
                  <div className="col-md-7">
                    <div
                      className="dataTables_paginate paging_simple_numbers"
                      id="example_paginate"
                    >
                      <ul className="pagination">
                        <li
                          className={`paginate_button page-item previous ${
                            currentPage === 1 ? "disabled" : ""
                          }`}
                          onClick={() => handlePageChange(currentPage - 1)}
                        >
                          <a
                            href="#"
                            aria-controls="example"
                            data-dt-idx={0}
                            tabIndex={0}
                            className="page-link"
                          >
                            Previous
                          </a>
                        </li>
                        {Array.from({ length: totalPages }, (_, i) => (
                          <li
                            key={i}
                            className={`paginate_button page-item ${
                              currentPage === i + 1 ? "active" : ""
                            }`}
                            onClick={() => handlePageChange(i + 1)}
                          >
                            <a
                              href="#"
                              aria-controls="example"
                              data-dt-idx={i + 1}
                              tabIndex={0}
                              className="page-link"
                            >
                              {i + 1}
                            </a>
                          </li>
                        ))}
                        <li
                          className={`paginate_button page-item next ${
                            currentPage === totalPages ? "disabled" : ""
                          }`}
                          onClick={() => handlePageChange(currentPage + 1)}
                        >
                          <a
                            href="#"
                            aria-controls="example"
                            data-dt-idx={totalPages}
                            tabIndex={0}
                            className="page-link"
                          >
                            Next
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div> */}
            </div>
            {loader}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewProducts;
