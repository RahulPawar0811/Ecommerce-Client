import { React, useState, useEffect, useContext } from "react";
import api from "../pages/Axios";
import { UserContext, useUser } from "../context/UserContext";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import useFullPageLoader from "../components/useFullPageLoader";
import VariantTypesTable from "./tables/VariantTypesTable";

function AddVariantTypes() {
  const [variantType, setVariantType] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user } = useUser();
  const [variantData, setVariantData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loader,showLoader,hideLoader] = useFullPageLoader();
  const [changedData, setChangedData] = useState('')
  const [entriesPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({
    key: "VariantType",
    direction: "asc",
  });

  // Fetch Data
  useEffect(() => {
    fetchVariantData();
  }, [user?.orgId]); // Call fetchVariantData when the component mounts

  const fetchVariantData = async () => {
    showLoader();
    try {
      const response = await api.get(`/viewVariantTypes/${user?.orgId}`);
      setVariantData(response.data); // Update the state with the fetched data
      setFilteredData(response.data); // For filtering purposes
    } catch (error) {
      console.error("Error fetching data:", error);
    }finally{
      hideLoader();
    }
  };

  // Handle Search
  useEffect(() => {
    const filtered = variantData.filter(
      (item) =>
        item.VariantType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.AddedBy?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredData(filtered);
    setCurrentPage(1); // Reset to first page on new search
  }, [searchQuery, variantData]);

  // Handle Sorting
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
    const sorted = [...filteredData].sort((a, b) => {
      if (key === "AddedOn") {
        const dateA = new Date(a[key]);
        const dateB = new Date(b[key]);
        return direction === "asc" ? dateA - dateB : dateB - dateA;
      } else {
        if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
        if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
        return 0;
      }
    });
    setFilteredData(sorted);
  };

  // Paginate Data
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredData.slice(
    indexOfFirstEntry,
    indexOfLastEntry
  );

  // Pagination Handlers
  const totalPages = Math.ceil(filteredData.length / entriesPerPage);
  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Handle form input change
  const handleInputChange = (e) => {
    setVariantType(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior
    showLoader();

    try {
      const response = await api.post("/addVariantTypes", {
        VariantType: variantType,
        Org_Id: user?.orgId, // Replace with actual Org_Id
        Admin_Id: user?.userId, // Replace with actual Admin_Id
        AddedBy: `${user?.fname || "admin"}  ${user?.lname}`, // Replace with actual user
      });

      // Handle success
      console.log("Variant added successfully:", response.data);
      Swal.fire({
        title: "Success!",
        text: "Variant added successfully.",
        icon: "success",
        confirmButtonText: "OK",
      });

      setVariantType(""); // Reset form

      // Fetch the updated data
      setChangedData('AddedData')
      await fetchVariantData(); // Call your data-fetching function here
    } catch (error) {
      // Handle error
      console.error("Error adding variant:", error);
      Swal.fire({
        title: "Error!",
        text: "An error occurred while adding the variant.",
        icon: "error",
        confirmButtonText: "Try Again",
      });
    } finally {
      hideLoader();
    }
  };

  const handleDelete = async (Sr_No) => {
    showLoader();
    try {
      // Show confirmation dialog
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "This action will delete the variant type. Do you want to proceed?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "No, cancel!",
        reverseButtons: true,
      });

      if (result.isConfirmed) {
        showLoader();
        // Call API to delete the variant
        const response = await api.delete(`/deleteVariantTypes/${Sr_No}`);

        if (response.status === 200) {
          // Show success message
          Swal.fire(
            "Deleted!",
            "The variant type has been deleted.",
            "success"
          );

          // Refresh the data
          await fetchVariantData();
        } else {
          // Show error message if deletion failed
          Swal.fire(
            "Error!",
            "Failed to delete the variant type. Try again.",
            "error"
          );
        }
      } else {
        // Show cancellation message
        Swal.fire("Cancelled", "The variant type was not deleted.", "info");
      }
    } catch (error) {
      console.error("Error deleting variant type:", error);
      // Show error message
      Swal.fire(
        "Error!",
        "An error occurred while deleting the variant type.",
        "error"
      );
    }finally{
      hideLoader();
    }
  };

  // Function to export table to Excel
  const handleExportExcel = () => {
    const ws = XLSX.utils.table_to_sheet(document.getElementById("example")); // Get table data
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, "variranttypes-data.xlsx");
  };

  // Function to export table to PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({ html: "#example" }); // Export table using jsPDF autoTable
    doc.save("variranttypes-data.pdf");
  };

  return (
    <div className="wrapper">
      <div className="main-content">
        <div className="col-md-12 col-12">
          <div className="box-content card white">
            <h3 className="box-title">Add Variant</h3>
            <div className="card-content">
              <form className="form-horizontal" onSubmit={handleSubmit}>
                <div className="form-group row">
                  <div className="col-6">
                    <label htmlFor="inp-type-2" className="control-label">
                      Variant Type
                    </label>
                    <input
                      type="text" // Changed to text for easier input handling
                      className="form-control"
                      id="inp-type-2"
                      placeholder="Enter Variant Type"
                      value={variantType}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                {error && <div className="alert alert-danger">{error}</div>}{" "}
                {/* Error message */}
                <button
                  className="btn btn-primary"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Adding..." : "Add"}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="row small-spacing">
          <div className="col-12">
            <div className="box-content">
              <VariantTypesTable handleDelete={handleDelete} data={changedData} fetchVariants={fetchVariantData} variantData={variantData}/>
{/* 
              <div
                id="example_wrapper"
                className="dataTables_wrapper form-inline dt-bootstrap4"
              >
                <div className="row">
                  <div className="col-md-6">
                    <div
                      className="d-flex justify-content-between align-items-center"
                      style={{ gap: "15px" }}
                    >
                      <div className="dataTables_length" id="example_length">
                        <label>
                          Show
                          <select
                            name="example_length"
                            aria-controls="example"
                            className="form-control input-sm"
                          >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                          </select>
                          entries
                        </label>
                      </div>

                      <div
                        className="export-icons"
                        style={{
                          display: "flex",
                          gap: "15px",
                          marginRight: "365px",
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
                          type="search"
                          className="form-control input-sm"
                          placeholder="Search by VariantType or AddedBy"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
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
                            className="sorting"
                            onClick={() => handleSort("AddedOn")}
                          >
                            Date Added
                          </th>
                          <th
                            className="sorting"
                            onClick={() => handleSort("VariantType")}
                          >
                            Variant Type
                          </th>
                          <th
                            className="sorting"
                            onClick={() => handleSort("AddedBy")}
                          >
                            Added By
                          </th>
                          <th className="text-center">Operations</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentEntries.map((item, index) => (
                          <tr key={index}>
                            <td>
                              <td>
                                {new Date(item.AddedOn).toLocaleDateString(
                                  "en-GB"
                                )}
                              </td>
                            </td>
                            <td>{item.VariantType}</td>
                            <td>{item.AddedBy}</td>
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
                                      onClick={() => handleDelete(item.Sr_No)}
                                    >
                                      <i
                                        className="far fa-trash-alt"
                                        style={{
                                          marginRight: "10px",
                                          color: "#dc3545", // Red color for the icon
                                        }}
                                        onClick={() => handleDelete(item.Sr_No)}
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
                </div>

                <div className="row">
                  <div className="col-md-5">
                    <div
                      className="dataTables_info"
                      id="example_info"
                      role="status"
                      aria-live="polite"
                    >
                      Showing {(currentPage - 1) * entriesPerPage + 1} to{" "}
                      {Math.min(
                        currentPage * entriesPerPage,
                        filteredData.length
                      )}{" "}
                      of {filteredData.length} entries
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
                          <a href="#" className="page-link">
                            Previous
                          </a>
                        </li>
                        {Array.from(
                          { length: totalPages },
                          (_, idx) => idx + 1
                        ).map((page) => (
                          <li
                            key={page}
                            className={`paginate_button page-item ${
                              page === currentPage ? "active" : ""
                            }`}
                            onClick={() => handlePageChange(page)}
                          >
                            <a href="#" className="page-link">
                              {page}
                            </a>
                          </li>
                        ))}
                        <li
                          className={`paginate_button page-item next ${
                            currentPage === totalPages ? "disabled" : ""
                          }`}
                          onClick={() => handlePageChange(currentPage + 1)}
                        >
                          <a href="#" className="page-link">
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

export default AddVariantTypes;
