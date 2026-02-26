import NFCReader from "./_components/NFCReader";

export default function ScanPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-white">
      <div className="relative mx-auto max-w-lg px-6 pt-10 pb-24">
        <NFCReader />
      </div>
    </div>
  );
}
