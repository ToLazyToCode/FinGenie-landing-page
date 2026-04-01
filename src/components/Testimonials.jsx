import { useEffect, useMemo, useRef } from "react";
import gsap from "gsap";

const fallbackTestimonials = [
  {
    rating: 5,
    comment:
      "FinGenie's AI advisor helped me trim spending and finally build a stable monthly savings habit.",
    displayNameSnapshot: "Sarah M.",
    role: "Entrepreneur",
  },
  {
    rating: 5,
    comment:
      "The gamified experience keeps me consistent. I stayed on track for six straight months.",
    displayNameSnapshot: "James K.",
    role: "Software Developer",
  },
  {
    rating: 5,
    comment:
      "The product feels friendly but serious enough for real planning. It is now part of my daily routine.",
    displayNameSnapshot: "Emily R.",
    role: "Teacher",
  },
];

const avatarColors = ["purple", "gold", "emerald"];

const toInitials = (value) => {
  if (!value) {
    return "FG";
  }
  const parts = value.split(" ").filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
};

export default function Testimonials({ active, reviews = [] }) {
  const ref = useRef(null);

  const cards = useMemo(() => {
    const source = reviews.length > 0 ? reviews : fallbackTestimonials;
    return source.slice(0, 6).map((item, index) => ({
      ...item,
      role: item.role || "FinGenie User",
      color: avatarColors[index % avatarColors.length],
      initials: toInitials(item.displayNameSnapshot),
      rating: Math.max(1, Math.min(5, Number(item.rating || 5))),
    }));
  }, [reviews]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(".testimonials .section-label", { opacity: 0, y: 20 });
      gsap.set(".testimonials .section-title", { opacity: 0, y: 30 });
      gsap.set(".testimonials .section-subtitle", { opacity: 0, y: 20 });
      gsap.set(".testimonial-card", { opacity: 0, y: 40, scale: 0.96 });
    }, ref);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!active) {
      return;
    }
    const ctx = gsap.context(() => {
      const timeline = gsap.timeline();
      timeline
        .to(".testimonials .section-label", { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" })
        .to(".testimonials .section-title", { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, "-=0.3")
        .to(".testimonials .section-subtitle", { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, "-=0.3")
        .to(
          ".testimonial-card",
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            stagger: 0.12,
            ease: "power3.out",
          },
          "-=0.2"
        );
    }, ref);
    return () => ctx.revert();
  }, [active, cards.length]);

  return (
    <div className="testimonials" ref={ref}>
      <span className="section-label">Testimonials</span>
      <h2 className="section-title">
        Trusted by <span className="gradient-text-emerald">FinGenie Users</span>
      </h2>
      <p className="section-subtitle">Approved product reviews from our community.</p>

      <div className="testimonial-grid">
        {cards.map((testimonial, index) => (
          <div key={`${testimonial.displayNameSnapshot}-${index}`} className="glass-card testimonial-card">
            <div className="testimonial-stars">
              {Array.from({ length: testimonial.rating }).map((_, starIndex) => (
                <span key={starIndex} className="testimonial-star">
                  *
                </span>
              ))}
            </div>
            <p className="testimonial-quote">"{testimonial.comment}"</p>
            <div className="testimonial-author">
              <div className={`testimonial-avatar ${testimonial.color}`}>{testimonial.initials}</div>
              <div>
                <div className="testimonial-name">{testimonial.displayNameSnapshot || "FinGenie User"}</div>
                <div className="testimonial-role">{testimonial.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

