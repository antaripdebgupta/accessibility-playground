import { Header } from "@/components/Header";
import "../homepage.css";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main id="main-content" className="flex flex-1 flex-col">
        {children}
      </main>
    </>
  );
}
