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
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Collapse,
  IconButton,
  Button,
  Typography,
} from "@mui/material";
import { FilterList } from "@mui/icons-material";
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import api, { imageURL } from "../../pages/Axios";
import { UserContext, useUser } from "../../context/UserContext";
import useFullPageLoader from "../../components/useFullPageLoader";
import { Link } from "react-router-dom";
import { Edit, Delete, Add } from "@mui/icons-material";
import ProductModal from "../modals/ProductModal";



const ProductTable = ({ handleEdit, handleDelete , fetchProductTable, products }) => {

  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selected, setSelected] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
    
  

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { user } = useUser();;
  const [loader, showLoader, hideLoader] = useFullPageLoader();

  useEffect(() => {
    if (!user?.orgId) return;
    showLoader();
    api
      .get(`/viewAllCategories/${user.orgId}`)
      .then((response) => setCategories(response?.data?.categories || []))
      .catch((error) => console.error("Error fetching categories:", error))
      .finally(() => hideLoader());
  }, [user?.orgId]);

  useEffect(() => {
    if (!selectedCategory || !user?.orgId) return;
    showLoader();
    api
      .get(`/viewSubCategories`, {
        params: { orgId: user.orgId, catId: selectedCategory },
      })
      .then((response) => setSubCategories(response?.data?.subCategories || []))
      .catch((error) => console.error("Error fetching subcategories:", error))
      .finally(() => hideLoader());
  }, [selectedCategory, user?.orgId]);

  useEffect(() => {
   fetchProductTable();
  }, [user?.orgId]);

  useEffect(() => {
    let updatedProducts = [...products];

    if (selectedCategory) {
      updatedProducts = updatedProducts.filter(
        (product) => product.Cat_Id === selectedCategory
      );
    }

    if (selectedSubCategory) {
      updatedProducts = updatedProducts.filter(
        (product) => product.Sub_Cat_Id === selectedSubCategory
      );
    }

    if (searchQuery) {
      updatedProducts = updatedProducts.filter(
        (product) =>
          product.Prod_Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.Cat_Name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProducts(updatedProducts);
  }, [selectedCategory, selectedSubCategory, searchQuery, products]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setSelectedSubCategory("");
  };

  const handleSubCategoryChange = (e) => {
    setSelectedSubCategory(e.target.value);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  

  const handleShowModal = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
    setSelected([]);
  };

  
  
  
  const handleSelect = (id, product) => {
    let newSelected = [id]; // Directly assign new array with id
    
    setSelected(newSelected);

    if (user?.IsVariant === 1) {  // Check if IsVariant is 1
      setShowBulkActions(false);
      setSelectedProduct(product);
      setShowModal(true);
    }
  };
  
  

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const newSelecteds = filteredProducts.map((product) => product.Prod_Id);
      setSelected(newSelecteds);
      setShowBulkActions(newSelecteds.length > 1);
    } else {
      setSelected([]);
      setShowBulkActions(false);
    }
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  const paginatedProducts = filteredProducts.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  const startIndex = page * rowsPerPage;



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

  return (
    <Paper>
      <Box sx={{ padding: "16px" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <Typography variant="h6">View Products</Typography>
            <div className="export-icons" style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <i
                className="fas fa-file-excel"
                title="Export to Excel"
                style={{ fontSize: "30px", cursor: "pointer", color: "green" }}
                onClick={handleExportExcel}
              />
              <i
                className="fas fa-file-pdf"
                title="Export to PDF"
                style={{ fontSize: "30px", cursor: "pointer", color: "red" }}
                onClick={handleExportPDF}
              />
            </div>
          </div>
          <Box sx={{ display: "flex", gap: "15px", alignItems: "center" }}>
            <TextField
              size="small"
              variant="outlined"
              placeholder="Search..."
              value={searchQuery}
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
                    <TableCell colSpan={9} style={{ textAlign: "left" }}>
            <FormControl size="small" style={{ minWidth: "160px" }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                onChange={handleCategoryChange}
                label="Category"
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.Cat_Id} value={category.Cat_Id}>
                    {category.Cat_Name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Sub-category Filter */}
            {user?.IsSubCat === 1 && (
  <FormControl size="small" style={{ minWidth: "160px" }} disabled={!selectedCategory}>
    <InputLabel>Sub-Category</InputLabel>
    <Select
      value={selectedSubCategory}
      onChange={handleSubCategoryChange}
      label="Sub-Category"
    >
      <MenuItem value="">All Sub-Categories</MenuItem>
      {subCategories.map((subCategory) => (
        <MenuItem key={subCategory.Id} value={subCategory.Id}>
          {subCategory.Sub_Cat_Name}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
)}
{products.length === 0 && (
  <Link
    to="/addProducts"  // Replace with your actual route
className="btn" 
style={{float:"right",color:"w"}}   
  >
    <Typography variant="button" color="primary">
      Add Product
    </Typography>
  </Link>
)}

                    </TableCell>
                  
                  </TableRow>
                </TableHead>
            <TableHead>
              <TableRow style={{ backgroundColor: "#f0f0f0" }}>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selected.length > 0 && selected.length < filteredProducts.length}
                    checked={filteredProducts.length > 0 && selected.length === filteredProducts.length}
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell align="center">Sr No.</TableCell>
                <TableCell align="center">Image</TableCell>
                <TableCell align="center">Product Name</TableCell>
                <TableCell align="center">Price</TableCell>
                <TableCell align="center">Category</TableCell>
                {user?.IsSubCat === 1 && (
                <TableCell align="center">Sub-Category</TableCell> 
                )}
                <TableCell align="center">Stock</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedProducts.map((product, index) => (
                <TableRow key={product.Prod_Id} hover>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isSelected(product.Prod_Id)}
                      onChange={() => handleSelect(product.Prod_Id,product)}
                    />
                  </TableCell>
                  <TableCell align="center">{startIndex + index + 1}</TableCell>
                  <TableCell align="center">
                    <img
                     src={`${imageURL}/Images/product/${product.Featured_Img}`}
                     style={{ width: "30px",height:"30px" }}
                    />
                   </TableCell>
                  <TableCell align="center">
                    <Tooltip title={product.Prod_Name} arrow>
                      <span>
                        {product.Prod_Name?.length > 20
                          ? `${product.Prod_Name.substring(0, 20)}...`
                          : product.Prod_Name}
                      </span>
                    </Tooltip>
                  </TableCell>
                  <TableCell align="center">{product.Web_Price}</TableCell>
                  <TableCell align="center">{product.Cat_Name}</TableCell>
                  {user?.IsSubCat === 1 && (
                  <TableCell align="center">{product.Sub_at_Name}</TableCell> 
                  )}
                  <TableCell align="center">{product.InStock}</TableCell>
                  <TableCell align="center">
                  <Link to="/addProducts">
                    <IconButton color="primary">
                      <Add style={{ color: "#4caf50" }} />
                    </IconButton>
                  </Link>
                  <Link to={`/editProduct/${product.Prod_Id}`}><IconButton
                    color="primary"
                  >
                    <Edit />
                  </IconButton>
                  </Link>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete([product.Prod_Id])}
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
              <Button variant="contained" color="error">
                Delete Selected
              </Button>
            </Box>
          </Collapse>
        </TableContainer>
        <ProductModal
        show={showModal}
        handleClose={handleCloseModal}
        product={selectedProduct}
        />

        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 100]}
          component="div"
          count={filteredProducts.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Box>
    </Paper>
  );
};

export default ProductTable;
