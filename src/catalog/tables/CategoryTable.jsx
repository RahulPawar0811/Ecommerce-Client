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
  Collapse,
  Typography,
  Button,
  Tooltip
} from "@mui/material";
import { Edit, Delete, ExpandLess, ExpandMore } from "@mui/icons-material";
import api, { imageURL } from "../../pages/Axios";
import { UserContext, useUser } from "../../context/UserContext";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

const CategoryTable = ({ handleEdit, handleDelete, data , fetchCategories , categories, totalCount}) => {
  const [selected, setSelected] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortOrder, setSortOrder] = useState("ASC");
  const [searchQuery, setSearchQuery] = useState("");
  const [showBulkActions, setShowBulkActions] = useState(false);
  const { user } = useUser();

  const Org_Id = `${user?.orgId}`; // Example Org ID

  // // Fetch categories data
  // const fetchCategoriesTable = async (
  //   page = 1,
  //   entriesPerPage = 10,
  //   sortOrder = "ASC",
  //   searchQuery = ""
  // ) => {
  //   try {
  //     const response = await api.get(`/viewCategories/${Org_Id}`, {
  //       params: {
  //         page,
  //         limit: entriesPerPage,
  //         search: searchQuery,
  //         sortOrder,
  //       },
  //     });
  //     setCategories(response.data.categories);
  //     setTotalCount(response.data.totalCount);
  //   } catch (error) {
  //     console.error("Error fetching categories:", error);
  //   }
  // };

  // Handle table updates
  useEffect(() => {
    fetchCategories(page + 1, rowsPerPage, sortOrder, searchQuery, Org_Id);
  }, [page, rowsPerPage, sortOrder, searchQuery, Org_Id, data]);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

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

  const handleSelectAll = (event) => {
    const isChecked = event.target.checked;
    if (isChecked) {
      setSelected(categories.map((category) => category.Cat_Id));
      setShowBulkActions(true);
    } else {
      setSelected([]);
      setShowBulkActions(false);
    }
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(categories); // Convert JSON data to Excel sheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Categories");

    // Save the workbook
    XLSX.writeFile(wb, "categories.xlsx");
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [["Category ID", "Category Name", "Sort Order", "Category Description", "Show On Home ", "SEOTitle", "SEOTitle", "SEODesc", "SEOKeyword", "Added By", "Added On"]],
      body: categories.map((category) => [
        category.Cat_Id,
        category.Cat_Name,
        category.SortOrder,
        category.Cat_Desc,
        category.ShowOnHomePage,
        category.SEOTitle,
        category.SEODes,
        category.SEOKeyword,
        category.Added_By,
        category.Added_On,
      ]),
    });
    doc.save("categories.pdf");
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
        {/* Title and Export Icons Section */}
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <Typography variant="h6">View Categories</Typography>

          {/* Export Icons */}
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

        {/* Search Input */}
        <TextField
          size="small"
          variant="outlined"
          placeholder="Search..."
          onChange={handleSearch}
        />
      </Box>

      <TableContainer sx={{ border: "1px solid #ddd" }}>
        <Table>
          <TableHead sx={{ backgroundColor: "#f0f0f0" }}>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={
                    selected.length > 0 && selected.length < categories.length
                  }
                  checked={
                    categories.length > 0 && selected.length === categories.length
                  }
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell align="center">Sr No.</TableCell>
              <TableCell align="center">Cat Name</TableCell>
              <TableCell align="center">Image</TableCell>
              <TableCell align="center">Description</TableCell>
              <TableCell align="center">Show on Home</TableCell>
              <TableCell align="center">Sort Order</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map((category,index) => {
              const isItemSelected = isSelected(category.Cat_Id);
              const isExpanded = expandedRow === category.Cat_Id;
              const startIndex = page * rowsPerPage;


              return (
                <TableRow
                  key={category.Cat_Id}
                  hover
                  role="checkbox"
                  tabIndex={-1}
                  selected={isItemSelected}
                  sx={{ borderBottom: "1px solid #ddd" }}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isItemSelected}
                      onClick={() => handleSelect(category.Cat_Id)}
                    />
                  </TableCell>
                  <TableCell align="center">{startIndex + index + 1}</TableCell>
                  <TableCell align="center">{category.Cat_Name}</TableCell>
                  <TableCell align="center">
                    <img
                      src={`${imageURL}/Images/categories/${category.Cat_Img}`}
                      alt={category.Cat_Name}
                      style={{
                        width: "20px", // Set the width to a consistent size
                        height: "20px", // Set the height to match the width
                        objectFit: "cover", // Ensures the image fits within the bounds
                      }}
                    />
                  </TableCell>

                  <TableCell
                    align="center"
                    style={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: "140px", // Decrease the width to 200px or adjust as needed
                    }}
                  >
                    <Tooltip
                      title={category.Cat_Desc} // Full description to show on hover
                      arrow
                      sx={{
                        backgroundColor: "rgba(0, 0, 0, 0.87)", // Light black background
                        color: "white", // White text
                        fontSize: "18px", // Smaller text
                      }}
                    >
                      <span>
                        {category.Cat_Desc.length > 20
                          ? `${category.Cat_Desc.substring(0, 20)}...`
                          : category.Cat_Desc}
                      </span>
                    </Tooltip>
                  </TableCell>

                  <TableCell align="center">
                    {category.ShowOnHomePage}
                  </TableCell>

                  <TableCell align="center">{category.SortOrder}</TableCell>
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
                        onClick={() => handleEdit(category)} // Trigger edit
                      >
                        <Edit />
                      </IconButton>

                      <IconButton
                        color="error"
                        onMouseEnter={(e) => {
                          e.target.style.transform = "scale(1.1)"; 
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = "scale(1)"; 
                        }}
                        onClick={() => handleDelete([category.Cat_Id])}
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
        component="div"
        count={totalCount}
        page={page}
        onPageChange={(event, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(event) =>
          setRowsPerPage(parseInt(event.target.value, 10))
        }
        rowsPerPageOptions={[10, 20, 50]}
      />
    </Paper>
  );
};

export default CategoryTable;
