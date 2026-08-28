import { buttonClassName } from "@/components/ui/Button";
import Link from "next/link";

export function CreateItineraryButton() {
  return (
    <Link href="/itineraries/new" className={buttonClassName({ variant: "primary" })}>
      しおり作成 ＋
    </Link>
  );
}
