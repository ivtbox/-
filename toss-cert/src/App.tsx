import { useState, useRef, useCallback, useEffect } from "react";

const INITIAL_NAME = "강아지";
const EXPIRY_DATE = "2028.01.29";

function HoloCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d = imageData.data;

      for (let i = 0; i < d.length; i += 4) {
        const brightness = (d[i] + d[i + 1] + d[i + 2]) / 3;
        if (brightness < 40) {
          d[i + 3] = 0;
        } else if (brightness < 80) {
          d[i + 3] = Math.round(((brightness - 40) / 40) * d[i + 3]);
        }
      }

      ctx.putImageData(imageData, 0, 0);
    };
    img.src = "/holo_raw.png";
  }, []);

  return <canvas ref={canvasRef} className="holo-img" />;
}

function TrustBadge() {
  const size = 46;
  const sw = 2.5;
  const r = (size - sw) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const C = 2 * Math.PI * r;
  const gapAngle = 60;
  const gap = C * (gapAngle / 360);
  const dash = C - gap;

  // "e" as a small arc circle — gap on the right like the outer ring
  const eCx = 20;
  const eCy = 28;
  const eR = 8;
  const eSw = 2;
  const eGapAngle = 65;
  const eC = 2 * Math.PI * eR;
  const eGap = eC * (eGapAngle / 360);
  const eDash = eC - eGap;

  // Horizontal line: left wall → left edge of e arc (outer line)
  const lineY = eCy;
  const lineX1 = cx - Math.sqrt(r * r - (lineY - cy) * (lineY - cy));
  const lineX2 = eCx - eR;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ position: "absolute", top: 0, left: 0 }}>
        {/* Outer ring fill */}
        <circle cx={cx} cy={cy} r={r} fill="rgba(230,232,248,0.5)" />

        {/* Outer ring stroke with gap */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke="rgba(148,163,184,0.75)"
          strokeWidth={sw}
          strokeDasharray={`${dash} ${gap}`}
          strokeLinecap="round"
          transform={`rotate(${gapAngle / 2}, ${cx}, ${cy})`}
        />

        {/* "e" — small arc with gap on the right */}
        <circle
          cx={eCx} cy={eCy} r={eR}
          fill="none"
          stroke="rgba(148,163,184,0.9)"
          strokeWidth={eSw}
          strokeDasharray={`${eDash} ${eGap}`}
          strokeLinecap="round"
          transform={`rotate(${eGapAngle / 2}, ${eCx}, ${eCy})`}
        />

        {/* Outer line: outer left wall → left edge of "e" arc */}
        <line
          x1={lineX1} y1={lineY}
          x2={lineX2} y2={lineY}
          stroke="rgba(148,163,184,0.9)"
          strokeWidth={1.5}
          strokeLinecap="round"
        />
        {/* Inner horizontal bar of "e": left edge → right opening */}
        <line
          x1={eCx - eR} y1={eCy}
          x2={eCx + eR} y2={eCy}
          stroke="rgba(148,163,184,0.9)"
          strokeWidth={1.5}
          strokeLinecap="round"
        />
      </svg>

      {/* TRUST — vertically stretched */}
      <div style={{
        position: "absolute", top: 8, left: 0, right: 0,
        textAlign: "center",
        transform: "scaleY(1.3)",
        transformOrigin: "top center",
      }} className="text-[7px] font-semibold text-slate-400 tracking-widest leading-none">
        TRUST
      </div>

      {/* Sign — right side, n near the gap */}
      <div style={{ position: "absolute", top: 21, right: 1 }}
        className="text-[7px] font-semibold text-slate-400 tracking-tight leading-none">
        Sign
      </div>
    </div>
  );
}

function NameEditModal({
  currentName,
  onSave,
  onClose,
}: {
  currentName: string;
  onSave: (name: string) => void;
  onClose: () => void;
}) {
  const [value, setValue] = useState(currentName);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.4)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-t-3xl bg-white p-6 pb-10"
        onClick={(e) => e.stopPropagation()}
        style={{ boxShadow: "0 -4px 40px rgba(0,0,0,0.15)" }}
      >
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-6" />
        <h2 className="text-lg font-bold text-gray-900 mb-4">이름 변경</h2>
        <input
          className="w-full rounded-xl px-4 py-3 text-base outline-none transition-colors bg-gray-50"
          style={{ border: "1px solid #e5e7eb" }}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus
          maxLength={20}
          placeholder="이름을 입력하세요"
          onFocus={(e) => (e.target.style.borderColor = "#93c5fd")}
          onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
        />
        <div className="flex gap-3 mt-4">
          <button
            className="flex-1 py-3.5 rounded-xl bg-gray-100 text-gray-600 font-semibold text-base"
            onClick={onClose}
          >
            취소
          </button>
          <button
            className="flex-1 py-3.5 rounded-xl font-semibold text-base text-white"
            style={{ background: "linear-gradient(135deg, #4e7de9, #6b8ef5)" }}
            onClick={() => {
              if (value.trim()) {
                onSave(value.trim());
                onClose();
              }
            }}
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}

const HISTORY_ITEMS = [
  { id: 1, type: "전자서명", company: "(주)우아한형제들", date: "2026.05.15 15:52", iconBg: "#4285F4", iconText: "우", hasChevron: true },
  { id: 2, type: "마이데이터 통합인증", company: "토스", date: "2026.05.12 12:40", iconBg: "#4285F4", iconText: "T", hasChevron: false },
  { id: 3, type: "간편인증", company: "게토", date: "2026.05.08 09:26", iconBg: "#7C3AED", iconText: "geto", hasChevron: true },
  { id: 4, type: "행안부 간편인증", company: "국민건강보험공단", date: "2026.02.11 16:37", iconBg: "#EF4444", iconText: "건", hasChevron: false },
  { id: 5, type: "행안부 간편인증", company: "전자후견등기시스템", date: "2026.02.11 16:37", iconBg: "#D1D5DB", iconText: "후", hasChevron: true },
  { id: 6, type: "행안부 간편인증", company: "위택스", date: "2026.02.11 16:37", iconBg: "#D1D5DB", iconText: "위", hasChevron: true },
  { id: 7, type: "행안부 간편인증", company: "정부24 간편인증", date: "2026.02.02 17:53", iconBg: "#6B7280", iconText: "정", hasChevron: true },
  { id: 8, type: "행안부 간편인증", company: "국세청", date: "2026.02.02 17:53", iconBg: "#6B7280", iconText: "국", hasChevron: false },
];

function HistoryScreen() {
  return (
    <div className="flex-1 bg-white overflow-hidden">
      <img
        src="/history_list.png"
        alt="인증 내역"
        className="w-full"
        style={{ display: "block" }}
      />
    </div>
  );
}

export default function App() {
  const [name, setName] = useState(() => localStorage.getItem("cert-name") ?? INITIAL_NAME);

  useEffect(() => {
    localStorage.setItem("cert-name", name);
  }, [name]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const manageClickCount = useRef(0);
  const manageClickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleManageClick = useCallback(() => {
    manageClickCount.current += 1;
    if (manageClickTimer.current) clearTimeout(manageClickTimer.current);
    if (manageClickCount.current >= 3) {
      manageClickCount.current = 0;
      setShowEditModal(true);
    } else {
      manageClickTimer.current = setTimeout(() => {
        manageClickCount.current = 0;
      }, 800);
    }
  }, []);

  return (
    <div className="phone-bg flex justify-center items-start h-screen overflow-hidden relative">

      {/* Background circle — full-screen level so it fills edge to edge */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: "80vh",
          height: "80vh",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: "radial-gradient(circle, #eaf0f8 0%, #edf3fa 55%, #f2f6fc 78%, transparent 95%)",
          zIndex: 0,
          opacity: showHistory ? 0 : 1,
          transition: "opacity 0.2s",
        }}
      />

      <div className="w-full max-w-[390px] h-full flex flex-col relative overflow-hidden" style={{ zIndex: 1 }}>

        <div className="flex items-center justify-between px-4 pt-3 pb-3 flex-shrink-0" style={{ background: "#ffffff" }}>
          <button
            className="w-9 h-9 flex items-center justify-center"
            onClick={() => setShowHistory(false)}
          >
            <svg width="10" height="18" viewBox="0 0 10 18" fill="none">
              <path d="M9 1L1 9L9 17" stroke="#374151" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <span className="text-[17px] font-bold text-gray-800 tracking-tight">토스인증서</span>
          <button className="manage-btn text-[15px] text-gray-800 font-medium px-2 py-1" onClick={handleManageClick}>
            관리
          </button>
        </div>

        {/* Main screen — always fixed */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 flex flex-col items-center justify-center px-6 pt-0 pb-12">
            <div className="cert-card rounded-[28px] w-full overflow-hidden" style={{ height: 530 }}>
              <div className="relative w-full h-full px-6 pt-5 pb-7">

                <div className="absolute top-4 left-4 z-20">
                  <TrustBadge />
                </div>

                <div
                  className="absolute z-10"
                  style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
                >
                  <div className="relative" style={{ width: 370, height: 370 }}>
                    <div
                      className="ring-pulse-1 absolute rounded-full overflow-hidden"
                      style={{
                        width: 370, height: 370, top: 0, left: 0,
                        background: "radial-gradient(circle, rgba(195,208,232,0.90) 0%, rgba(190,205,230,0.68) 45%, rgba(185,200,228,0.32) 72%, transparent 100%)",
                      }}
                    >
                      <div
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: "linear-gradient(128deg, transparent 22%, rgba(255,255,255,0.28) 38%, rgba(255,255,255,0.14) 50%, rgba(255,255,255,0.28) 62%, transparent 78%)",
                        }}
                      />
                    </div>

                    <div
                      className="ring-pulse-2 absolute rounded-full"
                      style={{
                        width: 255, height: 255,
                        top: (370 - 255) / 2, left: (370 - 255) / 2,
                        background: "radial-gradient(circle, rgba(229,235,246,0.90) 0%, rgba(230,239,254,0.65) 55%, transparent 80%)",
                      }}
                    />

                    <div
                      className="holo-wrap absolute z-10"
                      style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
                    >
                      <HoloCanvas />
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-7 left-6 right-6 z-20">
                  <div className="text-[26px] font-bold text-gray-800 mb-1" style={{ letterSpacing: "-0.5px" }}>
                    {name}
                  </div>
                  <div className="text-[13px] text-gray-400 font-normal">
                    유효기간{" "}
                    <span className="font-medium" style={{ color: "#4B96F0" }}>
                      {EXPIRY_DATE}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 pb-6 flex-shrink-0">
            <button
              className="bottom-btn w-full py-[19.5px] rounded-2xl flex items-center justify-center gap-2.5 active:scale-[0.98] transition-transform"
              onClick={() => setShowHistory(true)}
            >
              <svg width="18" height="13" viewBox="0 0 18 13" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                <rect x="0" y="0" width="18" height="2.2" rx="1.1" fill="#6B7280" />
                <rect x="0" y="5.4" width="18" height="2.2" rx="1.1" fill="#6B7280" />
                <rect x="0" y="10.8" width="18" height="2.2" rx="1.1" fill="#6B7280" />
              </svg>
              <span className="text-[15px] font-semibold" style={{ color: "#111827", lineHeight: 1 }}>인증 내역</span>
            </button>
          </div>
        </div>

        {/* History screen — slides in from right on top */}
        <div
          className="absolute inset-0 flex flex-col bg-white"
          style={{
            transform: showHistory ? "translateX(0)" : "translateX(100%)",
            transition: "transform 0.32s cubic-bezier(0.4, 0, 0.2, 1)",
            zIndex: 10,
          }}
        >
          {/* Header — back arrow only */}
          <div className="flex items-center px-4 pt-3 pb-3 flex-shrink-0" style={{ background: "#ffffff" }}>
            <button
              className="w-9 h-9 flex items-center justify-center"
              onClick={() => setShowHistory(false)}
            >
              <svg width="10" height="18" viewBox="0 0 10 18" fill="none">
                <path d="M9 1L1 9L9 17" stroke="#374151" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
          <HistoryScreen />
        </div>
      </div>

      {showEditModal && (
        <NameEditModal
          currentName={name}
          onSave={setName}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
}
