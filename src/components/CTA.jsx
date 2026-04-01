import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function CTA({ active, isAuthenticated = false, onPrimaryAction, onSecondaryAction }) {
  const ref = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(".cta", { opacity: 0, scale: 0.96 });
    }, ref);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!active) {
      return;
    }
    const ctx = gsap.context(() => {
      gsap.to(".cta", {
        opacity: 1,
        scale: 1,
        duration: 0.8,
        ease: "power3.out",
      });
    }, ref);
    return () => ctx.revert();
  }, [active]);

  return (
    <div className="cta-wrapper" ref={ref}>
      <div className="cta">
        <h2 className="cta-title">
          Ready to Transform <span className="gradient-text">Your Finances</span>?
        </h2>
        <p className="cta-subtitle">
          Join over 100,000 users who turned their financial wishes into reality. Start your
          journey today.
        </p>
        <div className="cta-buttons">
          <button className="btn btn-gold" onClick={onPrimaryAction} type="button">
            {isAuthenticated ? "Open My Portal" : "Sign In to Start"}
          </button>
          <button className="btn btn-secondary" onClick={onSecondaryAction} type="button">
            Back to Features
          </button>
        </div>
        <p className="cta-note">PayOS is used for all new premium purchases.</p>
      </div>
    </div>
  );
}

