import React, { useState, useEffect, useContext } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Checkbox,
  Paper,
  IconButton,
  Box,
  TextField,
  Tooltip,
  Select,
  MenuItem,
  Collapse,
  Button,
  InputLabel,
  FormControl,
  Typography,
} from "@mui/material";
import { Edit, Delete, FilterList } from "@mui/icons-material";
import api, { imageURL } from "../../pages/Axios";
import { UserContext, useUser } from "../../context/UserContext";
import { useDebounce } from "use-debounce"; // Import useDebounce
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import useFullPageLoader from "../../components/useFullPageLoader";

const SubCategoryTable = ({ handleEdit, handleDelete, data ,fetchSubcategories, subCategories }) => {
  const [selected, setSelected] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [sortOrder, setSortOrder] = useState("ASC");
  const [searchQuery, setSearchQuery] = useState("");
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [catId, setCatId] = useState(""); // For category filter
  const { user } = useUser();
  const [categories, setCategories] = useState([]);
  const [loader, showLoader, hideLoader] = useFullPageLoader();

  const orgId = `${user?.orgId}`; // Example Org ID

  // Fetch categories to populate dropdown
  useEffect(() => {
    showLoader();
    api
      .get(`/viewCategories/${orgId}`)
      .then((response) => {
        console.log("API response:", response.data);
        if (Array.isArray(response.data)) {
          setCategories(response.data);
        } else if (response.data.categories && Array.isArray(response.data.categories)) {
          setCategories(response.data.categories);
        } else {
          console.error("No categories data found.");
        }
      })
      .catch((error) => {
        console.error("There was an error fetching categories:", error);
      })
      .finally(() => {
        hideLoader();
      });
  }, [orgId]);

  // Fetch subcategories based on category filter
  useEffect(() => {
    // const fetchData = async () => {
    //   if (!orgId) return;

    //   showLoader();
    //   try {
    //     const params = { orgId };
    //     if (catId) params.catId = catId; // Add category filter to API request

    //     const response = await api.get("/viewSubCategories", { params });

    //     if (response?.data?.subCategories) {
    //       setSubCategories(response.data.subCategories);
    //     } else {
    //       console.warn("No subCategories found in response");
    //       setSubCategories([]);
    //     }
    //   } catch (err) {
    //     console.error("Error fetching data:", err);
    //   } finally {
    //     hideLoader();
    //   }
    // };

    fetchSubcategories();
  }, [orgId, catId , data]); // Fetch when `catId` changes

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  // Apply debounce to searchQuery
  const [debouncedSearchQuery] = useDebounce(searchQuery, 500); // Debounce search query

  // Filtered data based on the debounced search query
  const filteredSubCategories = subCategories.filter(
    (subCategory) =>
      subCategory.Sub_Cat_Name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      subCategory.Cat_Desc.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      subCategory.Cat_Name.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
  );

  const handleSelect = (id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
    setExpandedRow(newSelected.length === 1 ? id : null);
    setShowBulkActions(newSelected.length > 1);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Function to handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to the first page
  };

  // Sliced data for the current page
  const paginatedSubCategories = filteredSubCategories.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleSelectAll = (event) => {
    const isChecked = event.target.checked;

    if (isChecked) {
      setSelected(filteredSubCategories.map((subCategory) => subCategory.Cat_Id)); // Select all filtered items
    } else {
      setSelected([]);
    }
    setShowBulkActions(isChecked); // Show bulk actions when all are selected
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredSubCategories);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "SubCategories");
    XLSX.writeFile(wb, "subcategories.xlsx");
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [
        [
          "SubCategory ID",
          "SubCategory Name",
          "Sort Order",
          "SubCategory Description",
          "Show On Home",
          "SEOTitle",
          "SEODesc",
          "SEOKeyword",
          "Added By",
          "Added On",
        ],
      ],
      body: filteredSubCategories.map((subCategory) => [
        subCategory.Cat_Id,
        subCategory.Sub_Cat_Name,
        subCategory.SortOrder,
        subCategory.Cat_Desc,
        subCategory.ShowOnHomePage,
        subCategory.SEOTitle,
        subCategory.SEODes,
        subCategory.SEOKeyword,
        subCategory.Added_By,
        subCategory.Added_On,
      ]),
    });
    doc.save("subcategories.pdf");
  };

  return (
    <Paper>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <Typography variant="h6">View SubCategories</Typography>
          <div
            className="export-icons"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "15px",
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

        <Box sx={{ display: "flex", gap: "15px", alignItems: "center" }}>
          <TextField
            size="small"
            variant="outlined"
            placeholder="Search..."
            onChange={handleSearch}
          />
        </Box>
      </Box>

      <TableContainer sx={{ border: "1px solid #ddd" }}>
        <Table>
          <TableHead >
            <TableRow style={{ backgroundColor: "#f0f0f0" }}>
              <TableCell colSpan={1} style={{ textAlign: "left", paddingLeft: "16px" }}>
                <FilterList style={{ verticalAlign: "middle", marginRight: "8px" }} />
              </TableCell>
              <TableCell colSpan={7} style={{ textAlign: "left" }}>
                <FormControl size="small" style={{ minWidth: "200px" }}>
                  <InputLabel>Filter by Category</InputLabel>
                  <Select
                    value={catId}
                    onChange={(e) => setCatId(e.target.value)}
                    label="Filter by Category"
                    style={{
                      backgroundColor: catId ? "white" : "inherit",
                    }}
                  >
                    <MenuItem value="">All Categories</MenuItem>
                    {categories.map((category) => (
                      <MenuItem key={category.Cat_Id} value={category.Cat_Id}>
                        {category.Cat_Name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableHead>
            <TableRow style={{ backgroundColor: "#f0f0f0" }}>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selected.length > 0 && selected.length < filteredSubCategories.length}
                  checked={filteredSubCategories.length > 0 && selected.length === filteredSubCategories.length}
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell align="center">Sr No.</TableCell>
              <TableCell align="center">SubCat Name</TableCell>
              <TableCell align="center">Image</TableCell>
              <TableCell align="center">Description</TableCell>
              <TableCell align="center">Category</TableCell>
              <TableCell align="center">Sort Order</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedSubCategories.map((subCategory,index) => {
              const isItemSelected = isSelected(subCategory.Cat_Id);
              const startIndex = page * rowsPerPage;

              return (
                <TableRow
                  key={subCategory.Cat_Id}
                  hover
                  role="checkbox"
                  tabIndex={-1}
                  selected={isItemSelected}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isItemSelected}
                      onClick={() => handleSelect(subCategory.Cat_Id)}
                    />
                  </TableCell>
                  <TableCell align="center">{startIndex + index + 1}</TableCell>
                  <TableCell align="center">{subCategory.Sub_Cat_Name}</TableCell>
                  <TableCell align="center">
                    <img
                      src={`${imageURL}/Images/Sub-Category/${subCategory.Cat_Img}`}
                      alt={subCategory.Sub_Cat_Name}
                      style={{
                        width: "20px",
                        height: "20px",
                        objectFit: "cover",
                      }}
                    />
                  </TableCell>
                  <TableCell
                    align="center"
                    style={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: "140px",
                    }}
                  >
                    <Tooltip title={subCategory.Cat_Desc} arrow>
                      <span>
                        {subCategory.Cat_Desc.length > 50
                          ? `${subCategory.Cat_Desc.substring(0, 50)}...`
                          : subCategory.Cat_Desc}
                      </span>
                    </Tooltip>
                  </TableCell>
                  <TableCell align="center">{subCategory.Cat_Name}</TableCell>
                  <TableCell align="center">{subCategory.SortOrder}</TableCell>
                  <TableCell>
                                      <div
                                        style={{
                                          display: "flex",
                                          gap: "0px",
                                          alignItems: "center",
                                          justifyContent: "center",
                                        }}
                                      >
                                        {/* Edit Icon */}
                                        <IconButton
                                          color="primary" // Primary color for Edit
                                          onMouseEnter={(e) => {
                                            e.target.style.transform = "scale(1.1)"; // Scale up on hover
                                          }}
                                          onMouseLeave={(e) => {
                                            e.target.style.transform = "scale(1)"; // Reset scale on mouse leave
                                          }}
                                          onClick={() => handleEdit(subCategory)} // Trigger edit
                                        >
                                          <Edit />
                                        </IconButton>
                  
                                        {/* Delete Icon */}
                                        <IconButton
                                          color="error" // Danger color for Delete
                                          onMouseEnter={(e) => {
                                            e.target.style.transform = "scale(1.1)"; // Scale up on hover
                                          }}
                                          onMouseLeave={(e) => {
                                            e.target.style.transform = "scale(1)"; // Reset scale on mouse leave
                                          }}
                                          onClick={() => handleDelete([subCategory.Id])} // Trigger delete
                                        >
                                          <Delete />
                                        </IconButton>
                                      </div>
                                    </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <Collapse in={showBulkActions} timeout="auto" unmountOnExit>
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            padding: "16px",
            backgroundColor: "#f1f1f1",
            borderTop: "1px solid #ddd",
          }}
        >
          <Button
            variant="contained"
            color="error"
            onClick={() => handleDelete(selected)}
          >
            Delete Selected
          </Button>
        </Box>
      </Collapse>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredSubCategories.length} // Use filteredSubCategories here
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export default SubCategoryTable;
