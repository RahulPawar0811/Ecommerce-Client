import { React, useContext, useEffect, useState, useMemo } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { UserContext, useUser } from "../context/UserContext"; // Assuming the context is here
import api from "../pages/Axios";
import Swal from "sweetalert2";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import useFullPageLoader from "../components/useFullPageLoader";
import SubCategoryTable from "./tables/SubCategoryTable";

function AddSubCategories() {
  // State to manage form inputs
  const [categoryName, setCategoryName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [subCategoryName, setSubCategoryName] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [subCategoryImage, setSubCategoryImage] = useState(null);
  const [seoTitle, setSeoTitle] = useState("");
  const [seoKeyword, setSeoKeyword] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const { user } = useUser();
  const Org_Id = user?.orgId || "";
  const username = `${user?.fname || "admin"} ${user?.lname || ""}`;
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const orgId = user?.orgId || undefined;
  const [catId, setCatId] = useState("");
  const [data, setData] = useState([]);
  const [changedData, setChangedData] = useState('')
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filteredData, setFilteredData] = useState(data);
  const [sortedColumn, setSortedColumn] = useState(null);
  const [sortorder, setsortOrder] = useState("asc");
  const [sortBy, setSortBy] = useState(null);
  const [loader,showLoader,hideLoader] = useFullPageLoader();

  // Fetch categories to populate dropdown (can replace with your API endpoint)
  useEffect(() => {
    // Fetch categories from backend
showLoader();
    api
      .get(`/viewCategories/${Org_Id}`)
      .then((response) => {
        console.log("API response:", response.data); // Log the structure of the response
        // Check if categories exist in the response and update state
        if (Array.isArray(response.data)) {
          setCategories(response.data);
        } else if (
          response.data.categories &&
          Array.isArray(response.data.categories)
        ) {
          setCategories(response.data.categories);
        } else {
          console.error("No categories data found.");
        }
      })
      .catch((error) => {
        console.error("There was an error fetching categories:", error);
      }).finally(()=>{
        hideLoader();
      });
  }, [Org_Id]);
  
  const fetchData = async () => {
    if (!orgId) return;

showLoader();
    try {
      const params = { orgId };
      if (catId) params.catId = catId;


      const response = await api.get("/viewSubCategories", { params });

      if (response?.data?.subCategories) {
        setData(response.data.subCategories); // Update state with subcategories
      } else {
        console.warn("No subCategories found in response");
        setData([]);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load data.");
    } finally {
      hideLoader();
    }
  };

  useEffect(() => {
    fetchData();
  }, [orgId, catId]);


 
  const handleDelete = async (id) => {
    // Show a confirmation dialog
    Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        showLoader();
        try {
          // Make an API call to delete the record
          const response = await api.delete(`/deleteSubCategories/${id}`);

          if (response.status === 200) {
            // Notify the user of success
            Swal.fire(
              "Deleted!",
              "The record has been deleted successfully.",
              "success"
            );
            setChangedData('DeletedData')
            await fetchData();

          } else {
            Swal.fire(
              "Error!",
              response.data.message || "Failed to delete the record.",
              "error"
            );
          }
        } catch (error) {
          // Handle any errors
          Swal.fire(
            "Error!",
            error.response?.data?.message || "An unexpected error occurred.",
            "error"
          );
          console.error("Delete error:", error);
        }finally{
          hideLoader();
        }
      }
    });
  };

  const handleEdit = (subCategory) => {
    
    setCategoryName(subCategory.Cat_Name);
    setCategoryId(subCategory.Cat_Id);
    setSubCategoryName(subCategory.Sub_Cat_Name);
    setSortOrder(subCategory.SortOrder);
    setSubCategoryImage(null); // Reset file input
    setSeoTitle(subCategory.SEOTitle);
    setSeoKeyword(subCategory.SEOKeyword);
    setSeoDescription(subCategory.SEODes);
    setDescription(subCategory.Cat_Desc);
    setEditMode(true);
  };



  const handleSubmit = (event) => {
    event.preventDefault();
    showLoader(); // Show loader when form is submitted
  
  
    const formData = new FormData();
    formData.append("Cat_Name", categoryName);
    formData.append("Cat_Id", categoryId);
    formData.append("Added_By", username);
    formData.append("Admin_Id", user?.userId || null);
    formData.append("Org_Id", Org_Id || null);
    formData.append("Sub_Cat_Name", subCategoryName);
    formData.append("SortOrder", sortOrder);
    formData.append("Cat_Img", subCategoryImage);
    formData.append("SEOTitle", seoTitle);
    formData.append("SeoKeyword", seoKeyword);
    formData.append("SEODes", seoDescription);
    formData.append("Cat_Desc", description);
  
    // Reset form function
    const resetForm = () => {
      setCategoryName("");
      setCategoryId("");
      setSubCategoryName("");
      setSortOrder("");
      setSubCategoryImage(null); // Reset file input
      setSeoTitle("");
      setSeoKeyword("");
      setSeoDescription("");
      setDescription("");
      setEditMode(false);
    };
  
    if (editMode) {
      console.log("Edit mode is ON. Sending PUT request...");
  
      api
        .put(`/editSubCategories/${categoryId}`, formData) // Pass Cat_Id here
        .then((response) => {
          console.log("Response from PUT request:", response.data);
          
          if (response.status === 200) {
            Swal.fire({
              icon: "success",
              title: "Success",
              text: "Subcategory updated successfully!",
            });
            setChangedData('EditedData')
            fetchData(); // Call fetch data to refresh
            resetForm(); // Reset form after successful submission
          } else {
            Swal.fire({
              icon: "error",
              title: "Error",
              text: `Error updating subcategory. Status: ${response.status}`,
            });
          }
        })
        .catch((error) => {
          console.error("Error from PUT request:", error.response || error);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Error updating subcategory. Please try again.",
          });
        })
        .finally(() => {
          hideLoader(); // Hide loader regardless of success or failure
        });
    } else {
      console.log("Adding new subcategory. Sending POST request...");
  
      api
        .post("/addSubCategories", formData)
        .then((response) => {
          console.log("Response from POST request:", response.data);
  
          if (response.status === 201) {
            Swal.fire({
              icon: "success",
              title: "Success",
              text: "Subcategory added successfully!",
            });
            fetchData();
            setChangedData('AddedData')
            resetForm(); // Reset form after successful submission
          } else {
            Swal.fire({
              icon: "error",
              title: "Error",
              text: `Error adding subcategory. Status: ${response.status}`,
            });
          }
        })
        .catch((error) => {
          console.error("Error from POST request:", error.response || error);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Error adding subcategory. Please try again.",
          });
        })
        .finally(() => {
          hideLoader(); // Hide loader regardless of success or failure
        });
    }
  };
  

  // Define the handleCategoryChange function as before
  const handleCategoryChange = (event) => {
    const selectedCatId = event.target.value;
    const selectedCategory = categories.find(
      (category) => category.Cat_Id === selectedCatId
    );

    // Update state with the selected category data
    setCategoryId(selectedCatId);
    setCategoryName(selectedCategory ? selectedCategory.Cat_Name : "");
  };

  const handleSubCategoryNameChange = (event) => {
    setSubCategoryName(event.target.value);
  };

  const handleSortOrderChange = (event) => {
    setSortOrder(event.target.value);
  };

  const handleImageChange = (event) => {
    setSubCategoryImage(event.target.files[0]);
  };

  const handleSeoTitleChange = (event) => {
    setSeoTitle(event.target.value);
  };

  const handleSeoKeywordChange = (event) => {
    setSeoKeyword(event.target.value);
  };

  const handleSeoDescriptionChange = (event) => {
    setSeoDescription(event.target.value);
  };

  const handleDescriptionChange = (event, editor) => {
    setDescription(editor.getData());
  };



  return (
    <div className="wrapper">
      <div className="main-content">
        <div className="col-md-12 col-12">
          <div className="box-content card white">
            <h3 className="box-title">
              {editMode ? "Edit Sub Category" : "Add Sub Category"}
            </h3>
            <div className="card-content">
              <form className="form-horizontal" onSubmit={handleSubmit}>
                <div className="form-group row">
                  <div className="col-3">
                    <label
                      htmlFor="category-dropdown"
                      className="control-label"
                    >
                      Category Name<span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-control"
                      id="category-dropdown"
                      value={categoryId} // Bind the value to categoryId
                      onChange={handleCategoryChange}
                      required
                    >
                      <option value="" disabled>
                        Select Category
                      </option>
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

                  <div className="col-3">
                    <label htmlFor="inp-type-2" className="control-label">
                      Sub Category Name<span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="inp-type-2"
                      placeholder="Sub Category Name"
                      value={subCategoryName}
                      onChange={handleSubCategoryNameChange}
                      required
                    />
                  </div>
                  <div className="col-3">
                    <label htmlFor="inp-type-3" className="control-label">
                      Sort Order
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="inp-type-3"
                      placeholder="Sort Order"
                      value={sortOrder}
                      onChange={handleSortOrderChange}
                    />
                  </div>
                  <div className="col-3">
                    <label htmlFor="inp-type-4" className="control-label">
                      Sub-Category Image
                    </label>
                    <input
                      type="file"
                      className="form-control"
                      id="inp-type-4"
                      onChange={handleImageChange}
                      name="Cat_Img"
                    />
                  </div>
                </div>
                <div className="form-group row">
                  <div className="col-6">
                    <label htmlFor="inp-type-3" className="control-label">
                      SEO Title
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="inp-type-3"
                      placeholder="SEO Titles"
                      value={seoTitle}
                      onChange={handleSeoTitleChange}
                    />
                  </div>
                  <div className="col-6">
                    <label htmlFor="inp-type-3" className="control-label">
                      SEO Keyword
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="inp-type-3"
                      placeholder="SEO Keyword"
                      value={seoKeyword}
                      onChange={handleSeoKeywordChange}
                    />
                  </div>
                </div>
                <div className="form-group row">
                  <div className="col-12">
                    <label htmlFor="inp-type-5" className="control-label">
                      SEO Description
                    </label>
                    <textarea
                      className="form-control"
                      id="inp-type-5"
                      placeholder="Write your description"
                      value={seoDescription}
                      onChange={handleSeoDescriptionChange}
                    />
                  </div>
                </div>
                <div className="form-group row">
                  <div className="col-12">
                    <label htmlFor="description" className="control-label">
                      Description
                    </label>
                    <CKEditor
                      editor={ClassicEditor}
                      data={description}
                      onChange={handleDescriptionChange}
                    />
                  </div>
                </div>
                <button className="btn btn-primary" type="submit">
                  {editMode ? "Update" : "Submit"}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="row small-spacing">
          <div className="col-12">
            <div className="box-content">
              <SubCategoryTable handleEdit={handleEdit} handleDelete={handleDelete} data={changedData} subCategories={data} fetchSubcategories={fetchData} />
              {/* <div
                id="example_wrapper"
                className="dataTables_wrapper form-inline dt-bootstrap4"
              >
                <div className="row">
                  <div className="col-md-3 ">
                    <div className="dataTables_length" id="example_length">
                      <label>
                        Show
                        <select
                          name="example_length"
                          aria-controls="example"
                          className="form-control input-sm"
                          onChange={handleRowsPerPageChange}
                          value={rowsPerPage}
                        >
                          <option value={10}>10</option>
                          <option value={25}>25</option>
                          <option value={50}>50</option>
                          <option value={100}>100</option>
                        </select>
                        entries
                      </label>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div
                      className="export-icons "
                      style={{ marginLeft: "-90px", marginTop: "6px" }}
                    >
                      <i
                        className="fas fa-file-excel"
                        title="Export to Excel"
                        style={{
                          marginRight: "10px", // Space between icons
                          fontSize: "30px", // Icon size
                          cursor: "pointer", // Pointer cursor
                          color: "green", // Excel color
                          transition: "transform 0.2s ease, color 0.2s ease", // Smooth hover effect
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = "scale(1.1)"; // Slightly enlarge on hover
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = "scale(1)"; // Reset size
                        }}
                        onClick={() => handleExportExcel()} // Replace with your export function
                      ></i>

                      <i
                        className="fas fa-file-pdf"
                        title="Export to PDF"
                        style={{
                          fontSize: "30px", // Icon size
                          cursor: "pointer", // Pointer cursor
                          color: "red", // PDF color
                          transition: "transform 0.2s ease, color 0.2s ease", // Smooth hover effect
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = "scale(1.1)"; // Slightly enlarge on hover
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = "scale(1)"; // Reset size
                        }}
                        onClick={() => handleExportPDF()} // Replace with your export function
                      ></i>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div id="example_filter" className="dataTables_filter">
                      <label>
                        Search:
                        <input
                          type="search"
                          className="form-control input-sm"
                          placeholder="Search Subcategories..."
                          aria-controls="example"
                          value={searchTerm}
                          onChange={handleSearch}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-12">
                    <table
                      id="example"
                      className="table table-striped table-bordered display dataTable"
                      style={{ width: "100%" }}
                      role="grid"
                      aria-describedby="example_info"
                    >
                      <thead>
                        <tr role="row">
                          <th
                            onClick={() => handleSort("date")}
                            className={
                              sortBy === "date"
                                ? sortorder === "asc"
                                  ? "sorting_asc"
                                  : "sorting_desc"
                                : "sorting"
                            }
                            aria-label="Date: activate to sort column ascending"
                            aria-sort={sortBy === "date" ? sortorder : "none"}
                          >
                            Date
                            {sortBy === "date" &&
                              (sortorder === "asc" ? " ▲" : " ▼")}
                          </th>
                          <th
                            onClick={() => handleSort("subCategory")}
                            className={
                              sortBy === "subCategory"
                                ? sortorder === "asc"
                                  ? "sorting_asc"
                                  : "sorting_desc"
                                : "sorting"
                            }
                            aria-label="Sub Category: activate to sort column ascending"
                            aria-sort={
                              sortBy === "subCategory" ? sortorder : "none"
                            }
                          >
                            Sub Category
                            {sortBy === "subCategory" &&
                              (sortorder === "asc" ? " ▲" : " ▼")}
                          </th>
                          <th
                            onClick={() => handleSort("category")}
                            className={
                              sortBy === "category"
                                ? sortorder === "asc"
                                  ? "sorting_asc"
                                  : "sorting_desc"
                                : "sorting"
                            }
                            aria-label="Category: activate to sort column ascending"
                            aria-sort={
                              sortBy === "category" ? sortorder : "none"
                            }
                          >
                            Category
                            {sortBy === "category" &&
                              (sortorder === "asc" ? " ▲" : " ▼")}
                          </th>
                          <th
                            onClick={() => handleSort("sortOrder")}
                            className={
                              sortBy === "sortOrder"
                                ? sortorder === "asc"
                                  ? "sorting_asc"
                                  : "sorting_desc"
                                : "sorting"
                            }
                            aria-label="Sort Order: activate to sort column ascending"
                            aria-sort={
                              sortBy === "sortOrder" ? sortorder : "none"
                            }
                          >
                            Sort Order
                            {sortBy === "sortOrder" &&
                              (sortorder === "asc" ? " ▲" : " ▼")}
                          </th>
                          <th className="text-center">Operations</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentRows.length > 0 ? (
                          currentRows.map((row, index) => (
                            <tr key={index}>
                              <td>
                                {new Date(row.Added_On).toLocaleDateString(
                                  "en-GB"
                                )}
                              </td>
                              <td>{row.Sub_Cat_Name}</td>
                              <td>{row.Cat_Name}</td>
                              <td>{row.SortOrder}</td>
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
                                      boxShadow:
                                        "0 0.5rem 1rem rgba(0, 0, 0, 0.175)",
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
                                          color: "#007bff", // Blue for Edit
                                          textDecoration: "none",
                                          whiteSpace: "nowrap",
                                          transition:
                                            "background-color 0.15s ease-in-out, color 0.15s ease-in-out",
                                        }}
                                        onMouseEnter={(e) => {
                                          e.target.style.backgroundColor =
                                            "#f0f8ff"; // Light blue on hover
                                          e.target.style.color = "#0056b3"; // Darker blue for hover
                                        }}
                                        onMouseLeave={(e) => {
                                          e.target.style.backgroundColor =
                                            "transparent";
                                          e.target.style.color = "#007bff"; // Reset to blue
                                        }}
                                        onClick={() => {
                                          setEditMode(true);
                                          setCategoryId(row.Cat_Id); // Set the current ID for editing
                                          setCategoryName(row.Cat_Name);
                                          setSubCategoryName(row.Sub_Cat_Name);
                                          setDescription(row.Cat_Desc);
                                          setSortOrder(row.SortOrder);
                                          setSeoTitle(row.SEOTitle);
                                          setSeoKeyword(row.SeoKeyword);
                                          setSeoDescription(row.SEODes);
                                          setSubCategoryImage(row.Cat_Img);
                                        }}
                                      >
                                        <i
                                          className="fas fa-edit"
                                          style={{
                                            marginRight: "10px",
                                            color: "#007bff", // Blue color for the icon
                                          }}
                                          onClick={() => {
                                            setEditMode(true);
                                            setCategoryId(row.Cat_Id); // Set the current ID for editing
                                            setCategoryName(row.Cat_Name);
                                            setSubCategoryName(
                                              row.Sub_Cat_Name
                                            );
                                            setDescription(row.Cat_Desc);
                                            setSortOrder(row.SortOrder);
                                            setSeoTitle(row.SEOTitle);
                                            setSeoKeyword(row.SeoKeyword);
                                            setSeoDescription(row.SEODes);
                                            setSubCategoryImage(row.Cat_Img);
                                          }} // Pass the full category object to handleEdit
                                        ></i>
                                        Edit
                                      </a>
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
                                          e.target.style.backgroundColor =
                                            "#f8d7da"; // Light red on hover
                                          e.target.style.color = "#721c24"; // Darker red for hover
                                        }}
                                        onMouseLeave={(e) => {
                                          e.target.style.backgroundColor =
                                            "transparent";
                                          e.target.style.color = "#dc3545"; // Reset to red
                                        }}
                                        onClick={() => handleDelete(row.Id)}
                                      >
                                        <i
                                          className="far fa-trash-alt"
                                          style={{
                                            marginRight: "10px",
                                            color: "#dc3545", // Red color for the icon
                                          }}
                                          onClick={() => handleDelete(row.Id)}
                                        ></i>
                                        Delete
                                      </a>
                                    </li>
                                  </ul>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="5">No data available</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
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
                      Showing {indexOfFirstRow + 1} to{" "}
                      {Math.min(indexOfLastRow, filteredData.length)} of{" "}
                      {filteredData.length} entries
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
                        >
                          <a
                            href="#"
                            onClick={() => handlePageChange(currentPage - 1)}
                            className="page-link"
                          >
                            Previous
                          </a>
                        </li>
                        {Array.from({ length: totalPages }, (_, index) => (
                          <li
                            key={index}
                            className={`paginate_button page-item ${
                              currentPage === index + 1 ? "active" : ""
                            }`}
                          >
                            <a
                              href="#"
                              onClick={() => handlePageChange(index + 1)}
                              className="page-link"
                            >
                              {index + 1}
                            </a>
                          </li>
                        ))}
                        <li
                          className={`paginate_button page-item next ${
                            currentPage === totalPages ? "disabled" : ""
                          }`}
                        >
                          <a
                            href="#"
                            onClick={() => handlePageChange(currentPage + 1)}
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
          </div>
          {loader}
        </div>
      </div>
    </div>
  );
}

export default AddSubCategories;
