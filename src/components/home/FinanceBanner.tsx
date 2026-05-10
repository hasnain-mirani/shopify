"use client";

import Link from "next/link";

export function FinanceBanner() {
  return (
    <section className="finance-banner">
      <div className="finance-inner">
        <div className="finance-content">
          <span className="finance-kicker">Flexible payments</span>
          <h2 className="finance-title">
            Buy now.
            <br />
            Pay later.
          </h2>
          <p className="finance-copy">
            Checkout with your card and split your shopping into manageable payments
            with trusted banking partners.
          </p>
          <div className="finance-actions">
            <Link href="/shop" className="finance-cta-primary">
              Shop with installments
            </Link>
            <Link
              href="/about"
              className="finance-cta-secondary finance-cta-descriptive"
              aria-label="Learn more about SSHUB"
            >
              Learn more about SSHUB
            </Link>
          </div>
        </div>

        <div className="finance-cards" aria-hidden="true">
          {["#111827", "#0f172a", "#1e293b", "#172554", "#334155", "#1d4ed8"].map((bg, i) => (
            <div
              key={bg}
              className="finance-card"
              style={{
                background: `linear-gradient(135deg, ${bg}, #0b1224)`,
                transform: `rotate(${(i - 2.5) * 7}deg) translateY(${Math.abs(i - 2.5) * 6}px)`,
                zIndex: 10 + i,
              }}
            >
              <span className="finance-chip" />
              <span className="finance-bank">BANK</span>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        .finance-banner {
          position: relative;
          overflow: hidden;
          margin: 20px 0;
          border-top: 1px solid rgba(148,163,184,0.15);
          border-bottom: 1px solid rgba(148,163,184,0.15);
          background:
            radial-gradient(840px 360px at 15% 20%, rgba(29,78,216,0.26), transparent 62%),
            radial-gradient(620px 340px at 86% 65%, rgba(245,158,11,0.2), transparent 64%),
            linear-gradient(135deg, #0b1224 0%, #0f172a 45%, #111827 100%);
        }
        .finance-inner {
          max-width: 1200px;
          margin: 0 auto;
          min-height: 250px;
          padding: 32px 22px;
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          gap: 24px;
          align-items: center;
        }
        .finance-content {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .finance-kicker {
          display: inline-flex;
          align-self: flex-start;
          font-family: var(--font-outfit, sans-serif);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #fcd34d;
          border: 1px solid rgba(252,211,77,0.35);
          background: rgba(2,6,23,0.48);
          padding: 5px 10px;
          border-radius: 999px;
        }
        .finance-title {
          margin: 0;
          font-family: var(--font-playfair, serif);
          font-size: clamp(1.8rem, 5vw, 3.1rem);
          line-height: 1;
          color: #f8fafc;
          letter-spacing: -0.02em;
        }
        .finance-copy {
          margin: 0;
          max-width: 500px;
          font-family: var(--font-dm-sans, sans-serif);
          font-size: 15px;
          line-height: 1.6;
          color: #cbd5e1;
        }
        .finance-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 4px;
        }
        .finance-cta-primary, .finance-cta-secondary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          font-family: var(--font-outfit, sans-serif);
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          border-radius: 999px;
          transition: all 0.2s ease;
          height: 38px;
          padding: 0 18px;
        }
        .finance-cta-primary {
          color: #020617;
          background: linear-gradient(135deg, #fcd34d, #f59e0b);
          box-shadow: 0 8px 22px rgba(245,158,11,0.32);
        }
        .finance-cta-primary:hover {
          transform: translateY(-1px);
        }
        .finance-cta-secondary {
          color: #e2e8f0;
          border: 1px solid rgba(148,163,184,0.3);
          background: rgba(2,6,23,0.45);
        }
        .finance-cta-secondary:hover {
          border-color: rgba(252,211,77,0.45);
          color: #fcd34d;
        }
        .finance-cta-descriptive {
          text-transform: none;
          letter-spacing: 0.04em;
          font-size: 13px;
          font-weight: 600;
        }
        .finance-cards {
          position: relative;
          min-height: 170px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .finance-card {
          position: absolute;
          width: 120px;
          height: 74px;
          border-radius: 12px;
          border: 1px solid rgba(148,163,184,0.32);
          box-shadow: 0 10px 28px rgba(2,6,23,0.45);
          padding: 10px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .finance-chip {
          width: 16px;
          height: 12px;
          border-radius: 3px;
          background: linear-gradient(135deg, #fcd34d, #f59e0b);
        }
        .finance-bank {
          font-family: var(--font-outfit, sans-serif);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: #e2e8f0;
          align-self: flex-end;
        }
        @media (max-width: 900px) {
          .finance-inner {
            grid-template-columns: 1fr;
            gap: 14px;
          }
          .finance-cards {
            min-height: 128px;
            margin-top: 8px;
          }
          .finance-card {
            width: 98px;
            height: 62px;
          }
        }
      `}</style>
    </section>
  );
}

export default FinanceBanner;
