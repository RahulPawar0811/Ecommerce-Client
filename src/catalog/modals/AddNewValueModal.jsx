import React, { useContext, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap"; // Ensure you have 'react-bootstrap' installed
import api from "../../pages/Axios"; // Adjust the path to your API setup
import { UserContext, useUser } from '../../context/UserContext';
import Swal from 'sweetalert2'; // Import Swal
import useFullPageLoader from '../../components/useFullPageLoader'

const AddNewValueModal = ({ show, handleClose, handleAddValue, srNo, variantType }) => {
  const [newValue, setNewValue] = useState("");
  const { user } = useUser();
  const [ loader ,showLoader,hideLoader] = useFullPageLoader();

  const handleValueChange = (e) => {
    setNewValue(e.target.value);
  };

  const handleSubmit = async () => {
    showLoader();
    if (!srNo) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'No Sr_No selected! Please select a variant first.',
      });
      return;
    }

    if (!newValue) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Please enter a value.',
      });
      return;
    }

    try {
      const response = await api.post(`/addVariantValue`, {
        VariantTypeId: srNo, // Assuming srNo is the VariantTypeId
        VariantTypeName: variantType,
        VariantValue: newValue,
        Org_Id: user?.orgId, // Assuming user.orgId contains the Org Id
        Admin_Id: user?.userId, // Assuming user.userId contains the Admin Id
        AddedBy: `${user?.fname || "admin"} ${user?.lname}`, // AddedBy is usually the Admin who is making the change
      });

      console.log("Variant value updated:", response.data);

      // Show success alert
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Variant value updated successfully.',
      });

      // Optionally update the state of the parent component
      handleAddValue(response.data); // Pass the response or just `newValue` if appropriate

      setNewValue(""); // Clear the input field
      handleClose(); // Close the modal
    } catch (error) {
      console.error("Error updating variant value:", error);

      // Show error alert
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'There was an error updating the variant value. Please try again.',
      });
    } finally{
      hideLoader();
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header >
        <Modal.Title>Update Variant Value for {variantType}</Modal.Title>
          {/* Custom Cross Button */}
          <button
  type="button"
  className="btn-close"
  aria-label="Close"
  onClick={handleClose}
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
        <Form>
          <Form.Group controlId="formVariantValue">
            <Form.Label>Variant Value</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter new variant value"
              value={newValue}
              onChange={handleValueChange}
            />
          </Form.Group>
        </Form>
        {loader}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddNewValueModal;
