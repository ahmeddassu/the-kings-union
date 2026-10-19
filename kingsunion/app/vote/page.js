import VoteHeader from "@/components/voting/vote_header";
import CodeEntry from "@/components/voting/code_entry";
import { basePath } from "@/lib/hosts";

export const dynamic = "force-dynamic";

export default async function VoteHome({ searchParams }) {
  const base = await basePath("vote");
  const { notfound } = (await searchParams) || {};
  return (
    <>
      <VoteHeader home={base || "/"} />
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-12 text-center">
        <p className="text-xs sm:text-sm uppercase tracking-widest mb-4 text-[#d4af37]">Have your say</p>
        <h1 className="title text-4xl sm:text-6xl font-bold leading-tight">Vote in the debate.</h1>
        <p className="mt-4 mb-10 max-w-md text-base sm:text-lg text-white/75">
          Scan the QR code on the screen, or type the 5-digit code shown in the chamber.
        </p>
        <CodeEntry base={base} error={notfound ? "We couldn’t find a debate with that code. Check the screen and try again." : null} />
      </main>
    </>
  );
}
