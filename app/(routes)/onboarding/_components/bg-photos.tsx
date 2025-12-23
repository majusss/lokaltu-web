import img1 from "@/app/assets/onboarding/1.jpg";
import img2 from "@/app/assets/onboarding/2.jpg";
import img3 from "@/app/assets/onboarding/3.jpg";
import img4 from "@/app/assets/onboarding/4.jpg";
import img5 from "@/app/assets/onboarding/5.jpg";
import img6 from "@/app/assets/onboarding/6.jpg";
import img7 from "@/app/assets/onboarding/7.jpg";
import img8 from "@/app/assets/onboarding/8.jpg";
import img9 from "@/app/assets/onboarding/9.jpg";

import Image from "next/image";

export default function BgPhotos() {
  const images = [img1, img2, img3, img4, img5, img6, img7, img8, img9];
  const doubleImagesA = [...images, ...images].sort(() => 0.5 - Math.random());
  const doubleImagesB = [...images, ...images].sort(() => 0.5 - Math.random());
  const doubleImagesC = [...images, ...images].sort(() => 0.5 - Math.random());

  return (
    <div className="absolute inset-0 -z-10 flex gap-2 overflow-hidden p-2">
      <div className="animate-scroll-down flex flex-1 flex-col gap-2">
        {doubleImagesA.map((src, index) => (
          <Image
            key={`col1-${index}`}
            src={src}
            alt=""
            className="max-h-100 min-h-37.5 w-full shrink-0 rounded-lg object-cover"
          />
        ))}
      </div>
      <div className="animate-scroll-up flex flex-1 flex-col gap-2">
        {doubleImagesB.map((src, index) => (
          <Image
            key={`col2-${index}`}
            src={src}
            alt=""
            className="max-h-100 min-h-37.5 w-full shrink-0 rounded-lg object-cover"
          />
        ))}
      </div>
      <div className="animate-scroll-down flex flex-1 flex-col gap-2">
        {doubleImagesC.map((src, index) => (
          <Image
            key={`col3-${index}`}
            src={src}
            alt=""
            className="max-h-100 min-h-37.5 w-full shrink-0 rounded-lg object-cover"
          />
        ))}
      </div>
    </div>
  );
}
