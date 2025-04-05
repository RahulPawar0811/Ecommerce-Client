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
  Collapse,
  Button,
  Typography,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import api from "../../pages/Axios";
import { UserContext, useUser } from "../../context/UserContext";
import { useDebounce } from "use-debounce";
import useFullPageLoader from "../../components/useFullPageLoader";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

const VariantTypesTable = ({ data, handleDelete , fetchVariants , variantData}) => {
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [loader, showLoader, hideLoader] = useFullPageLoader();
  const { user } = useUser();
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);

  const orgId = `${user?.orgId}`; // Example Org ID

  useEffect(() => {
    fetchVariants();
  }, [user?.orgId,data]); // Call fetchVariantData when the component mounts

  // const fetchVariantData = async () => {
  //   showLoader();
  //   try {
  //     const response = await api.get(`/viewVariantTypes/${user?.orgId}`);
  //     setVariantData(response.data); // Update the state with the fetched data
  //   } catch (error) {
  //     console.error("Error fetching data:", error);
  //   } finally {
  //     hideLoader();
  //   }
  // };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  // Debounce search query to optimize filtering
  const [debouncedSearchQuery] = useDebounce(searchQuery, 500);

  // Filter variant types based on the search query
  const filteredVariants = variantData.filter(
    (variant) =>
      variant.VariantType.toLowerCase().includes(
        debouncedSearchQuery.toLowerCase()
      ) ||
      variant.AddedBy.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
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
    setShowBulkActions(newSelected.length > 0);
  };

  const handleSelectAll = (event) => {
    const isChecked = event.target.checked;

    if (isChecked) {
      const allSelected = filteredVariants.map((variant) => variant.Sr_No);
      setSelected(allSelected);
      setShowBulkActions(allSelected.length > 0);
    } else {
      setSelected([]);
      setShowBulkActions(false);
    }
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredVariants);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "VariantTypes");
    XLSX.writeFile(wb, "variant_types.xlsx");
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [
        [
          "Sr No",
          "Org Id",
          "Admin Id",
          "Branch Id",
          "Variant Type",
          "Added On",
          "Added By",
        ],
      ],
      body: filteredVariants.map((variant) => [
        variant.Sr_No,
        variant.Org_Id,
        variant.Admin_Id,
        variant.Branch_Id,
        variant.VariantType,
        new Date(variant.AddedOn).toLocaleDateString(),
        variant.AddedBy,
      ]),
    });
    doc.save("variant_types.pdf");
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedVariants = filteredVariants.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const startIndex = page * rowsPerPage;

  return (
    <Paper>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px",
        //  backgroundColor: "#f0f0f0" ,
        }}
        
      >
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <Typography variant="h6">View Variant Types</Typography>
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
          <TableHead sx={{ backgroundColor: "#f0f0f0" }}>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={
                    selected.length > 0 &&
                    selected.length < filteredVariants.length
                  }
                  checked={
                    filteredVariants.length > 0 &&
                    selected.length === filteredVariants.length
                  }
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell align="center">Sr No</TableCell>
              <TableCell align="center">Org Id</TableCell>
              <TableCell align="center">Admin Id</TableCell>
              <TableCell align="center">Branch Id</TableCell>
              <TableCell align="center">Variant Type</TableCell>
              <TableCell align="center">Added On</TableCell>
              <TableCell align="center">Added By</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedVariants.map((variant,index) => (
              <TableRow
                key={variant.Sr_No}
                hover
                role="checkbox"
                tabIndex={-1}
                selected={isSelected(variant.Sr_No)}
              >
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={isSelected(variant.Sr_No)}
                    onClick={() => handleSelect(variant.Sr_No)}
                  />
                </TableCell>
                <TableCell align="center">{startIndex + index + 1}</TableCell>
                <TableCell align="center">{variant.Org_Id}</TableCell>
                <TableCell align="center">{variant.Admin_Id}</TableCell>
                <TableCell align="center">{variant.Branch_Id}</TableCell>
                <TableCell align="center">{variant.VariantType}</TableCell>
                <TableCell align="center">
                  {new Date(variant.AddedOn).toLocaleDateString("en-GB")}
                </TableCell>
                <TableCell align="center">{variant.AddedBy}</TableCell>
                <TableCell align="center">
                  <IconButton
                    color="error"
                    onClick={() => handleDelete([variant.Sr_No])}
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
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
        count={filteredVariants.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export default VariantTypesTable;
