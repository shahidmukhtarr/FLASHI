'use client';

const MESSAGES = [
  '🔥 50% OFF Premium — First 10 Users Only!',
  '⚡ Compare Prices Across 50+ Pakistani Stores',
  '🛍️ Limelight · Sapphire · Khaadi · J. · Daraz — All Sales Here!',
  '🔥 50% OFF Premium — First 10 Users Only!',
  '🎉 Highfy · Naheed · Uniworth — Live Sale Collections!',
  '⚡ Save Up to Rs. 5,000 on Every Purchase',
];

const TRACK = [...MESSAGES, ...MESSAGES];

export default function AnnouncementBar() {
  return (
    <>
      <style>{`
        /* ── Announcement Bar ── */
        .ann-bar {
          position: sticky;
          top: 0;
          z-index: 9999;
          height: 38px;
          display: flex;
          align-items: stretch;
          background: #1b5e20;
          box-shadow: 0 2px 8px rgba(27,94,32,0.4);
          font-family: 'Outfit','Inter',sans-serif;
        }
        html.is-app .ann-bar { display: none; }

        /* Left decorative accent line */
        .ann-bar::before {
          content: '';
          display: block;
          width: 3px;
          background: linear-gradient(180deg, #66bb6a, #2e7d32);
          flex-shrink: 0;
        }

        /* ── Scrolling area: strictly contained ── */
        .ann-scroll-wrap {
          flex: 1;
          overflow: hidden;
          display: flex;
          align-items: center;
          position: relative;
          min-width: 0;
        }

        /* Fade edges so text doesn't hard-clip */
        .ann-scroll-wrap::before,
        .ann-scroll-wrap::after {
          content: '';
          position: absolute;
          top: 0;
          bottom: 0;
          width: 32px;
          z-index: 2;
          pointer-events: none;
        }
        .ann-scroll-wrap::before {
          left: 0;
          background: linear-gradient(90deg, #1b5e20, transparent);
        }
        .ann-scroll-wrap::after {
          right: 0;
          background: linear-gradient(270deg, #1b5e20, transparent);
        }

        .ann-track {
          display: inline-flex;
          align-items: center;
          white-space: nowrap;
          animation: annScroll 32s linear infinite;
          will-change: transform;
        }
        .ann-track:hover { animation-play-state: paused; }

        @keyframes annScroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }

        .ann-msg {
          display: inline-flex;
          align-items: center;
          padding: 0 2.2rem;
          font-size: 0.78rem;
          font-weight: 700;
          color: #e8f5e9;
          letter-spacing: 0.03em;
        }

        /* Bullet separator between messages */
        .ann-msg::after {
          content: '•';
          margin-left: 2.2rem;
          color: rgba(255,255,255,0.3);
          font-size: 0.6rem;
        }
        .ann-msg:last-child::after { display: none; }

        /* ── Right side actions ── */
        .ann-actions {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 0 10px 0 8px;
          flex-shrink: 0;
          border-left: 1px solid rgba(255,255,255,0.12);
          background: #1a5220;
        }

        .ann-cta {
          display: inline-flex;
          align-items: center;
          height: 24px;
          padding: 0 14px;
          background: #43a047;
          border-radius: 9999px;
          color: #fff;
          font-size: 0.73rem;
          font-weight: 800;
          letter-spacing: 0.04em;
          text-decoration: none;
          white-space: nowrap;
          transition: background 0.2s, transform 0.15s;
          border: none;
          box-shadow: 0 1px 4px rgba(0,0,0,0.25);
        }
        .ann-cta:hover {
          background: #66bb6a;
          color: #fff;
          transform: scale(1.04);
        }
      `}</style>

      <div className="ann-bar" role="banner" aria-label="Promotional announcement">

        {/* Scrolling text — fully contained */}
        <div className="ann-scroll-wrap">
          <div className="ann-track" aria-hidden="true">
            {TRACK.map((msg, i) => (
              <span key={i} className="ann-msg">{msg}</span>
            ))}
          </div>
        </div>

        {/* Right: CTA */}
        <div className="ann-actions">
          <a href="/subscribe" className="ann-cta">
            Claim 50% Off
          </a>
        </div>

      </div>
    </>
  );
}
