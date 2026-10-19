// Layout for the public website: adds the ticket bar above every page.
// (The voting and admin screens live outside this group, so they don't get it.)
import TicketBar from "@/components/ticket_bar";

export default function SiteLayout({ children }) {
  return (
    <>
      <TicketBar />
      {children}
    </>
  );
}
