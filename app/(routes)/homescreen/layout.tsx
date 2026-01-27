import Navbar from "./_components/navbarr";

export default function HomeScreenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <Navbar />
    </>
  );
}
