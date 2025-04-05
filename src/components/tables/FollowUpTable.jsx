import React, { useContext, useEffect, useState } from "react";
import { UserContext, useUser } from "../../context/UserContext";
import api from "../../pages/Axios";
import '../customstyles.css';

const FollowUpTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState([]);
  const { user } = useUser();

  useEffect(() => {
    const fetchFollowups = async () => {
      try {
        if (!user?.orgId || isNaN(user?.orgId)) {
          throw new Error("Invalid Org_Id");
        }
  
        const response = await api.get(`/viewFollowupDates/${user?.orgId}`);
        setData(response.data);
  
        const reminders = response.data
          .filter((row) => row.Followup_Status === "Follow-Up" || row.Followup_Status === "Pending")
          .map((row) => ({
            name: row.Name,
            date: new Date(row.Next_Followup_Date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            }),
            status: row.Followup_Status,
          }));
  
        if (reminders.length > 0) {
          setModalContent(reminders);
  
          if (!localStorage.getItem("modalShown")) {
            setModalVisible(true);
            localStorage.setItem("modalShown", "true");
          }
        }
      } catch (error) {
        console.error("Error fetching follow-up data:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchFollowups();
  }, [user?.orgId]);

  const closeModal = () => {
    setModalVisible(false);
  };

  if (loading) {
    return <p>Loading...</p>; // Replace with a spinner or shimmer if needed
  }

  return (
    <div>
      {/* Reminder Modal */}
      {modalVisible && (
        <div className="modal-overlay1">
          <div className="modal-content1">
            <h4>Reminder</h4>
            <p>
              The following users have Follow-Up or Pending statuses:
            </p>
            <ul>
              {modalContent.map((reminder, index) => (
                <li key={index}>
                  <strong>{reminder.name}</strong> - 
                  <span>{reminder.date}</span> - 
                  <span className={reminder.status === "Pending" ? "text-danger" : "text-warning"}>
                    {reminder.status}
                  </span>
                </li>
              ))}
            </ul>
            <button onClick={closeModal} className="btn1">
              Close
            </button>
          </div>
        </div>
      )}

      {/* Follow-Up Table */}
      <div className="table-responsive table-purchases">
        <table className="table table-striped margin-bottom-10">
          <thead>
            <tr>
              <th className="text-center">Name</th>
              <th className="text-center">Next Follow-Up Date</th>
              <th className="text-center">Remarks</th>
              <th className="text-center">Follow-Up Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index}>
                <td className="text-center">{row.Name}</td>
                <td className="text-center">
                  {new Date(row.Next_Followup_Date).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    }
                  )}
                </td>
                <td className="text-center">
                  {row.Followup_Status === "Pending"
                    ? "No Remarks for Pending status"
                    : row.Remarks}
                </td>
                <td
                  className={
                    row.Followup_Status === "Pending"
                      ? "text-danger text-center"
                      : "text-warning text-center"
                  }
                >
                  {row.Followup_Status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FollowUpTable;
