import Image, { ImageProps } from "next/image";
import { encodeImagePath } from "@/lib/site-images";

type SiteImageProps = Omit<ImageProps, "src"> & {
  src: string;
};

export default function SiteImage({ src, alt, ...props }: SiteImageProps) {
  return <Image src={encodeImagePath(src)} alt={alt} {...props} />;
}
