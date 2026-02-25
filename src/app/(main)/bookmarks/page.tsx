import { redirect } from "next/navigation";

export default function BookmarksPage() {
  redirect("/profile?tab=bookmarks");
}
