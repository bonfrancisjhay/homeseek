import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function PaymentSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    updateSubscription();
  }, []);

  const updateSubscription = async () => {
    try {
      const token = localStorage.getItem("token");

      // Get fresh subscription status from backend
      const res = await axios.get(
        "http://127.0.0.1:8000/api/subscription/status",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Save updated subscription to localStorage
      localStorage.setItem(
        "subscription",
        JSON.stringify(res.data.subscription)
      );

      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        navigate("/host/dashboard");
      }, 3000);

    } catch (err) {
      console.error(err);
      navigate("/host/dashboard");
    }
  };

  return (
    <div style={{
      display:        "flex",
      flexDirection:  "column",
      alignItems:     "center",
      justifyContent: "center",
      minHeight:      "80vh",
      textAlign:      "center",
      padding:        "2rem",
    }}>
      <div style={{
        width:        "70px",
        height:       "70px",
        borderRadius: "50%",
        background:   "#E1F5EE",
        display:      "flex",
        alignItems:   "center",
        justifyContent: "center",
        fontSize:     "32px",
        marginBottom: "1.25rem",
      }}>
        ✅
      </div>

      <h1 style={{ fontSize: "22px", fontWeight: 500, marginBottom: "8px" }}>
        Payment Successful!
      </h1>
      <p style={{ fontSize: "14px", color: "#888", marginBottom: "1.5rem" }}>
        Welcome to Homeseek! You now have full access to post listings.
      </p>
      <p style={{ fontSize: "13px", color: "#aaa" }}>
        Redirecting you to dashboard...
      </p>
    </div>
  );
}