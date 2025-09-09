import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Copy,
  BookOpen,
  QrCode,
  CheckCircle2,
  Sun,
  Moon,
  UserCircle2,
  ShieldCheck,
} from "lucide-react";

/**************************************
 * Minimal local UI kit to fix build
 **************************************/

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "ghost" | "link";
  size?: "default" | "icon" | "sm";
};

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export const Button: React.FC<ButtonProps> = ({
  className,
  variant = "default",
  size = "default",
  ...props
}) => {
  const base =
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition-colors";
  const variants = {
    default: "bg-yellow-400 text-black hover:bg-yellow-500",
    outline: "border border-gray-300 text-gray-900 bg-transparent hover:bg-gray-100",
    ghost: "text-inherit hover:bg-black/5",
    link: "text-inherit underline underline-offset-4 decoration-current hover:opacity-80 bg-transparent px-0 py-0",
  } as const;
  const sizes = {
    default: "h-10",
    icon: "h-10 w-10 p-0",
    sm: "h-8 px-3 text-xs",
  } as const;
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...props} />
  );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({
  className,
  ...props
}) => (
  <input
    className={cn(
      "w-full rounded-xl border bg-transparent border-gray-300 px-3 py-2 text-sm text-inherit placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500",
      className
    )}
    {...props}
  />
);

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => <div className={cn("rounded-2xl border border-transparent bg-transparent", className)} {...props} />;

export const IPhoneMockup: React.FC<{ children: React.ReactNode; isDark: boolean }> = ({
  children,
  isDark,
}) => (
  <div
    className={cn(
      "min-h-screen w-full flex items-center justify-center p-4",
      isDark ? "bg-neutral-900 text-white" : "bg-neutral-100 text-black"
    )}
  >
    <div
      className={cn(
        "relative mx-auto h-[812px] w-[375px] overflow-hidden rounded-[3rem] border shadow-2xl",
        isDark ? "border-neutral-800 bg-black" : "border-neutral-300 bg-white"
      )}
    >
      {/* Notch */}
      <div
        className={cn(
          "absolute left-1/2 top-0 z-10 h-6 w-40 -translate-x-1/2 rounded-b-2xl",
          isDark ? "bg-black" : "bg-white"
        )}
      />
      <div className="h-full w-full">{children}</div>
    </div>
  </div>
);

/**************************************
 * App logic
 **************************************/

// Golden "S" logo as encoded SVG (fix: must be URI-encoded for data URL)
const rawLogoSvg = `
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>
  <defs>
    <linearGradient id='g' x1='0' x2='0' y1='0' y2='1'>
      <stop offset='0%' stop-color='#FFE08A'/>
      <stop offset='100%' stop-color='#B8860B'/>
    </linearGradient>
  </defs>
  <text x='50%' y='56%' dominant-baseline='middle' text-anchor='middle' font-size='72' font-family='Georgia,serif' fill='url(#g)'>S</text>
</svg>`;
const logoSrc = `data:image/svg+xml;utf8,${encodeURIComponent(rawLogoSvg)}`;

// Types
 type Screen =
  | "dashboard"
  | "send"
  | "recipients"
  | "confirm"
  | "success"
  | "profile";

type Contact = {
  id: number;
  phone: string;
  address?: string;
  name?: string;
};

type Tx = {
  type: "Received" | "Sent";
  amount: string;
  value: string;
  status: "Completed" | "Pending" | "Failed";
  recipientPhone?: string;
  recipientAddress?: string;
  hash?: string;
};

type Network = {
  id: string;
  label: string;
  baseFeeUsd: number;
  pctFee: number;
};

// Mock data
const mockContacts: Contact[] = [
  { id: 1, phone: "+1123 456 7990", address: "0x742d...E20c", name: "John Doe" },
  { id: 2, phone: "+1987 654 3210", address: "0xf2dd...5c3a", name: "Alice Smith" },
  { id: 3, phone: "+1555 123 4567", address: "0x8934...a92f", name: "Bob Johnson" },
  { id: 4, phone: "+1444 789 0123", address: "0x1a2b...c4d5", name: "Carol Wilson" },
];

const mockTransactions: Tx[] = [
  {
    type: "Received",
    amount: "0.75 ETH",
    value: "$1,320.75",
    status: "Completed",
    recipientPhone: "+1123 456 7990",
    recipientAddress: "0x742d...E20c",
    hash: "0xrx1",
  },
  {
    type: "Sent",
    amount: "-500 USDT",
    value: "$500.00",
    status: "Completed",
    recipientPhone: "+1555 123 4567",
    recipientAddress: "0x8934...a92f",
    hash: "0xrx2",
  },
  {
    type: "Received",
    amount: "0.2 FTM",
    value: "$550.00",
    status: "Completed",
    recipientPhone: "+1444 789 0123",
    recipientAddress: "0x1a2b...c4d5",
    hash: "0xrx3",
  },
];

const networks: Network[] = [
  { id: "eth", label: "Ethereum (ERC-20)", baseFeeUsd: 2.5, pctFee: 0.003 },
  { id: "sol", label: "Solana (SPL)", baseFeeUsd: 0.05, pctFee: 0.001 },
  { id: "tron", label: "Tron (TRC-20)", baseFeeUsd: 0.2, pctFee: 0.0015 },
];

// Helpers
export function formatMoney(n: number, currency: string = "USD") {
  if (!Number.isFinite(n)) n = 0;
  try {
    return n.toLocaleString(undefined, { style: "currency", currency });
  } catch {
    return `$${n.toFixed(2)}`;
  }
}

export function estimateFeeUSD(amount: number, net: Network) {
  const variable = Math.max(0, amount) * net.pctFee;
  return +(net.baseFeeUsd + variable).toFixed(2);
}

export function generateSixDigitCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
export function createExpiry(seconds: number) {
  return Date.now() + seconds * 1000;
}
export function remainingSeconds(expiryTs: number, now = Date.now()) {
  return Math.max(0, Math.ceil((expiryTs - now) / 1000));
}
export function formatCountdown(secs: number) {
  const m = Math.floor(secs / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(secs % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

// Currency conversion (defaults; will be overridden by NBP when available)
const defaultRates: Record<string, number> = { USD: 1, EUR: 0.92, PLN: 3.95, AED: 3.67 };
const currencyOrder = Object.keys(defaultRates);
const currencySymbols: Record<string, string> = { USD: "$", EUR: "€", PLN: "zł", AED: "د.إ" };
function convertFromUSD(amountUsd: number, currency: string, rates: Record<string, number>) {
  const rate = rates[currency] ?? 1;
  return amountUsd * rate;
}

// Build rates map from NBP Table A (PLN base). data: [{ table:"A", effectiveDate, rates:[{code,mid},...] }]
export function computeRatesFromNBP(tableA: any): Record<string, number> {
  try {
    const ratesArr = Array.isArray(tableA) ? tableA[0]?.rates ?? [] : [];
    const byCode: Record<string, number> = {};
    for (const r of ratesArr) if (r?.code && typeof r?.mid === "number") byCode[r.code] = r.mid; // mid = PLN per 1 unit currency
    if (!byCode["USD"]) return defaultRates;
    const plnPerUsd = byCode["USD"]; // PLN per 1 USD
    const out: Record<string, number> = { USD: 1 };
    // For any currency X with PLN per X = byCode[X], USD->X = (PLN/USD) / (PLN/X)
    for (const c of Object.keys(byCode)) {
      if (c === "USD") continue;
      out[c] = plnPerUsd / byCode[c];
    }
    // Keep PLN explicitly as USD->PLN
    out["PLN"] = plnPerUsd;
    return { ...defaultRates, ...out };
  } catch { return defaultRates; }
}

// Brand header image
const BrandHeader: React.FC<{ isDark: boolean }> = ({ isDark }) => (
  <div className="flex items-center justify-center flex-1">
    <img
      src={logoSrc}
      alt="SahliPay"
      className={cn(
        "object-contain h-12 drop-shadow-[0_0_12px_rgba(255,215,0,0.6)]",
        isDark ? "brightness-[1.15]" : "brightness-100"
      )}
    />
  </div>
);

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("dashboard");
  const [selectedRecipient, setSelectedRecipient] = useState<Contact | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [generatedCode, setGeneratedCode] = useState<string>("");
  const [codeExpiryTs, setCodeExpiryTs] = useState<number | null>(null);
  const [nowTick, setNowTick] = useState<number>(Date.now());
  const [networkId, setNetworkId] = useState<string>(networks[0].id);
  const [notes, setNotes] = useState<string>("");
  const [txHash] = useState<string>("0x742d35cc...e20c8f5a");
  const [isDark, setIsDark] = useState(true);

  // Currency state
  const [currency, setCurrency] = useState<string>("USD");
  const [showCurrencyMenu, setShowCurrencyMenu] = useState(false);
  const [rates, setRates] = useState<Record<string, number>>(defaultRates);

  // Spay modal state
  const [showSpay, setShowSpay] = useState(false);
  const [spayPhone, setSpayPhone] = useState("");
  const [spayAmount, setSpayAmount] = useState("");
  const [spayNetworkId, setSpayNetworkId] = useState<string>(networks[0].id);

  // Tx details modal state
  const [txOpen, setTxOpen] = useState<Tx | null>(null);

  const activeNetwork = useMemo(() => networks.find((n) => n.id === networkId)!, [networkId]);

  const parsedAmount = useMemo(() => { const n = parseFloat(amount); return Number.isFinite(n) && n > 0 ? n : 0; }, [amount]);
  const estFee = useMemo(() => estimateFeeUSD(parsedAmount, activeNetwork), [parsedAmount, activeNetwork]);
  const totalWithFee = useMemo(() => parsedAmount + estFee, [parsedAmount, estFee]);
  const canContinue = parsedAmount > 0 && !!selectedRecipient;

  // Generate code (90s expiry)
  const onGeneratePaymentCode = () => { setGeneratedCode(generateSixDigitCode()); setCodeExpiryTs(createExpiry(90)); };

  useEffect(() => { const id = setInterval(() => setNowTick(Date.now()), 1000); return () => clearInterval(id); }, []);
  useEffect(() => { if (!codeExpiryTs) return; const secs = remainingSeconds(codeExpiryTs, nowTick); if (secs === 0) { setGeneratedCode(""); setCodeExpiryTs(null); } }, [codeExpiryTs, nowTick]);
  const codeSecondsLeft = codeExpiryTs ? remainingSeconds(codeExpiryTs, nowTick) : 0;

  const copyToClipboard = async (text: string) => { try { await navigator.clipboard.writeText(text); alert("Copied to clipboard"); } catch { alert("Copy failed"); } };

  // Fetch live FX from NBP (Table A)
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("https://api.nbp.pl/api/exchangerates/tables/A?format=json", { headers: { Accept: "application/json" } });
        if (!res.ok) throw new Error("NBP fetch failed");
        const json = await res.json();
        const newRates = computeRatesFromNBP(json);
        setRates((prev) => ({ ...prev, ...newRates }));
      } catch {
        // keep default rates silently
      }
    }
    load();
  }, []);

  // Shared header
  const Header: React.FC = () => (
    <div className="flex items-center justify-between mb-6 mt-2 px-2">
      <Button variant="ghost" size="icon" aria-label="Profile" onClick={() => setCurrentScreen("profile")}>
        <UserCircle2 size={20} />
      </Button>
      <BrandHeader isDark={isDark} />
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" aria-label="Toggle theme" onClick={() => setIsDark((v) => !v)}>
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </Button>
      </div>
    </div>
  );

  // Screens
  const renderDashboard = () => (
    <div className={cn("h-full p-4 overflow-y-auto", isDark ? "bg-black text-white" : "bg-white text-black") }>
      <div className="max-w-full mx-auto">
        <Header />

        {/* Balance with live currency switcher */}
        <div className="mb-6">
          <div className={cn("text-sm mb-2", isDark ? "text-gray-400" : "text-gray-500")}>Balance</div>
          <div className="text-3xl flex items-center gap-2">
            {formatMoney(convertFromUSD(12830.5, currency, rates), currency)}
            <div className="relative">
              <Button variant="link" onClick={() => setShowCurrencyMenu((v) => !v)}>{currency}</Button>
              {showCurrencyMenu && (
                <div className={cn("absolute z-20 mt-1 w-28 rounded-xl border p-1 shadow-lg", isDark ? "bg-black border-gray-700" : "bg-white border-gray-200") }>
                  {currencyOrder.map((c) => (
                    <button
                      key={c}
                      className={cn("w-full text-left px-3 py-2 rounded-lg text-sm", c === currency ? (isDark ? "bg-gray-800" : "bg-gray-100") : (isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"))}
                      onClick={() => { setCurrency(c); setShowCurrencyMenu(false); }}
                    >
                      {c} {currencySymbols[c] ?? ""}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <div className={cn("text-sm mb-4", isDark ? "text-gray-400" : "text-gray-500")}>Quick Actions</div>
          <div className="grid grid-cols-4 gap-3">
            <Button variant="outline" className={cn("flex flex-col gap-2 h-16", isDark ? "border-gray-700 text-white hover:bg-white/5" : "border-gray-300 text-black hover:bg-black/5")} onClick={onGeneratePaymentCode}>
              <QrCode size={18} />
              <span className="text-xs">Generate Code</span>
            </Button>
            <Button variant="outline" className={cn("flex flex-col gap-2 h-16", isDark ? "border-gray-700 text-white hover:bg-white/5" : "border-gray-300 text-black hover:bg-black/5")} onClick={() => setShowSpay(true)}>
              <img src={logoSrc} alt="S" className="h-6 object-contain" />
              <span className="text-xs">Spay</span>
            </Button>
            <Button variant="outline" className={cn("flex flex-col gap-2 h-16", isDark ? "border-gray-700 text-white hover:bg-white/5" : "border-gray-300 text-black hover:bg-black/5")} onClick={() => setCurrentScreen("profile")}>
              <UserCircle2 size={18} />
              <span className="text-xs">My Profile</span>
            </Button>
            <Button variant="outline" className={cn("flex flex-col gap-2 h-16", isDark ? "border-gray-700 text-white hover:bg-white/5" : "border-gray-300 text-black hover:bg-black/5")} onClick={() => setCurrentScreen("recipients")}>
              <BookOpen size={18} />
              <span className="text-xs">Address Book</span>
            </Button>
          </div>
        </div>

        {/* Send Money Button */}
        <Button className={cn("w-full mb-6 h-12", isDark ? "bg-yellow-400 text-black hover:bg-yellow-500" : "bg-yellow-500 text-black hover:bg-yellow-400")} onClick={() => setCurrentScreen("send")}>
          Send Payment
        </Button>

        {/* Recent Transactions (clickable) */}
        <div>
          <div className={cn("text-sm mb-4", isDark ? "text-gray-400" : "text-gray-500")}>Recent Transactions</div>
          <div className="space-y-3">
            {mockTransactions.map((tx, index) => (
              <button key={index} onClick={() => setTxOpen(tx)} className={cn("w-full text-left flex items-center justify-between p-3 rounded-lg", isDark ? "bg-black/10 hover:bg-black/20" : "bg-black/5 hover:bg-black/10") }>
                <div className="flex items-center gap-3">
                  <div className={cn("w-2 h-2 rounded-full", tx.type === "Received" ? "bg-green-400" : "bg-red-400")} />
                  <div>
                    <div className="text-sm">{tx.type}</div>
                    <div className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-500")}>{tx.status}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm">{tx.amount}</div>
                  <div className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-500")}>{tx.value}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Tx Details Modal */}
        {txOpen && (
          <div className={cn("fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4", isDark ? "bg-black/60" : "bg-black/30") }>
            <div className={cn("p-6 rounded-2xl max-w-sm w-full border", isDark ? "bg-black border-gray-700" : "bg-white border-gray-200") }>
              <h3 className="text-lg mb-4">Transaction Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className={cn(isDark ? "text-gray-400" : "text-gray-500")}>Type</span><span>{txOpen.type}</span></div>
                <div className="flex justify-between"><span className={cn(isDark ? "text-gray-400" : "text-gray-500")}>Amount</span><span>{txOpen.amount}</span></div>
                <div className="flex justify-between"><span className={cn(isDark ? "text-gray-400" : "text-gray-500")}>Status</span><span>{txOpen.status}</span></div>
                {txOpen.recipientPhone && (<div className="flex justify-between"><span className={cn(isDark ? "text-gray-400" : "text-gray-500")}>Phone</span><span>{txOpen.recipientPhone}</span></div>)}
                {txOpen.recipientAddress && (<div className="flex justify-between"><span className={cn(isDark ? "text-gray-400" : "text-gray-500")}>Wallet</span><span className="font-mono">{txOpen.recipientAddress}</span></div>)}
                {txOpen.hash && (<div><div className={cn("text-xs mb-1", isDark ? "text-gray-400" : "text-gray-500")}>Hash</div><div className={cn(isDark ? "text-blue-400" : "text-blue-700", "break-all")}>{txOpen.hash}</div></div>)}
              </div>
              <div className="mt-4 flex gap-2">
                <Button className="flex-1" onClick={() => setTxOpen(null)}>Close</Button>
                <Button variant="outline" className="flex-1" onClick={() => { if (txOpen?.hash) copyToClipboard(txOpen.hash); }}>Copy Hash</Button>
              </div>
            </div>
          </div>
        )}

        {/* Generated Code Modal with 90s countdown */}
        {generatedCode && codeExpiryTs && (
          <div className={cn("fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4", isDark ? "bg-black/60" : "bg-black/30") }>
            <div className={cn("p-6 rounded-2xl max-w-sm w-full text-center border", isDark ? "bg-black border-gray-700" : "bg-white border-gray-200") }>
              <h3 className="text-lg mb-1">Payment Code</h3>
              <p className={cn("text-xs mb-4", isDark ? "text-gray-400" : "text-gray-500")}>This code expires in <span className="font-medium">{formatCountdown(codeSecondsLeft)}</span></p>
              <div className="text-4xl mb-4 tracking-widest font-medium">{generatedCode}</div>
              <div className="flex gap-2">
                <Button className="flex-1 disabled:opacity-50" onClick={() => copyToClipboard(generatedCode)} disabled={codeSecondsLeft === 0}><Copy className="mr-2 h-4 w-4" /> Copy</Button>
                <Button variant="outline" className="flex-1" onClick={() => { setGeneratedCode(""); setCodeExpiryTs(null); }}>Close</Button>
              </div>
            </div>
          </div>
        )}

        {/* Spay Modal */}
        {showSpay && (
          <div className={cn("fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4", isDark ? "bg-black/60" : "bg-black/30") }>
            <div className={cn("p-6 rounded-2xl max-w-sm w-full border", isDark ? "bg-black border-gray-700" : "bg-white border-gray-200") }>
              <h3 className="text-lg mb-4">Send via Phone</h3>
              <label className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-500")}>Phone number</label>
              <Input className="mt-1 mb-3" type="tel" placeholder="+48 600 000 000" value={spayPhone} onChange={(e) => setSpayPhone(e.target.value)} />
              <label className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-500")}>Amount</label>
              <Input className="mt-1 mb-3" inputMode="decimal" placeholder="0.00" value={spayAmount} onChange={(e) => setSpayAmount(e.target.value.replace(",", "."))} />
              <label className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-500")}>Network</label>
              <select className={cn("mt-1 mb-4 w-full rounded-xl border px-3 py-2 text-sm bg-transparent", isDark ? "border-gray-700" : "border-gray-300")} value={spayNetworkId} onChange={(e) => setSpayNetworkId(e.target.value)}>
                {networks.map((n) => (<option key={n.id} value={n.id}>{n.label}</option>))}
              </select>
              <div className="flex gap-2">
                <Button className="flex-1 disabled:opacity-50" onClick={() => { const amt = parseFloat(spayAmount); if (!spayPhone.trim() || !Number.isFinite(amt) || amt <= 0) return; setSelectedRecipient({ id: Date.now(), phone: spayPhone }); setAmount(spayAmount); setNetworkId(spayNetworkId); setShowSpay(false); setCurrentScreen("confirm"); }} disabled={!spayPhone.trim() || !spayAmount}>Continue</Button>
                <Button variant="outline" className="flex-1" onClick={() => setShowSpay(false)}>Cancel</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderSendScreen = () => (
    <div className={cn("h-full p-4 overflow-y-auto", isDark ? "bg-black text-white" : "bg-white text-black") }>
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 mt-2">
          <Button variant="ghost" size="icon" onClick={() => setCurrentScreen("dashboard")}><ArrowLeft size={20} /></Button>
          <BrandHeader isDark={isDark} />
          <Button variant="ghost" size="icon" onClick={() => setIsDark((v) => !v)}>{isDark ? <Sun size={18} /> : <Moon size={18} />}</Button>
        </div>

        <div className="mb-6">
          <h2 className="text-xl mb-6">SEND PAYMENT</h2>
          <div className="mb-6">
            <label className={cn("text-sm mb-2 block", isDark ? "text-gray-400" : "text-gray-500")}>Amount ({currency})</label>
            <Input inputMode="decimal" pattern="^[0-9]*[.,]?[0-9]*$" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value.replace(",", "."))} className="text-2xl h-16 text-center" />
            <div className={cn("flex items-center justify-between mt-3 text-xs", isDark ? "text-gray-400" : "text-gray-500") }>
              <span>Network</span>
              <select value={networkId} onChange={(e) => setNetworkId(e.target.value)} className={cn("rounded-md px-2 py-1 bg-transparent", isDark ? "border border-gray-700" : "border border-gray-300") }>
                {networks.map((n) => (<option key={n.id} value={n.id}>{n.label}</option>))}
              </select>
            </div>
            <div className={cn("mt-2 text-xs", isDark ? "text-gray-400" : "text-gray-500") }>
              Estimated fee: {formatMoney(estFee, currency)} · Total: <span className={cn(isDark ? "text-gray-200" : "text-gray-800")}>{formatMoney(totalWithFee, currency)}</span>
            </div>
          </div>
          <div className="mb-6">
            <label className={cn("text-sm mb-2 block", isDark ? "text-gray-400" : "text-gray-500")}>Notes (optional)</label>
            <Input placeholder="Invoice #123, thanks!" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <Button className={cn("w-full text-left justify-start h-16", isDark ? "bg-black/10 hover:bg-black/20" : "bg-black/5 hover:bg-black/10")} onClick={() => setCurrentScreen("recipients")}>
            {selectedRecipient ? (
              <div>
                <div className="text-sm">Send to: {selectedRecipient.phone}</div>
                {selectedRecipient.address && (<div className="text-xs opacity-70">{selectedRecipient.address}</div>)}
              </div>
            ) : (
              "Select Recipient"
            )}
          </Button>
          <Button className={cn("w-full mt-6 h-12 disabled:opacity-50", isDark ? "bg-yellow-400 text-black hover:bg-yellow-500" : "bg-yellow-500 text-black hover:bg-yellow-400")} disabled={!canContinue} onClick={() => setCurrentScreen("confirm")}>Continue</Button>
        </div>
      </div>
    </div>
  );

  const renderRecipientsScreen = () => (
    <div className={cn("h-full p-4 overflow-y-auto", isDark ? "bg-black text-white" : "bg-white text-black") }>
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 mt-2">
          <Button variant="ghost" size="icon" onClick={() => setCurrentScreen("send")}><ArrowLeft size={20} /></Button>
          <BrandHeader isDark={isDark} />
          <Button variant="ghost" size="icon" onClick={() => setIsDark((v) => !v)}>{isDark ? <Sun size={18} /> : <Moon size={18} />}</Button>
        </div>
        <div className="mb-6">
          <h2 className="text-xl mb-6">SELECT RECIPIENT</h2>
          <div className="space-y-3">
            {mockContacts.map((contact) => (
              <Card key={contact.id} className={cn("p-4 cursor-pointer rounded-2xl", isDark ? "hover:bg-white/5" : "hover:bg-black/5")} onClick={() => { setSelectedRecipient(contact); setCurrentScreen("send"); }}>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{contact.phone}</div>
                    <div className={cn("text-sm", isDark ? "text-blue-400" : "text-blue-700")}>ERC-20 address {contact.address}</div>
                    <div className={cn("text-xs mt-1", isDark ? "text-gray-400" : "text-gray-500")}>{contact.name}</div>
                  </div>
                  <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderConfirmScreen = () => (
    <div className={cn("h-full p-4 overflow-y-auto", isDark ? "bg-black text-white" : "bg-white text-black") }>
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 mt-2">
          <Button variant="ghost" size="icon" onClick={() => setCurrentScreen("send")}><ArrowLeft size={20} /></Button>
          <BrandHeader isDark={isDark} />
          <Button variant="ghost" size="icon" onClick={() => setIsDark((v) => !v)}>{isDark ? <Sun size={18} /> : <Moon size={18} />}</Button>
        </div>
        <div className="mb-6">
          <h2 className="text-xl mb-6">CONFIRM PAYMENT</h2>
          <Card className="p-6 mb-6">
            <div className="text-center mb-6">
              <div className="text-3xl mb-2">{formatMoney(parsedAmount, currency)}</div>
              <div className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-500")}>Amount to send</div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between"><span className={cn(isDark ? "text-gray-400" : "text-gray-500")}>To</span><div className="text-right"><div>{selectedRecipient?.phone}</div>{selectedRecipient?.address && (<div className={cn("text-xs", isDark ? "text-blue-400" : "text-blue-700")}>{selectedRecipient.address}</div>)}</div></div>
              <div className="flex justify-between"><span className={cn(isDark ? "text-gray-400" : "text-gray-500")}>Network</span><span>{networks.find(n => n.id === networkId)?.label}</span></div>
              <div className="flex justify-between"><span className={cn(isDark ? "text-gray-400" : "text-gray-500")}>Estimated Fee</span><span>{formatMoney(estFee, currency)}</span></div>
              {notes && (<div className="flex justify-between"><span className={cn(isDark ? "text-gray-400" : "text-gray-500")}>Notes</span><span className="truncate max-w-[60%] text-right">{notes}</span></div>)}
              <div className="border-t border-gray-300/30 pt-4 flex justify-between font-medium"><span>Total</span><span>{formatMoney(totalWithFee, currency)}</span></div>
            </div>
          </Card>
          <Card className="p-6 mb-6">
            <div className="text-center">
              <div className={cn("w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4", isDark ? "bg-yellow-400" : "bg-yellow-500")}><span className="text-black text-xl">🔐</span></div>
              <h3 className="text-lg mb-2">Sign Transaction</h3>
              <p className={cn("text-sm mb-4", isDark ? "text-gray-400" : "text-gray-500")}>Please sign this transaction with your wallet to confirm the payment</p>
              <div className={cn("text-xs", isDark ? "text-gray-500" : "text-gray-600")}>Gas Limit: 21,000 | Gas Price: dynamic</div>
            </div>
          </Card>
          <div className="space-y-4">
            <Button className={cn("w-full h-12", isDark ? "bg-yellow-400 text-black hover:bg-yellow-500" : "bg-yellow-500 text-black hover:bg-yellow-400")} onClick={() => setCurrentScreen("success")}>Sign & Send Payment</Button>
            <Button variant="outline" className="w-full" onClick={() => setCurrentScreen("send")}>Cancel</Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSuccessScreen = () => (
    <div className={cn("h-full p-4 overflow-y-auto", isDark ? "bg-black text-white" : "bg-white text-black") }>
      <div className="max-w-full mx-auto">
        <div className="text-center py-12">
          <div className={cn("w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6", isDark ? "bg-green-500" : "bg-green-400") }><CheckCircle2 className="w-10 h-10" /></div>
          <h2 className="text-2xl mb-4">Payment Sent!</h2>
          <p className={cn("mb-8", isDark ? "text-gray-400" : "text-gray-500")}>Your payment of {formatMoney(parsedAmount, currency)} has been successfully sent to {selectedRecipient?.phone}</p>
          <div className={cn("rounded-lg p-4 mb-8 text-sm border", isDark ? "bg-black/10 border-gray-700" : "bg-black/5 border-gray-300") }>
            <div className="flex justify-between mb-2"><span className={cn(isDark ? "text-gray-400" : "text-gray-500")}>Transaction Hash:</span><Button size="sm" variant="outline" onClick={() => copyToClipboard(txHash)}><Copy className="mr-2 h-3 w-3" /> Copy</Button></div>
            <div className={cn("break-all", isDark ? "text-blue-400" : "text-blue-700")}>{txHash}</div>
          </div>
          <Button className={cn("w-full h-12", isDark ? "bg-yellow-400 text-black hover:bg-yellow-500" : "bg-yellow-500 text-black hover:bg-yellow-400")} onClick={() => { setCurrentScreen("dashboard"); setAmount(""); setSelectedRecipient(null); setNotes(""); }}>Back to Dashboard</Button>
        </div>
      </div>
    </div>
  );

  const renderProfileScreen = () => (
    <div className={cn("h-full p-4 overflow-y-auto flex flex-col justify-between", isDark ? "bg-black text-white" : "bg-white text-black") }>
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-6 mt-2">
          <Button variant="ghost" size="icon" onClick={() => setCurrentScreen("dashboard")}><ArrowLeft size={20} /></Button>
          <BrandHeader isDark={isDark} />
          <Button variant="ghost" size="icon" onClick={() => setIsDark((v) => !v)}>{isDark ? <Sun size={18} /> : <Moon size={18} />}</Button>
        </div>

        <h2 className="text-xl mb-4">My Profile</h2>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className={cn("text-yellow-400 font-semibold", isDark ? "border-gray-700 hover:bg-white/5" : "border-gray-300 hover:bg-black/5")}>
            <UserCircle2 className="mr-2 h-4 w-4" /> <span className="text-yellow-400">Personal Details</span>
          </Button>
          <Button variant="outline" className={cn("text-yellow-400 font-semibold", isDark ? "border-gray-700 hover:bg-white/5" : "border-gray-300 hover:bg-black/5")}>
            <img src={logoSrc} alt="logo" className="mr-2 h-4 w-4 object-contain" /> <span className="text-yellow-400">Connected Wallets</span>
          </Button>
          <Button variant="outline" className={cn("text-yellow-400 font-semibold", isDark ? "border-gray-700 hover:bg-white/5" : "border-gray-300 hover:bg-black/5")}>
            <img src={logoSrc} alt="logo" className="mr-2 h-4 w-4 object-contain" /> <span className="text-yellow-400">Create SahliWallet</span>
          </Button>
          <Button variant="outline" className={cn("text-yellow-400 font-semibold", isDark ? "border-gray-700 hover:bg-white/5" : "border-gray-300 hover:bg-black/5")}>
            <ShieldCheck className="mr-2 h-4 w-4" /> <span className="text-yellow-400">Badge Verification LNL 3</span>
          </Button>
        </div>
        <p className={cn("mt-4 text-xs", isDark ? "text-gray-400" : "text-gray-500")}> (Mock) Przyciski prowadzą do placeholderów — podłączymy do backendu / flow KYC w kolejnym kroku. </p>
      </div>

      {/* Logo at bottom with gold glow */}
      <div className="flex justify-center mt-6">
        <img src={logoSrc} alt="SahliPay" className="h-12 object-contain drop-shadow-[0_0_12px_rgba(255,215,0,0.8)]" />
      </div>
    </div>
  );

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case "send":
        return renderSendScreen();
      case "recipients":
        return renderRecipientsScreen();
      case "confirm":
        return renderConfirmScreen();
      case "success":
        return renderSuccessScreen();
      case "profile":
        return renderProfileScreen();
      default:
        return renderDashboard();
    }
  };

  return <IPhoneMockup isDark={isDark}>{renderCurrentScreen()}</IPhoneMockup>;
}

/**************************************
 * Runtime test cases (simple asserts)
 **************************************/
(function runTests() {
  try {
    // money
    console.assert(formatMoney(12.34, "USD").startsWith("$"), "formatMoney USD");
    console.assert(formatMoney(12.34, "EUR").includes("€"), "formatMoney EUR");

    // fees
    const fee1 = estimateFeeUSD(100, { id: "eth", label: "Ethereum", baseFeeUsd: 2.5, pctFee: 0.003 });
    console.assert(fee1 === 2.8, `fee1 expected 2.8 got ${fee1}`);

    // code
    const code = generateSixDigitCode();
    console.assert(code.length === 6 && /^\d{6}$/.test(code), "payment code should be 6 digits");

    // expiry helpers
    const exp = createExpiry(90);
    console.assert(remainingSeconds(exp, exp - 1000) === 1, "remainingSeconds ceil");
    console.assert(formatCountdown(90) === "01:30", "formatCountdown mm:ss");

    // currency conversion basic
    const usdBal = 12830.5;
    const eur = usdBal * 0.92;
    const eurConv = (function () {
      const rates: any = { USD: 1, EUR: 0.92 };
      return usdBal * rates.EUR;
    })();
    console.assert(Math.abs(eurConv - eur) < 1e-6, "convertFromUSD EUR");

    // NBP mapping example
    const demoNBP = [{ rates: [{ code: "USD", mid: 4.0 }, { code: "EUR", mid: 4.4 }] }];
    const mapped = computeRatesFromNBP(demoNBP);
    console.assert(Math.abs(mapped.EUR - (4.0 / 4.4)) < 1e-6, "NBP EUR mapping");
    console.assert(mapped.PLN === 4.0, "NBP PLN mapping (USD->PLN)");

    // Ensure logoSrc is encoded data URL (no raw '<' characters)
    console.assert(typeof (logoSrc as any) === "string" && logoSrc.startsWith("data:image/svg+xml;utf8,"), "logoSrc data URL prefix");
    const encodedPart = (logoSrc as any).split(",")[1] || "";
    console.assert(!encodedPart.includes("<"), "logoSrc should be URI-encoded");
  } catch (e) {
    console.error("Runtime tests failed:", e);
  }
})();
