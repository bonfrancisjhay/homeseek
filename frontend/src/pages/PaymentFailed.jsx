import { useNavigate } from "react-router-dom";

export default function PaymentFailed() {
  const navigate = useNavigate();

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
        background:     "#FCEBEB",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        fontSize:       "32px",
        marginBottom:   "1.25rem",
      }}>
        ❌
      </div>

      <h1 style={{ fontSize: "22px", fontWeight: 500, marginBottom: "8px" }}>
        Payment Failed
      </h1>
      <p style={{ fontSize: "14px", color: "#888", marginBottom: "1.5rem" }}>
        Something went wrong with your payment. Please try again.
      </p>

      <button
        onClick={() => navigate("/subscribe")}
        style={{
          padding:      "10px 24px",
          borderRadius: "8px",
          background:   "#185FA5",
          color:        "#fff",
          border:       "none",
          fontSize:     "14px",
          fontWeight:   500,
          cursor:       "pointer",
        }}
      >
        Try Again
      </button>
    </div>
  );
}