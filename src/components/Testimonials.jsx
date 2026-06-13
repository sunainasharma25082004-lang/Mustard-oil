import React, { useState, useEffect } from "react";
import "../styles/testimonials.css";
import { useAuth } from "../context/AuthContext";

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
      "It is cold pressed and free from chemical refining, bleaching and deodorizing."
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
  const { user } = useAuth();

  // Default reviews + ability to add new ones (persisted in localStorage for demo)
  const defaultReviews = [
    {
      name: "Anjali Sharma",
      location: "Gurugram",
      text: "The aroma and colour remind me of traditional ghani oil. My family noticed the difference within a week.",
      rating: 5
    },
    {
      name: "Dr. Rakesh Mehta",
      location: "Noida",
      text: "This is the first packaged cold pressed mustard oil I confidently recommend.",
      rating: 5
    },
    {
      name: "Priya Nair",
      location: "Delhi",
      text: "Amazing flavour, amazing aroma. Worth every rupee.",
      rating: 5
    }
  ];

  const [reviews, setReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    name: user?.name || "",
    location: "",
    rating: 5,
    text: ""
  });
  const [submitMessage, setSubmitMessage] = useState("");

  // Load saved reviews on mount
  useEffect(() => {
    const saved = localStorage.getItem("karyor_user_reviews");
    if (saved) {
      const parsed = JSON.parse(saved);
      setReviews([...defaultReviews, ...parsed]);
    } else {
      setReviews(defaultReviews);
    }
  }, []);

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

  const submitReview = (e) => {
    e.preventDefault();

    if (!newReview.text.trim()) {
      alert("Please write your review!");
      return;
    }

    const reviewToAdd = {
      ...newReview,
      name: newReview.name || "Anonymous Customer",
      location: newReview.location || "India"
    };

    const updatedReviews = [...reviews, reviewToAdd];
    setReviews(updatedReviews);

    // Save only user-added reviews (exclude defaults)
    const userAdded = updatedReviews.slice(defaultReviews.length);
    localStorage.setItem("karyor_user_reviews", JSON.stringify(userAdded));

    // Reset form
    setNewReview({
      name: user?.name || "",
      location: "",
      rating: 5,
      text: ""
    });
    setShowReviewForm(false);
    setSubmitMessage("Thank you! Your review has been added.");

    // Clear success message after 4 seconds
    setTimeout(() => setSubmitMessage(""), 4000);
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

          <h2>Karyor vs Refined Mustard Oil</h2>

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
              onClick={() => {
                setShowReviewForm(!showReviewForm);
                setSubmitMessage("");
              }}
              className="golden-btn"
              style={{ fontSize: "0.9rem", padding: "10px 20px" }}
            >
              {showReviewForm ? "Close" : "✍️ Write a Review"}
            </button>
          </div>

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

          <div className="testimonial-grid">
            {reviews.map((item, i) => (
              <div className="testimonial-card" key={i}>
                <div className="stars">{renderStars(item.rating || 5)}</div>

                <p>{item.text}</p>

                <h4>{item.name}</h4>
                <span>{item.location}</span>
              </div>
            ))}
          </div>

          {/* ADD REVIEW FORM */}
          {showReviewForm && (
            <div style={{
              marginTop: "32px",
              background: "linear-gradient(180deg, #1a1a1a, #101010)",
              border: "1px solid rgba(212,175,55,0.2)",
              borderRadius: "20px",
              padding: "28px",
              maxWidth: "620px",
              marginLeft: "auto",
              marginRight: "auto"
            }}>
              <h3 style={{ color: "#d4af37", marginBottom: "8px", fontSize: "1.3rem" }}>
                Share Your Experience
              </h3>
              <p style={{ color: "#888", marginBottom: "20px", fontSize: "0.95rem" }}>
                Your feedback helps other families discover pure Karyor oil.
              </p>

              <form onSubmit={submitReview}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
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
                        padding: "12px 14px",
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
                        padding: "12px 14px",
                        background: "#111",
                        border: "1px solid rgba(212,175,55,0.25)",
                        borderRadius: "10px",
                        color: "#fff",
                        fontSize: "1rem"
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", marginBottom: "8px", fontSize: "0.85rem", color: "#aaa" }}>Your Rating</label>
                  <div style={{ display: "flex", gap: "2px" }}>
                    {renderStars(newReview.rating, true)}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#888", marginTop: "4px" }}>Click to rate (1-5)</div>
                </div>

                <div style={{ marginBottom: "20px" }}>
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
                      resize: "vertical"
                    }}
                  />
                </div>

                <button
                  type="submit"
                  className="golden-btn"
                  style={{ width: "100%", padding: "14px", fontSize: "1.05rem" }}
                >
                  Submit Review
                </button>

                <p style={{ fontSize: "0.75rem", color: "#666", marginTop: "12px", textAlign: "center" }}>
                  Reviews are added instantly for everyone to see (demo mode).
                </p>
              </form>
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

