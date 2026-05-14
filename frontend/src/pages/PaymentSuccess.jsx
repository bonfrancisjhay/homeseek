import { useEffect, useState } from "react";
import axios from "axios";

export default function PaymentSuccess() {
  const [checking, setChecking] = useState(false);
  const [message, setMessage]   = useState(null);

  const handleConfirm = async () => {
    setChecking(true);
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "http://127.0.0.1:8000/api/subscription/status",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const sub = res.data.subscription;

      localStorage.setItem("subscription", JSON.stringify(sub));

      if (sub?.status === "active") {
        // Payment confirmed — go to dashboard
        window.location.href = "/host/dashboard";
      } else {
        // Webhook hasn't fired yet
        setMessage("Payment not confirmed yet. Please wait a moment and try again.");
        setChecking(false);
      }

    } catch (err) {
      console.error(err);
      setChecking(false);
    }
  };

  // Auto check every 3 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const token = localStorage.getItem("token");
        const res   = await axios.get(
          "http://127.0.0.1:8000/api/subscription/status",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const sub = res.data.subscription;
        localStorage.setItem("subscription", JSON.stringify(sub));

        if (sub?.status === "active") {
          clearInterval(interval);
          window.location.href = "/host/dashboard";
        }
      } catch (err) {
        console.error(err);
      }
    }, 3000); // check every 3 seconds

    return () => clearInterval(interval);
  }, []);

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
        width:          "70px",
        height:         "70px",
        borderRadius:   "50%",
        background:     "#E1F5EE",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        fontSize:       "32px",
        marginBottom:   "1.25rem",
      }}>
        ✅
      </div>

      <h1 style={{ fontSize: "22px", fontWeight: 500, marginBottom: "8px" }}>
        Payment Successful!
      </h1>
      <p style={{ fontSize: "14px", color: "#888", marginBottom: "1.5rem" }}>
        Please wait while we confirm your payment...
      </p>

      {message && (
        <p style={{ fontSize: "13px", color: "#E24B4A", marginBottom: "1rem" }}>
          {message}
        </p>
      )}

      <p style={{ fontSize: "13px", color: "#aaa", marginBottom: "1.5rem" }}>
        Checking payment status automatically...
      </p>

      {/* Manual confirm button as fallback */}
      <button
        onClick={handleConfirm}
        disabled={checking}
        style={{
          padding:      "10px 24px",
          borderRadius: "8px",
          background:   checking ? "#aaa" : "#185FA5",
          color:        "#fff",
          border:       "none",
          fontSize:     "14px",
          fontWeight:   500,
          cursor:       checking ? "not-allowed" : "pointer",
        }}
      >
        {checking ? "Checking..." : "Go to Dashboard"}
      </button>
    </div>
  );
}