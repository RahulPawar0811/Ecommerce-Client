import { React, useContext, useState, useEffect } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import Swal from "sweetalert2";
import { UserContext, useUser } from "../context/UserContext"; // Assuming the context is here
import api from "../pages/Axios";
import { imageURL } from "../pages/Axios";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import useFullPageLoader from "../components/useFullPageLoader";
import CategoryTable from "./tables/CategoryTable";

function AddCategories() {
  const { user } = useUser(); // Accessing Admin_Id and Org_Id from context
  const Org_Id = user?.orgId || "";
  const Admin_Id = user?.userId || "";
  const username = `${user?.fname || ""}${user?.lname || ""}`;
  const [categories, setCategories] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [sortColumn, setSortColumn] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [sortOrder, setSortOrder] = useState("asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState(null);
  const [loader,showLoader,hideLoader] = useFullPageLoader();
  const [changedData, setChangedData] = useState('')

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null); // null means no dropdown is open

  // Toggle function to open/close dropdown
  const toggleDropdown = (index) => {
    setOpenDropdown(openDropdown === index ? null : index); // Toggle dropdown visibility
  };



  console.log(user);

  const [categoryData, setCategoryData] = useState({
    Cat_Name: "",
    SortOrder: "",
    ShowOnHomePage: "",
    Cat_Img: null,
    SEOTitle: "",
    SEOKeyword: "",
    SEODes: "",
    Cat_Desc: "",
    Added_By: "",
  });

  const fetchCategories = async (
    page = 1,
    entriesPerPage = 10,
    sortOrder = "ASC",
    searchQuery = ""
  ) => {
    if (!Org_Id) {
      console.error("❌ Org_Id is undefined!");
      return;
    }
  
    showLoader(); // Show loader when fetch starts
    try {
      const response = await api.get(`/viewCategories/${Org_Id}`, {
        params: {
          page,
          limit: entriesPerPage,
          sortOrder,
          search: searchQuery,
        },
      });
  
      setCategories(response.data.categories);
      setTotalPages(response.data.totalPages);
      setTotalCount(response.data.totalCount);      
    } catch (error) {
      console.error("❌ Error fetching categories:", error);
    } finally {
      hideLoader(); // Hide loader regardless of success or failure
    }
  };
  
  

  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchCategories(newPage, entriesPerPage, sortOrder);
  };

  const handleEntriesPerPageChange = (newEntriesPerPage) => {
    setEntriesPerPage(newEntriesPerPage);
    fetchCategories(1, newEntriesPerPage, sortOrder); // Reset to page 1
  };

  const handleSort = (column) => {
    const newSortOrder =
      sortBy === column && sortOrder === "asc" ? "desc" : "asc"; // Toggle sorting order
    setSortColumn(column); // Set the column being sorted
    setSortOrder(newSortOrder); // Set the new sorting order
  
    fetchCategories(page, entriesPerPage, newSortOrder, column); // Fetch categories with new sort order
  };
  

  useEffect(() => {
    fetchCategories(page, entriesPerPage, sortOrder);
  }, [page, entriesPerPage, sortOrder, Org_Id]);

  // useEffect(() => {
  //   if (selectedCategory) {
  //     setCategoryData({
  //       Cat_Name: selectedCategory.Cat_Name,
  //       SortOrder: selectedCategory.SortOrder,
  //       ShowOnHomePage: selectedCategory.ShowOnHomePage,
  //       Cat_Img: selectedCategory.Cat_Img, // Assuming you're managing image URLs
  //       SEOTitle: selectedCategory.SEOTitle,
  //       SEOKeyword: selectedCategory.SEOKeyword,
  //       SEODes: selectedCategory.SEODes,
  //       Cat_Desc: selectedCategory.Cat_Desc,
  //     });
  //   }
  // }, [selectedCategory]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCategoryData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  useEffect(() => {
    // Directly call fetchCategories when dependencies change
    fetchCategories(page, entriesPerPage, sortOrder, searchQuery);
  }, [searchQuery, page, entriesPerPage, sortOrder]);

  const handleFileChange = (e) => {
    setCategoryData((prevState) => ({
      ...prevState,
      Cat_Img: e.target.files[0], // Handle image file input
    }));
  };

  const handleDescriptionChange = (event, editor) => {
    const data = editor.getData();
    setCategoryData((prevState) => ({
      ...prevState,
      Cat_Desc: data,
    }));
  };

  const handleEdit = (category) => {
    setSelectedCategory(category);
    // Set the form values with the category data for editing
    setCategoryData({
      Cat_Name: category.Cat_Name,
      SortOrder: category.SortOrder,
      ShowOnHomePage: category.ShowOnHomePage,
      Cat_Img: category.Cat_Img, // Ensure it's set correctly for editing
      SEOTitle: category.SEOTitle,
      SEOKeyword: category.SEOKeyword,
      SEODes: category.SEODes,
      Cat_Desc: category.Cat_Desc,
    });
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   const formData = new FormData();
  //   formData.append('Cat_Name', categoryData.Cat_Name);
  //   formData.append('SortOrder', categoryData.SortOrder);
  //   formData.append('ShowOnHomePage', categoryData.ShowOnHomePage);
  //   formData.append('Cat_Img', categoryData.Cat_Img); // Ensure it's a valid file
  //   formData.append('SEOTitle', categoryData.SEOTitle);
  //   formData.append('SEOKeyword', categoryData.SEOKeyword);
  //   formData.append('SEODes', categoryData.SEODes);
  //   formData.append('Cat_Desc', categoryData.Cat_Desc);
  //   formData.append('Org_Id', Org_Id);  // Ensure Org_Id is available
  //   formData.append('Admin_Id', Admin_Id);
  //   formData.append('Added_By', username);   // Ensure Added_By is available

  //   if (selectedCategory) {
  //     // If we are editing, add the Cat_Id to the form data
  //     formData.append('Cat_Id', selectedCategory.Cat_Id);
  //   }

  //   try {
  //     let response;
  //     if (selectedCategory) {
  //       // If editing, send a PUT request
  //       response = await api.put(`/editCategories/${selectedCategory.Cat_Id}`, formData, {
  //         headers: {
  //           'Content-Type': 'multipart/form-data',
  //         },
  //       });
  //     } else {
  //       // If adding, send a POST request
  //       response = await api.post('/addCategories', formData, {
  //         headers: {
  //           'Content-Type': 'multipart/form-data',
  //         },
  //       });
  //     }

  //     if (response.status === 200 || response.status === 201) {
  //       Swal.fire({
  //         title: 'Success!',
  //         text: response.data.message || (selectedCategory ? 'Category updated successfully!' : 'Category added successfully!'),
  //         icon: 'success',
  //         confirmButtonText: 'OK',
  //       });
  //     } else {
  //       Swal.fire({
  //         title: 'Error!',
  //         text: response.data.message || 'Something went wrong!',
  //         icon: 'error',
  //         confirmButtonText: 'OK',
  //       });
  //     }
  //   } catch (err) {
  //     console.error('Error:', err.response ? err.response.data : err.message);
  //     Swal.fire({
  //       title: 'Error!',
  //       text: err.response ? err.response.data.message : 'Error submitting the form',
  //       icon: 'error',
  //       confirmButtonText: 'OK',
  //     });
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    showLoader();

    // Validation: Check if required fields are filled
    if (
      !categoryData.Cat_Name ||
      !categoryData.SortOrder ||
      !categoryData.ShowOnHomePage ||
      !categoryData.Cat_Img
    ) {
      Swal.fire({
        title: "Error!",
        text: "Please fill in all required fields.",
        icon: "error",
        confirmButtonText: "OK",
      });
      return; // Stop form submission if validation fails
    }

    const formData = new FormData();
    formData.append("Cat_Name", categoryData.Cat_Name);
    formData.append("SortOrder", categoryData.SortOrder);
    formData.append("ShowOnHomePage", categoryData.ShowOnHomePage);
    formData.append("Cat_Img", categoryData.Cat_Img); // Ensure it's a valid file
    formData.append("SEOTitle", categoryData.SEOTitle);
    formData.append("SEOKeyword", categoryData.SEOKeyword);
    formData.append("SEODes", categoryData.SEODes);
    formData.append("Cat_Desc", categoryData.Cat_Desc);
    formData.append("Org_Id", Org_Id); // Ensure Org_Id is available
    formData.append("Admin_Id", Admin_Id);
    formData.append("Added_By", username); // Ensure Added_By is available

    if (selectedCategory) {
      // If we are editing, add the Cat_Id to the form data
      formData.append("Cat_Id", selectedCategory.Cat_Id);
    }

    const resetForm = () => {
      setCategoryData({
        Cat_Name: "",
        SortOrder: "",
        ShowOnHomePage: false,
        Cat_Img: null, // Reset file input
        SEOTitle: "",
        SEOKeyword: "",
        SEODes: "",
        Cat_Desc: "",
      });
      setSelectedCategory(null); // Reset selected category for edit mode
      const fileInput = document.getElementById("inp-type-3");
      if (fileInput) {
        fileInput.value = ""; // Reset the file input
      }
    };

    try {
      let response;
      if (selectedCategory) {
        // If editing, send a PUT request
        response = await api.put(
          `/editCategories/${selectedCategory.Cat_Id}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } else {
        // If adding, send a POST request
        response = await api.post("/addCategories", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }

      if (response.status === 200 || response.status === 201) {
        Swal.fire({
          title: "Success!",
          text:
            response.data.message ||
            (selectedCategory
              ? "Category updated successfully!"
              : "Category added successfully!"),
          icon: "success",
          confirmButtonText: "OK",
        });
        setChangedData('UpdatedData')
        fetchCategories();
        resetForm(); // Reset form after successful submission
      } else {
        Swal.fire({
          title: "Error!",
          text: response.data.message || "Something went wrong!",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    } catch (err) {
      console.error("Error:", err.response ? err.response.data : err.message);
      Swal.fire({
        title: "Error!",
        text: err.response
          ? err.response.data.message
          : "Error submitting the form",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const handleDelete = async (Cat_Id) => {
    try {
      // Confirm the delete action with SweetAlert
      const confirmDelete = await Swal.fire({
        title: "Are you sure?",
        text: "Do you really want to delete this category? This action cannot be undone.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel",
      });

      if (confirmDelete.isConfirmed) {
        // Call your API to delete the category
        const response = await api.delete(`/deleteCategories/${Cat_Id}`);

        // Check the response status
        if (response.status === 200) {
          Swal.fire({
            title: "Deleted!",
            text: "The category has been deleted successfully.",
            icon: "success",
            confirmButtonText: "OK",
          });

          setChangedData('DeleteData')
        } else {
          Swal.fire({
            title: "Error!",
            text: "Something went wrong while deleting the category.",
            icon: "error",
            confirmButtonText: "OK",
          });
        }
      } else {
        Swal.fire({
          title: "Cancelled",
          text: "The category was not deleted.",
          icon: "info",
          confirmButtonText: "OK",
        });
      }
    } catch (err) {
      console.error("Error deleting category:", err);
      Swal.fire({
        title: "Error!",
        text: "There was an issue with the delete request.",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally{
      hideLoader();
    }
  };


  return (
    <div className="wrapper">
      <div className="main-content">
        <div className="col-md-12 col-12">
          <div className="box-content card white">
            <h3 className="box-title">
              {selectedCategory ? "Edit Category" : "Add Category"}
            </h3>
            <div className="card-content">
              <form className="form-horizontal" onSubmit={handleSubmit}>
                <div className="form-group row">
                  <div className="col-3">
                    <label htmlFor="inp-type-1" className="control-label">
                      Category Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="inp-type-1"
                      placeholder="Category Name"
                      name="Cat_Name"
                      value={categoryData.Cat_Name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-3">
                    <label htmlFor="inp-type-2" className="control-label">
                      Sort Order <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="inp-type-2"
                      placeholder="Sort Order"
                      name="SortOrder"
                      value={categoryData.SortOrder}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-3">
                    <label htmlFor="dropdown" className="control-label">
                      Show Status On Home Screen{" "}
                      <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-control"
                      id="dropdown"
                      name="ShowOnHomePage"
                      value={categoryData.ShowOnHomePage}
                      onChange={handleChange}
                      required
                    >
                      <option value="" disabled>
                        Select Status
                      </option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                  <div className="col-3">
                    <label htmlFor="inp-type-3" className="control-label">
                      Image <span className="text-danger">*</span>
                    </label>
                    <input
                      type="file"
                      className="form-control"
                      id="inp-type-3"
                      name="Cat_Img"
                      placeholder="Upload File"
                      onChange={handleFileChange}
                      required
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
                      name="SEOTitle"
                      value={categoryData.SEOTitle}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-6">
                    <label htmlFor="inp-type-4" className="control-label">
                      SEO Keyword
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="inp-type-4"
                      placeholder="SEO Keyword"
                      name="SEOKeyword"
                      value={categoryData.SEOKeyword}
                      onChange={handleChange}
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
                      name="SEODes"
                      value={categoryData.SEODes}
                      onChange={handleChange}
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
                      data={categoryData.Cat_Desc}
                      onChange={handleDescriptionChange}
                    />
                  </div>
                </div>
                <button className="btn btn-primary">
                  {selectedCategory ? "Update" : "Submit"}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="row small-spacing">
          <div className="col-12">
            <div className="box-content">

              <div
                id="example_wrapper"
                className="dataTables_wrapper form-inline dt-bootstrap4"
              >
                <CategoryTable handleEdit={handleEdit} handleDelete={handleDelete} data={changedData} totalCount={totalCount} fetchCategories={fetchCategories} categories={categories}/>


                {/* <div className="row">
                  <div className="col-md-12">
                    <table
                      id="example"
                      className="table table-striped table-bordered display dataTable"
                      style={{ width: "100%" }}
                      role="grid"
                    >
                      <thead>
                        <tr>
                          <th
                            onClick={() => handleSort("cat_id")}
                            className={
                              sortBy === "cat_id"
                                ? sortOrder === "asc"
                                  ? "sorting_asc"
                                  : "sorting_desc"
                                : "sorting"
                            }
                            aria-label="Cat ID: activate to sort column descending"
                            aria-sort={sortBy === "cat_id" ? sortOrder : "none"}
                          >
                            Cat ID
                          </th>
                          <th
                            onClick={() => handleSort("cat_name")}
                            className={
                              sortBy === "cat_name"
                                ? sortOrder === "asc"
                                  ? "sorting_asc"
                                  : "sorting_desc"
                                : "sorting"
                            }
                            aria-label="Cat Name: activate to sort column descending"
                            aria-sort={
                              sortBy === "cat_name" ? sortOrder : "none"
                            }
                          >
                            Cat Name
                          </th>
                          <th>Image</th>
                          <th>Description</th>
                          <th>Show on Home</th>
                          <th
                            onClick={() => handleSort("sort_order")}
                            className={
                              sortBy === "sort_order"
                                ? sortOrder === "asc"
                                  ? "sorting_asc"
                                  : "sorting_desc"
                                : "sorting"
                            }
                            aria-label="Sort Order: activate to sort column descending"
                            aria-sort={
                              sortBy === "sort_order" ? sortOrder : "none"
                            }
                          >
                            Sort Order
                          </th>
                          <th className="text-center">Operations</th>
                        </tr>
                      </thead>

                      <tbody>
                        {categories.map((category,index) => (
                          <tr key={category.Cat_Id}>
                            <td>{category.Cat_Id}</td>
                            <td>{category.Cat_Name}</td>
                            <td>
                              <img
                                src={`${imageURL}/Images/categories/${category.Cat_Img}`}
                                alt={category.Cat_Name}
                                style={{ width: "50px" }}
                              />
                            </td>
                            <td
                              style={{
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                maxWidth: '300px',
                              }}
                              title={category.Cat_Desc} // Tooltip showing the full description
                            >
                              {category.Cat_Desc.length > 50 ? `${category.Cat_Desc.substring(0, 50)}...` : category.Cat_Desc}
                            </td>
                            <td>{category.ShowOnHomePage ? "Yes" : "No"}</td>
                            <td>{category.SortOrder}</td>
                            <td style={{ textAlign: "center" }}>
                              <div className="dropdown" key={category.Cat_Id}>
          <i
            className="fas fa-ellipsis-v"
            style={{
              cursor: 'pointer',
              fontSize: '18px',
            }}
            onClick={() => toggleDropdown(index)} // Toggle specific dropdown visibility
          ></i>

          {openDropdown === index && (
            <ul
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                zIndex: 1050,
                minWidth: '10rem',
                padding: '0.5rem 0',
                fontSize: '14px',
                color: '#212529',
                textAlign: 'left',
                listStyle: 'none',
                backgroundColor: '#fff',
                border: '1px solid rgba(0, 0, 0, 0.15)',
                borderRadius: '0.25rem',
                boxShadow: '0 0.5rem 1rem rgba(0, 0, 0, 0.175)',
              }}
            >
              <li>
                <a
                  className="dropdown-item"
                  href="#"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.25rem 1rem',
                    color: '#007bff', // Blue for Edit
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                    transition: 'background-color 0.15s ease-in-out, color 0.15s ease-in-out',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#f0f8ff'; // Light blue on hover
                    e.target.style.color = '#0056b3'; // Darker blue for hover
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = '#007bff'; // Reset to blue
                  }}
                  onClick={() => handleEdit(category)} // Handle the Edit action
                >
                  <i
                    className="fas fa-edit"
                    style={{
                      marginRight: '10px',
                      color: '#007bff', // Blue color for the icon
                    }}
                  ></i>
                  Edit
                </a>
              </li>

              <li>
                <a
                  className="dropdown-item"
                  href="#"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.25rem 1rem',
                    color: '#dc3545', // Red for Delete
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                    transition: 'background-color 0.15s ease-in-out, color 0.15s ease-in-out',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#f8d7da'; // Light red on hover
                    e.target.style.color = '#721c24'; // Darker red for hover
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = '#dc3545'; // Reset to red
                  }}
                  onClick={() => handleDelete(category.Cat_Id)} // Handle the Delete action
                >
                  <i
                    className="far fa-trash-alt"
                    style={{
                      marginRight: '10px',
                      color: '#dc3545', // Red color for the icon
                    }}
                  ></i>
                  Delete
                </a>
              </li>
            </ul>
          )}
        </div>
                            </td>
                          </tr>
                        ))}
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
                      Showing {(page - 1) * entriesPerPage + 1} to{" "}
                      {Math.min(page * entriesPerPage, totalCount)} of{" "}
                      {totalCount} entries
                    </div>
                  </div>
                  <div className="col-md-7">
                    <div
                      className="dataTables_paginate paging_simple_numbers"
                      id="example_paginate"
                    >
                      <ul className="pagination">
                        {page > 1 && (
                          <li className="paginate_button page-item previous">
                            <a
                              href="#"
                              className="page-link"
                              onClick={() => handlePageChange(page - 1)}
                            >
                              Previous
                            </a>
                          </li>
                        )}
                        {[...Array(Math.ceil(totalCount / entriesPerPage))].map(
                          (_, index) => (
                            <li
                              key={index}
                              className={`paginate_button page-item ${
                                page === index + 1 ? "active" : ""
                              }`}
                            >
                              <a
                                href="#"
                                className="page-link"
                                onClick={() => handlePageChange(index + 1)}
                              >
                                {index + 1}
                              </a>
                            </li>
                          )
                        )}
                        {page < Math.ceil(totalCount / entriesPerPage) && (
                          <li className="paginate_button page-item next">
                            <a
                              href="#"
                              className="page-link"
                              onClick={() => handlePageChange(page + 1)}
                            >
                              Next
                            </a>
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div> */}

              </div>
              {loader}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddCategories;
