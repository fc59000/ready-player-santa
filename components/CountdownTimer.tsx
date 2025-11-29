"use client";

import { useState, useEffect } from "react";

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const targetDate = new Date("2025-12-11T11:30:00").getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="countdown-container">
      <div className="countdown-panel">
        <div className="hud-title" style={{ textAlign: "center", marginBottom: "var(--spacing-md)" }}>
          LANCEMENT DANS :
        </div>
        <div className="countdown-grid">
          <div className="countdown-unit">
            <span className="countdown-number">{String(timeLeft.days).padStart(2, "0")}</span>
            <span className="countdown-label">JOURS</span>
          </div>
          <div className="countdown-unit">
            <span className="countdown-number">{String(timeLeft.hours).padStart(2, "0")}</span>
            <span className="countdown-label">HEURES</span>
          </div>
          <div className="countdown-unit">
            <span className="countdown-number">{String(timeLeft.minutes).padStart(2, "0")}</span>
            <span className="countdown-label">MINUTES</span>
          </div>
          <div className="countdown-unit">
            <span className="countdown-number">{String(timeLeft.seconds).padStart(2, "0")}</span>
            <span className="countdown-label">SECONDES</span>
          </div>
        </div>
        <div style={{ 
          marginTop: "var(--spacing-md)", 
          textAlign: "center",
          fontFamily: "var(--mono)",
          fontSize: "0.72rem",
          letterSpacing: "0.18em",
          color: "var(--muted-dark)"
        }}>
          Démarrage : <span style={{ color: "var(--primary)", fontWeight: 600 }}>11.12.25 à 11:30</span>
        </div>
      </div>
    </div>
  );
}
