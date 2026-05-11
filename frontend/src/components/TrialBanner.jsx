import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function TrialBanner() {
  const [subscription, setSubscription] = useState(null);
  const [visible, setVisible] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      const user  = JSON.parse(localStorage.getItem("user"));

      // Only show for hosts
      if (!token || user?.role !== "host") return;

      const res = await axios.get("http://127.0.0.1:8000/api/subscription/status", {
        headers: { Authorization: `Bearer ${token}` }
        });

      setSubscription(res.data.subscription);
    } catch (err) {
      console.error("Failed to fetch subscription status", err);
    }
  };

  // Don't show for guests or if dismissed
  if (!subscription || !visible) return null;

  // Don't show if paid and active
  if (subscription.status === "active") return null;

  const daysLeft    = subscription.days_left;
  const isExpired   = subscription.status === "expired";
  const isWarning   = !isExpired && daysLeft <= 3;
  const progressPct = Math.min(100, (daysLeft / 14) * 100);

  return (
    <div style={{
      position:     "fixed",
      bottom:       "24px",
      right:        "24px",
      zIndex:       9999,
      width:        "320px",
      background:   "var(--color-background-primary, #fff)",
      border:       isExpired
                      ? "0.5px solid #E24B4A"
                      : "0.5px solid var(--color-border-tertiary)",
      borderRadius: "12px",
      padding:      "1rem 1.25rem",
      boxShadow:    "0 4px 24px rgba(0,0,0,0.10)",
    }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: 500 }}>
          {isExpired  && <span style={{ color: "#E24B4A" }}>🔒</span>}
          {isWarning  && <span style={{ color: "#EF9F27" }}>⚠️</span>}
          {!isExpired && !isWarning && <span style={{ color: "#1D9E75" }}>⏳</span>}
          {isExpired ? "Trial ended" : isWarning ? "Trial ending soon" : "Free trial"}
        </div>

        {/* Close button — only show if not expired */}
        {!isExpired && (
          <button
            onClick={() => setVisible(false)}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: "#888", padding: 0 }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Expired state */}
      {isExpired ? (
        <>
          <p style={{ fontSize: "13px", color: "#666", margin: "0 0 12px" }}>
            Subscribe to continue posting listings on Homeseek.
          </p>
          <button
            onClick={() => navigate("/subscribe")}
            style={{
              width: "100%", padding: "9px", borderRadius: "8px",
              background: "#E24B4A", color: "#fff", border: "none",
              fontWeight: 500, fontSize: "13px", cursor: "pointer"
            }}
          >
            Subscribe — ₱299/mo
          </button>
        </>
      ) : (
        <>
          {/* Days left */}
          <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "8px" }}>
            <span style={{
              fontSize: "28px", fontWeight: 500,
              color: isWarning ? "#BA7517" : "#111"
            }}>
              {daysLeft}
            </span>
            <span style={{ fontSize: "13px", color: "#888" }}>days remaining</span>
          </div>

          {/* Progress bar */}
          <div style={{
            height: "5px", background: "#eee",
            borderRadius: "99px", overflow: "hidden", marginBottom: "12px"
          }}>
            <div style={{
              height: "100%",
              width:  `${progressPct}%`,
              borderRadius: "99px",
              background: isWarning ? "#EF9F27" : "#1D9E75",
              transition: "width 0.3s"
            }} />
          </div>

          {/* Upgrade button */}
          <button
            onClick={() => navigate("/subscribe")}
            style={{
              width: "100%", padding: "9px", borderRadius: "8px",
              background: isWarning ? "#BA7517" : "#185FA5",
              color: "#fff", border: "none",
              fontWeight: 500, fontSize: "13px", cursor: "pointer"
            }}
          >
            {isWarning ? "Upgrade now before it expires" : "Upgrade to Basic — ₱299/mo"}
          </button>
        </>
      )}
    </div>
  );
}