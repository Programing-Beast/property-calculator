import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import InheritanceCalculator from "@/components/inheritance/InheritanceCalculator";

export const metadata: Metadata = {
  title: "Chaudary Property Advisor | Inheritance Calculator",
  description:
    "Calculate legal inheritance shares under Fiqh Hanafi and the Muslim Family Laws Ordinance 1961 (MFLO Section 4).",
};

export default function InheritancePage() {
  return (
    <>
      <Header active="inheritance" />
      <InheritanceCalculator />
      <Footer showSocial />
    </>
  );
}
