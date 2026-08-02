import type { AppProps } from "next/app";
import "@/styles/globals.css";
import "@/styles/landing.css";
import "@/styles/persona.css";
import "@/styles/service.css";
import "@/styles/portfolio.css";
import "@/styles/tax-saving.css";
import "@/styles/tax-saving-vat-guide.css";
import "@/styles/tax-saving-guide.css";
import "@/styles/tax-saving-guide-detail.css";
import "@/styles/interest.css";
import "@/styles/support-program-detail.css";
import "@/styles/support-program-list.css";
import "@/styles/support-program-peer-analysis.css";
import "@/styles/support-program-apply.css";
import "@/styles/support-program-apply-complete.css";
import "@/styles/support-program-apply-status.css";
import "@/styles/support-program-apply-consult.css";
import "@/styles/support-program-apply-consult-complete.css";

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
