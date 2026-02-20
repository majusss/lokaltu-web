import NFCReader from "./_components/NFCReader";

export default function ScanPage() {
  return (
    <div className="relative min-h-screen bg-neutral-50">
      <div className="min-h-screen w-full pb-20 pt-4">
        <NFCReader />
      </div>
    </div>
  );
}