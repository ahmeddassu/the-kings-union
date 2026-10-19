import { getKingswayPosts } from "@/lib/kingsway";

function formatDate(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
  });
}

// The crest sits behind each cover, so a missing image still looks intentional.
function Cover({ src, className = "" }) {
  return (
    <div className={`relative overflow-hidden bg-[#2a0101] ${className}`}>
      <img
        src="/KUArmsFinal.png"
        alt=""
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-2/3 opacity-15 brightness-0 invert"
      />
      {src && (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center group-hover:scale-[1.03] transition-transform duration-500"
          style={{ backgroundImage: `url("${src}")` }}
        />
      )}
    </div>
  );
}

export default async function KingswayPosts() {
  const [lead, ...rest] = await getKingswayPosts(6);
  if (!lead) return null;

  return (
    <div className="space-y-10">
      {/* Lead article */}
      <a
        href={lead.link}
        target="_blank"
        rel="noopener noreferrer"
        className="group grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-8 items-center"
      >
        <Cover src={lead.image} className="md:col-span-7 aspect-[16/9] rounded-lg" />
        <div className="md:col-span-5 min-w-0">
          <p className="text-xs uppercase tracking-widest text-[#d4af37]">
            Latest · {formatDate(lead.date)}
          </p>
          <h3 className="title mt-3 text-2xl sm:text-3xl md:text-4xl font-bold leading-tight text-balance group-hover:text-[#d4af37] transition-colors duration-200">
            {lead.title}
          </h3>
          <p className="mt-4 text-base sm:text-lg leading-relaxed text-white/80">{lead.description}</p>
          <p className="mt-5 text-sm font-bold text-[#d4af37]">Read on Substack →</p>
        </div>
      </a>

      {/* More articles */}
      {rest.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10 border-t border-[#d4af37] pt-10">
          {rest.map((p) => (
            <a
              key={p.link}
              href={p.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col min-w-0"
            >
              <Cover src={p.image} className="aspect-[3/2] rounded-lg" />
              <p className="mt-4 text-xs text-white/55">{formatDate(p.date)}</p>
              <h3 className="title mt-1 text-lg sm:text-xl font-bold leading-snug group-hover:text-[#d4af37] transition-colors duration-200">
                {p.title}
              </h3>
              <p className="mt-2 text-sm sm:text-base leading-relaxed text-white/70 line-clamp-3">{p.description}</p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
