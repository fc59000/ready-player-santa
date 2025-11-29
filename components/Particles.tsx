"use client";

import { useEffect } from "react";

export default function Particles() {
  useEffect(() => {
    const container = document.getElementById("particles-container");
    if (!container) return;

    const particleCount = 18;

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement("div");
      particle.className = "particle";
      particle.style.left = Math.random() * 100 + "%";
      particle.style.animationDelay = Math.random() * 20 + "s";
      particle.style.animationDuration = 15 + Math.random() * 10 + "s";
      container.appendChild(particle);
    }

    // Effet interactif au survol
    const handleMouseMove = (e: MouseEvent) => {
      const particles = container.querySelectorAll(".particle");
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      particles.forEach((particle) => {
        const rect = particle.getBoundingClientRect();
        const particleX = rect.left + rect.width / 2;
        const particleY = rect.top + rect.height / 2;

        const distance = Math.sqrt(
          Math.pow(mouseX - particleX, 2) + Math.pow(mouseY - particleY, 2)
        );

        if (distance < 120) {
          const opacity = 1 - distance / 120;
          (particle as HTMLElement).style.opacity = String(opacity * 0.9);
        }
      });
    };

    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      container.innerHTML = "";
    };
  }, []);

  return <div id="particles-container" className="particles-container" />;
}