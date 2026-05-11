import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const plans = {
  basic: {
    name:     "Basic",
    price:    299,
    features: ["Up to 5 listings", "Basic analytics", "Email support"],
  },
  pro: {
    name:     "Pro",
    price:    599,
    features: ["Unlimited listings", "Advanced analytics", "Priority support"],
  },
};

export default function SubscriptionModal({ onLogout }) {
  const [selected, setSelected] = useState("basic");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const navigate                = useNavigate();
  const plan                    = plans[selected];

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://127.0.0.1:8000/api/logout",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      // silent
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("subscription");
      window.location.href = "/register";
    }
  };

  const handlePay = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      const res   = await axios.post(
        "http://127.0.0.1:8000/api/subscription/pay",
        { plan: selected },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      window.location.href = res.data.payment_url;

    } catch (err) {
      setError("Failed to create payment. Please try again.");
      setLoading(false);
    }
  };

  return (
    // Overlay
    <div style={{
      position:        "fixed",
      inset:           0,
      background:      "rgba(0,0,0,0.55)",
      zIndex:          99999,
      display:         "flex",
      alignItems:      "center",
      justifyContent:  "center",
      padding:         "1rem",
    }}>
      {/* Modal */}
      <div style={{
        background:   "#fff",
        borderRadius: "16px",
        padding:      "1.75rem",
        width:        "100%",
        maxWidth:     "480px",
      }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
            <div style={{
              width: "44px", height: "44px", borderRadius: "50%",
              background: "#FCEBEB", display: "flex",
              alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              🔒
            </div>
            <div>
              <p style={{ fontSize: "18px", fontWeight: 500, margin: "0 0 4px" }}>
                Your free trial has ended
              </p>
              <p style={{ fontSize: "13px", color: "#888", margin: 0 }}>
                Subscribe to keep using Homeseek as a host.
              </p>
            </div>
          </div>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            style={{
              background:   "none",
              border:       "0.5px solid #ddd",
              borderRadius: "8px",
              padding:      "4px 10px",
              cursor:       "pointer",
              fontSize:     "12px",
              color:        "#888",
              display:      "flex",
              alignItems:   "center",
              gap:          "4px",
              flexShrink:   0,
            }}
          >
            ✕ Logout
          </button>
        </div>

        {/* Warning bar */}
        <div style={{
          background:   "#FCEBEB",
          borderRadius: "8px",
          padding:      "10px 12px",
          fontSize:     "12px",
          color:        "#A32D2D",
          marginBottom: "1.25rem",
          display:      "flex",
          alignItems:   "center",
          gap:          "8px",
        }}>
          ⚠️ Closing this will log you out. You must subscribe to continue.
        </div>

        {/* Plan cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "1.25rem" }}>
          {Object.entries(plans).map(([key, p]) => (
            <div
              key={key}
              onClick={() => setSelected(key)}
              style={{
                border:       selected === key ? "2px solid #185FA5" : "0.5px solid #ddd",
                borderRadius: "10px",
                padding:      "1rem",
                cursor:       "pointer",
              }}
            >
              <div style={{
                display:      "inline-block",
                fontSize:     "11px",
                padding:      "2px 8px",
                borderRadius: "99px",
                marginBottom: "8px",
                fontWeight:   500,
                background:   key === "pro" ? "#E1F5EE" : "#E6F1FB",
                color:        key === "pro" ? "#0F6E56" : "#185FA5",
              }}>
                {key === "pro" ? "Most popular" : "Basic"}
              </div>

              <div style={{ fontSize: "14px", fontWeight: 500, marginBottom: "2px" }}>
                {p.name}
              </div>

              <div style={{ fontSize: "22px", fontWeight: 500, marginBottom: "8px" }}>
                ₱{p.price}
                <span style={{ fontSize: "12px", fontWeight: 400, color: "#888" }}>/mo</span>
              </div>

              {p.features.map((f, i) => (
                <div key={i} style={{ fontSize: "11px", color: "#666", margin: "3px 0", display: "flex", gap: "5px" }}>
                  <span style={{ color: "#1D9E75" }}>✓</span> {f}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <p style={{ color: "#E24B4A", fontSize: "13px", marginBottom: "10px" }}>
            {error}
          </p>
        )}

        {/* Pay button */}
        <button
          onClick={handlePay}
          disabled={loading}
          style={{
            width:        "100%",
            padding:      "11px",
            borderRadius: "8px",
            background:   loading ? "#aaa" : "#185FA5",
            color:        "#fff",
            border:       "none",
            fontSize:     "14px",
            fontWeight:   500,
            cursor:       loading ? "not-allowed" : "pointer",
            marginBottom: "8px",
          }}
        >
          {loading ? "Redirecting..." : `Continue to payment — ₱${plan.price}/mo`}
        </button>

        <p style={{ textAlign: "center", fontSize: "12px", color: "#aaa" }}>
          🔒 Secured by PayMongo · Cancel anytime
        </p>
      </div>
    </div>
  );
}