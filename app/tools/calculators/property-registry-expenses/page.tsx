import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RegistryCalculator from "@/components/registry/RegistryCalculator";

export const metadata: Metadata = {
  title: "Chaudhary Law Associates | Registry Expenses Calculator",
  description:
    "Calculate buyer and seller property registration taxes, stamp duty, TMA fees, and FBR withholding taxes in Pakistan.",
};

export default function RegistryPage() {
  return (
    <>
      <Header active="registry" />
      <RegistryCalculator />
      <Footer showSocial />
    </>
  );
}
