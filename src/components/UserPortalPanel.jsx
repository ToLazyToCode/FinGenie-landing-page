import { useEffect, useMemo, useState } from "react";

const ratingOptions = [1, 2, 3, 4, 5];

export default function UserPortalPanel({
  open,
  loading,
  profile,
  entitlements,
  plans,
  review,
  checkoutLoadingPlanCode,
  savingReview,
  onClose,
  onRefresh,
  onStartCheckout,
  onSaveReview,
  onLogout,
}) {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (!review) {
      setRating(5);
      setTitle("");
      setComment("");
      return;
    }
    setRating(review.rating ?? 5);
    setTitle(review.title ?? "");
    setComment(review.comment ?? "");
  }, [review]);

  const formattedPlan = useMemo(() => entitlements?.billingPlan || entitlements?.planTier || "FREE", [entitlements]);

  if (!open) {
    return null;
  }

  const handleSaveReview = async (event) => {
    event.preventDefault();
    if (!comment.trim()) {
      return;
    }
    await onSaveReview({
      rating,
      title: title.trim(),
      comment: comment.trim(),
      hasExistingReview: Boolean(review?.id),
    });
  };

  return (
    <div className="portal-overlay" onClick={onClose}>
      <aside className="portal-panel" onClick={(event) => event.stopPropagation()}>
        <div className="portal-header">
          <div>
            <h3>My FinGenie Portal</h3>
            <p>Light account view from the landing page.</p>
          </div>
          <div className="portal-header-actions">
            <button className="btn btn-secondary" onClick={onRefresh} type="button">
              Refresh
            </button>
            <button className="auth-close-btn" onClick={onClose} type="button" aria-label="Close portal">
              x
            </button>
          </div>
        </div>

        {loading ? (
          <div className="portal-loading">Loading your account data...</div>
        ) : (
          <div className="portal-content">
            <section className="portal-section glass-card">
              <h4>Profile</h4>
              <p><strong>Name:</strong> {profile?.fullName || "N/A"}</p>
              <p><strong>Email:</strong> {profile?.email || "N/A"}</p>
              <p><strong>Plan:</strong> {formattedPlan}</p>
            </section>

            <section className="portal-section glass-card">
              <h4>Available Plans</h4>
              <div className="portal-plans">
                {(plans || []).map((plan) => (
                  <article key={plan.planCode} className="portal-plan-item">
                    <div>
                      <h5>{plan.title}</h5>
                      <p>{plan.description || "Premium access"}</p>
                      <span>{plan.durationDays} days</span>
                    </div>
                    <div className="portal-plan-actions">
                      <strong>{Number(plan.amount || 0).toLocaleString("vi-VN")} VND</strong>
                      <button
                        className="btn btn-gold"
                        onClick={() => onStartCheckout(plan.planCode)}
                        disabled={checkoutLoadingPlanCode === plan.planCode}
                        type="button"
                      >
                        {checkoutLoadingPlanCode === plan.planCode ? "Opening..." : "Buy with PayOS"}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="portal-section glass-card">
              <h4>{review?.id ? "Edit Your Review" : "Write a Review"}</h4>
              {review?.status ? (
                <p className="portal-review-status">Status: {review.status}</p>
              ) : null}
              <form className="portal-review-form" onSubmit={handleSaveReview}>
                <div className="portal-rating-row">
                  {ratingOptions.map((value) => (
                    <button
                      key={value}
                      type="button"
                      className={`portal-rating-btn ${rating === value ? "active" : ""}`}
                      onClick={() => setRating(value)}
                    >
                      {value}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  maxLength={120}
                  placeholder="Short title (optional)"
                />
                <textarea
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  maxLength={2000}
                  placeholder="Share your FinGenie experience..."
                  rows={4}
                  required
                />
                <button className="btn btn-primary" type="submit" disabled={savingReview}>
                  {savingReview ? "Saving..." : review?.id ? "Update Review" : "Submit Review"}
                </button>
              </form>
            </section>
          </div>
        )}

        <div className="portal-footer">
          <button className="btn btn-secondary" type="button" onClick={onLogout}>
            Sign out
          </button>
        </div>
      </aside>
    </div>
  );
}


