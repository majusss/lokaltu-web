import noise from "@/app/assets/sign-in/noise.png";
import Image from "next/image";
import NFCReader from "./_components/NFCReader";

export default function ScanPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-white">
      {/* Decorative gradient background similar to homescreen */}
      <div className="fixed top-0 left-0 -z-10 h-80 w-full bg-[linear-gradient(249.58deg,#61F681_0%,#49BF12_49.21%,#DBC443_97.83%)] opacity-10" />

      <div className="fixed inset-0 -z-20">
        <div className="absolute inset-0 bg-neutral-50/30" />
        <Image
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.05]"
          src={noise}
          alt="Background noise"
        />
      </div>

      <div className="relative mx-auto max-w-lg px-6 pt-10 pb-24">
        <NFCReader />
      </div>
    </div>
  );
}
