export default function WhatsappButton() {
  return (
    <>
      <style>{`
      
      .whatsapp-float{
        position:fixed;
        bottom:20px;
        right:20px;
        width:64px;
        height:64px;
        background:#25D366;
        border-radius:50%;
        display:flex;
        align-items:center;
        justify-content:center;
        text-decoration:none;
        z-index:99999;
        box-shadow: 
          0 8px 25px rgba(37, 211, 102, .45),
          0 0 0 7px rgba(37, 211, 102, .15),
          inset 0 1px 0 rgba(255,255,255,.3);
        transition: transform .25s cubic-bezier(0.4, 0, 0.2, 1), 
                    box-shadow .25s ease;
        animation: whatsappPulse 2.4s infinite ease-in-out;
      }

      .whatsapp-float:hover{
        transform: scale(1.15) translateY(-2px);
        box-shadow: 
          0 14px 35px rgba(37, 211, 102, .55),
          0 0 0 10px rgba(37, 211, 102, .2),
          inset 0 1px 0 rgba(255,255,255,.4);
      }

      .whatsapp-float i {
        font-size: 34px;
        color: white;
        line-height: 1;
        filter: drop-shadow(0 1px 2px rgba(0,0,0,.2));
        z-index: 2;
      }

      .wa-label {
        position: absolute;
        right: 100%;
        margin-right: 12px;
        background: #25D366;
        color: white;
        font-size: 0.85rem;
        font-weight: 700;
        padding: 8px 16px;
        border-radius: 999px;
        white-space: nowrap;
        opacity: 0;
        transform: translateX(10px);
        transition: all 0.25s ease;
        pointer-events: none;
        box-shadow: 0 4px 12px rgba(37, 211, 102, .3);
        z-index: 1;
      }

      .whatsapp-float:hover .wa-label {
        opacity: 1;
        transform: translateX(0);
        pointer-events: auto;
      }

      @keyframes whatsappPulse{
        0%{
          box-shadow: 
            0 8px 25px rgba(37, 211, 102, .45),
            0 0 0 7px rgba(37, 211, 102, .15),
            inset 0 1px 0 rgba(255,255,255,.3);
        }
        70%{
          box-shadow: 
            0 8px 25px rgba(37, 211, 102, .45),
            0 0 0 18px rgba(37, 211, 102, 0),
            inset 0 1px 0 rgba(255,255,255,.3);
        }
        100%{
          box-shadow: 
            0 8px 25px rgba(37, 211, 102, .45),
            0 0 0 7px rgba(37, 211, 102, .15),
            inset 0 1px 0 rgba(255,255,255,.3);
        }
      }

      `}</style>

      <a
        href="https://wa.me/918708621377"
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-float"
        aria-label="Chat with us on WhatsApp"
      >
        <i className="bi bi-whatsapp"></i>
        <span className="wa-label">Chat</span>
      </a>
    </>
  );
}