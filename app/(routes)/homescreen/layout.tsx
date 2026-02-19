import Navbar from "./_components/navbar";

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
