import { redirect } from "next/navigation";

/** Legacy URL: Charity nav now opens the Coming soon page. */
export default function CharityPage() {
  redirect("/coming-soon");
}
