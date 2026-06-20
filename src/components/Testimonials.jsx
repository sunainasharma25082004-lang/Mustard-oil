import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/testimonials.css";
import { useAuth } from "../context/AuthContext";
import { reviewApi } from "../utils/api";
import { useLiveData } from "../hooks/useLiveData";
import { sanitizeReviewInput, sanitizeReviewField } from "../utils/sanitizeReview";

const faqs = [
  {
    question: "What does 'single pressed' mean?",
    answer:
      "Mustard seeds are pressed only once at low temperatures to preserve nutrients and aroma."
  },
  {
    question: "Is the oil safe for cooking at high heat?",
    answer:
      "Yes, it is suitable for everyday cooking including frying and tadka."
  },
  {
    question: "How is it different from supermarket mustard oil?",
    answer:
      "It is Cold Pressed & Single Pressed Mustard Oil, free from chemical refining, bleaching and deodorizing."
  },
  {
    question: "How long does it keep?",
    answer:
      "Store in a cool dry place and it remains fresh for months."
  },
  {
    question: "Do you deliver pan-India?",
    answer:
      "Yes, delivery is available across India."
  }
];

export default function Testimonials() {
  const [open, setOpen] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [newReview, setNewReview] = useState({
    name: user?.name || "",
    location: "",
    rating: 5,
    text: ""
  });
  const [submitMessage, setSubmitMessage] = useState("");
  const [error, setError] = useState("");

  const loadReviews = useCallback(() => {
    setLoading(true);
    reviewApi
      .getAll()
      .then((res) => setReviews(res.data || []))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, []);

  useLiveData(loadReviews);

  // Update name if user logs in while form is open
  useEffect(() => {
    if (user?.name && !newReview.name) {
      setNewReview((prev) => ({ ...prev, name: user.name }));
    }
  }, [user]);

  const handleStarClick = (rating) => {
    setNewReview((prev) => ({ ...prev, rating }));
  };

  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setNewReview((prev) => ({ ...prev, [name]: value }));
  };

  const openCreateModal = () => {
    if (!user) {
      navigate("/signin", { state: { from: "/#reviews" } });
      return;
    }
    setEditingReview(null);
    setNewReview({ name: user?.name || "", location: "", rating: 5, text: "" });
    setError("");
    setSubmitMessage("");
    setShowModal(true);
  };

  const openEditModal = (review) => {
    setEditingReview(review);
    setNewReview({
      name: review.name,
      location: review.location || "",
      rating: review.rating || 5,
      text: review.text
    });
    setError("");
    setSubmitMessage("");
    setShowModal(true);
  };

  const submitReview = async (e) => {
    e.preventDefault();
    setError("");

    const sanitized = sanitizeReviewInput(newReview.text);
    if (!sanitized.valid) {
      setError(sanitized.message);
      return;
    }

    const nameResult = sanitizeReviewField(newReview.name, 100, user?.name || "Anonymous Customer");
    if (!nameResult.valid) {
      setError(nameResult.message);
      return;
    }

    const locationResult = sanitizeReviewField(newReview.location, 80, "India");
    if (!locationResult.valid) {
      setError(locationResult.message);
      return;
    }

    const payload = {
      name: nameResult.value,
      location: locationResult.value,
      rating: newReview.rating,
      text: sanitized.value,
    };

    try {
      if (editingReview) {
        const res = await reviewApi.update(editingReview._id, payload);
        setSubmitMessage(res.message || "Review updated successfully!");
      } else {
        const res = await reviewApi.create(payload);
        setSubmitMessage(res.message || "Thank you! Your review has been submitted.");
      }
      setNewReview({ name: user?.name || "", location: "", rating: 5, text: "" });
      setShowModal(false);
      setEditingReview(null);
      loadReviews();
      setTimeout(() => setSubmitMessage(""), 4000);
    } catch (err) {
      setError(err.message || "Failed to save review");
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      await reviewApi.delete(reviewId);
      setSubmitMessage("Review deleted.");
      loadReviews();
      setTimeout(() => setSubmitMessage(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to delete review");
    }
  };

  const renderStars = (rating, interactive = false) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        onClick={interactive ? () => handleStarClick(i + 1) : undefined}
        style={{
          cursor: interactive ? "pointer" : "default",
          color: i < rating ? "#d4af37" : "#555",
          fontSize: interactive ? "28px" : "18px",
          marginRight: "2px",
          transition: "color 0.2s"
        }}
      >
        ★
      </span>
    ));
  };

  return (
    <>
      {/* COMPARISON */}

      <section className="comparison-section">
        <div className="container">
          <span className="small-heading">
            PURE VS REFINED
          </span>

          <h2>Karyor Mustard Oil vs Refined Oil</h2>

          <div className="comparison-table">
            <div className="table-head">
              <div>Parameter</div>
              <div>Karyor</div>
              <div>Refined Oil</div>
            </div>

            {[
              [
                "Pressing Method",
                "Single cold press",
                "Multiple presses + solvent"
              ],
              [
                "Refining",
                "None",
                "Bleached & deodorised"
              ],
              [
                "Omega-3 Content",
                "✓ Fully intact",
                "✗ Mostly destroyed"
              ],
              [
                "Natural Pungency",
                "✓ Full spectrum",
                "✗ Removed"
              ],
              [
                "Hexane Solvent",
                "✗ Never used",
                "✓ Often used"
              ],
              [
                "Colour",
                "Natural golden amber",
                "Artificially lightened"
              ],
              [
                "Shelf Life Enhancers",
                "Natural antioxidants",
                "Chemical preservatives"
              ]
            ].map((row, i) => (
              <div className="table-row" key={i}>
                <div>{row[0]}</div>
                <div>{row[1]}</div>
                <div>{row[2]}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}

      <section id="reviews" className="testimonial-section">
        <div className="container">
          <span className="small-heading">
            REAL KITCHENS, REAL OPINIONS
          </span>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
            <h2>What Our Customers Say</h2>
            <button
              onClick={openCreateModal}
              className="golden-btn"
              style={{ fontSize: "0.9rem", padding: "10px 20px" }}
            >
              ✍️ Write a Review
            </button>
          </div>

          {error && !showModal && (
            <div style={{
              background: "rgba(255,80,80,0.12)",
              color: "#ff8a8a",
              padding: "12px 20px",
              borderRadius: "10px",
              margin: "16px 0",
              textAlign: "center",
              fontWeight: 600
            }}>
              {error}
            </div>
          )}

          {submitMessage && (
            <div style={{
              background: "rgba(212,175,55,0.15)",
              color: "#d4af37",
              padding: "12px 20px",
              borderRadius: "10px",
              margin: "16px 0",
              textAlign: "center",
              fontWeight: 600
            }}>
              {submitMessage}
            </div>
          )}

          {loading && (
            <p style={{ color: "#aaa", textAlign: "center", padding: "20px 0" }}>Loading reviews...</p>
          )}

          {!loading && (
          <div className="testimonial-grid">
            {reviews.map((item) => (
              <div className="testimonial-card" key={item._id}>
                <div className="stars">{renderStars(item.rating || 5)}</div>

                <p>{item.text}</p>

                <h4>{item.name}</h4>
                <span>{item.location}</span>

                {item.status === "pending" && (
                  <span style={{
                    display: "inline-block",
                    marginTop: "8px",
                    fontSize: "0.75rem",
                    color: "#f5d76e",
                    border: "1px solid rgba(212,175,55,0.35)",
                    borderRadius: "999px",
                    padding: "3px 10px"
                  }}>
                    Pending admin approval
                  </span>
                )}

                {item.isOwner && (
                  <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                    <button type="button" onClick={() => openEditModal(item)} style={{ background: "transparent", border: "1px solid rgba(212,175,55,0.35)", color: "#d4af37", padding: "5px 12px", borderRadius: "8px", fontSize: "0.8rem", cursor: "pointer" }}>Edit</button>
                    <button type="button" onClick={() => handleDelete(item._id)} style={{ background: "transparent", border: "1px solid rgba(255,100,100,0.35)", color: "#ff8a8a", padding: "5px 12px", borderRadius: "8px", fontSize: "0.8rem", cursor: "pointer" }}>Delete</button>
                  </div>
                )}
              </div>
            ))}
          </div>
          )}

          {/* REVIEW POPUP / MODAL */}
          {showModal && (
            <div
              onClick={() => setShowModal(false)}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0, 0, 0, 0.75)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 2000,
                padding: "20px"
              }}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: "linear-gradient(180deg, #1a1a1a, #101010)",
                  border: "1px solid rgba(212,175,55,0.3)",
                  borderRadius: "20px",
                  width: "100%",
                  maxWidth: "520px",
                  maxHeight: "90vh",
                  overflowY: "auto",
                  boxShadow: "0 25px 60px rgba(0,0,0,0.6)"
                }}
              >
                {/* Modal Header */}
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "20px 24px",
                  borderBottom: "1px solid rgba(212,175,55,0.15)"
                }}>
                  <div>
                    <h3 style={{ color: "#d4af37", margin: 0, fontSize: "1.35rem" }}>
                      {editingReview ? "Edit Review" : "Write a Review"}
                    </h3>
                    <p style={{ color: "#888", fontSize: "0.85rem", margin: "4px 0 0" }}>
                      Share your experience with Karyor
                    </p>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#888",
                      fontSize: "28px",
                      cursor: "pointer",
                      lineHeight: 1,
                      padding: "0 8px"
                    }}
                  >
                    ×
                  </button>
                </div>

                {/* Modal Body */}
                <div style={{ padding: "24px" }}>
                  {error && (
                    <div style={{
                      background: "rgba(255,80,80,0.12)",
                      color: "#ff8a8a",
                      padding: "12px 16px",
                      borderRadius: "10px",
                      marginBottom: "20px",
                      textAlign: "center",
                      fontWeight: 600
                    }}>
                      {error}
                    </div>
                  )}

                  {submitMessage && (
                    <div style={{
                      background: "rgba(212,175,55,0.15)",
                      color: "#d4af37",
                      padding: "12px 16px",
                      borderRadius: "10px",
                      marginBottom: "20px",
                      textAlign: "center",
                      fontWeight: 600
                    }}>
                      {submitMessage}
                    </div>
                  )}

                  <form onSubmit={submitReview}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "18px" }}>
                      <div>
                        <label style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", color: "#aaa" }}>Your Name</label>
                        <input
                          type="text"
                          name="name"
                          value={newReview.name}
                          onChange={handleReviewChange}
                          placeholder="Your name"
                          style={{
                            width: "100%",
                            padding: "11px 14px",
                            background: "#111",
                            border: "1px solid rgba(212,175,55,0.25)",
                            borderRadius: "10px",
                            color: "#fff",
                            fontSize: "1rem"
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", color: "#aaa" }}>City / Location</label>
                        <input
                          type="text"
                          name="location"
                          value={newReview.location}
                          onChange={handleReviewChange}
                          placeholder="e.g. Mumbai"
                          style={{
                            width: "100%",
                            padding: "11px 14px",
                            background: "#111",
                            border: "1px solid rgba(212,175,55,0.25)",
                            borderRadius: "10px",
                            color: "#fff",
                            fontSize: "1rem"
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ marginBottom: "18px" }}>
                      <label style={{ display: "block", marginBottom: "8px", fontSize: "0.85rem", color: "#aaa" }}>Your Rating</label>
                      <div style={{ display: "flex", gap: "4px" }}>
                        {renderStars(newReview.rating, true)}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#888", marginTop: "4px" }}>Click to rate (1-5)</div>
                    </div>

                    <div style={{ marginBottom: "22px" }}>
                      <label style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", color: "#aaa" }}>Your Review</label>
                      <textarea
                        name="text"
                        value={newReview.text}
                        onChange={handleReviewChange}
                        placeholder="Tell us about the taste, aroma, or how you use the oil..."
                        rows={4}
                        required
                        style={{
                          width: "100%",
                          padding: "14px",
                          background: "#111",
                          border: "1px solid rgba(212,175,55,0.25)",
                          borderRadius: "12px",
                          color: "#fff",
                          fontSize: "1rem",
                          resize: "vertical",
                          minHeight: "110px"
                        }}
                      />
                      <p style={{ fontSize: "0.75rem", color: "#666", marginTop: "6px", marginBottom: 0 }}>
                        No URLs, links, HTML, or promotional content allowed.
                      </p>
                    </div>

                    <button
                      type="submit"
                      className="golden-btn"
                      style={{ width: "100%", padding: "14px", fontSize: "1.05rem", marginBottom: "12px" }}
                    >
                      {editingReview ? "Update Review" : "Submit Review"}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* FAQ */}

      <section className="faq-section">
        <div className="container">
          <span className="small-heading">
            QUESTIONS ANSWERED
          </span>

          <h2>Frequently Asked Questions</h2>

          <div className="faq-wrapper">
            {faqs.map((faq, index) => (
              <div
                className={`faq-item ${
                  open === index ? "active" : ""
                }`}
                key={index}
              >
                <button
                  onClick={() =>
                    setOpen(open === index ? null : index)
                  }
                >
                  {faq.question}
                  <span>
                    {open === index ? "−" : "+"}
                  </span>
                </button>

                {open === index && (
                  <div className="faq-answer">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

