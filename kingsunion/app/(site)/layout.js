// Layout for the public website: adds the live-vote bar (only while voting is
// open), the ticket bar and the visitor counter to every page.
// (The voting and admin screens live outside this group, so they don't get it.)
import TicketBar from "@/components/ticket_bar";
import LiveBar from "@/components/live_bar";
import PageView from "@/components/page_view";

export default function SiteLayout({ children }) {
  return (
    <>
      <LiveBar />
      <TicketBar />
      {children}
      <PageView />
    </>
  );
}
