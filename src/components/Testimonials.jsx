import React, { useState } from "react";
import "../styles/testimonials.css";

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

          <h2>What Our Customers Say</h2>

          <div className="testimonial-grid">
            {[
              {
                name: "Anjali Sharma",
                location: "Gurugram",
                text:
                  "The aroma and colour remind me of traditional ghani oil. My family noticed the difference within a week."
              },
              {
                name: "Dr. Rakesh Mehta",
                location: "Noida",
                text:
                  "This is the first packaged cold pressed mustard oil I confidently recommend."
              },
              {
                name: "Priya Nair",
                location: "Delhi",
                text:
                  "Amazing flavour, amazing aroma. Worth every rupee."
              }
            ].map((item, i) => (
              <div className="testimonial-card" key={i}>
                <div className="stars">★★★★★</div>

                <p>{item.text}</p>

                <h4>{item.name}</h4>
                <span>{item.location}</span>
              </div>
            ))}
          </div>
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

