export default function WhatsappButton() {
  return (
    <>
      <style>{`
      
      .whatsapp-float{
        position:fixed;
        bottom:25px;
        right:25px;
        width:65px;
        height:65px;
        background:#25D366;
        border-radius:50%;
        display:flex;
        align-items:center;
        justify-content:center;
        text-decoration:none;
        z-index:99999;
        box-shadow:0 8px 25px rgba(37,211,102,.45);
        transition:.3s;
        animation: whatsappPulse 2s infinite;
      }

      .whatsapp-float:hover{
        transform:scale(1.1);
      }

      .whatsapp-float svg{
        width:34px;
        height:34px;
        fill:white;
      }

      @keyframes whatsappPulse{
        0%{
          box-shadow:
          0 0 0 0 rgba(37,211,102,.6);
        }

        70%{
          box-shadow:
          0 0 0 18px rgba(37,211,102,0);
        }

        100%{
          box-shadow:
          0 0 0 0 rgba(37,211,102,0);
        }
      }

      `}</style>

      <a
        href="https://wa.me/919999999999"
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-float"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 448 512"
        >
          <path d="M380.9 97.1C339-6.1 234.3-33.6 140.6 13.3S-18.8 174.3 28.1 268c17.6 35.1 44.7 64.3 78 84.5L64 480l130.3-40.4c27.4 7.5 56 9.1 84 4.8 93.7-14.4 165.4-94.8 169.7-189.5 2.2-48.7-11.3-96.3-37.1-135.7zM224 400c-28.7 0-56.8-7.7-81.5-22.2l-5.8-3.4-77.3 24 25.2-75.2-3.8-6c-17.3-27.5-26.4-59.2-26.4-91.9 0-94.8 77-171.8 171.8-171.8S397.8 130.5 397.8 225.3 320.8 400 224 400zm94.5-128.1c-5.2-2.6-30.8-15.2-35.6-16.9-4.8-1.7-8.3-2.6-11.8 2.6s-13.5 16.9-16.5 20.4-6.1 3.9-11.3 1.3c-30.8-15.4-51-27.6-71.4-62.4-5.4-9.3 5.4-8.6 15.4-28.7 1.7-3.5.9-6.5-.4-9.1s-11.8-28.4-16.1-38.9c-4.2-10.1-8.5-8.7-11.8-8.9-3-.2-6.5-.2-10-.2s-9.1 1.3-13.9 6.5c-4.8 5.2-18.3 17.8-18.3 43.4s18.7 50.4 21.3 53.9c2.6 3.5 36.8 56.2 89.1 78.8 33.1 14.3 46.1 15.5 62.7 13 10.1-1.5 30.8-12.6 35.2-24.8 4.3-12.2 4.3-22.6 3-24.8-1.3-2.1-4.8-3.4-10-6z"/>
        </svg>
      </a>
    </>
  );
}