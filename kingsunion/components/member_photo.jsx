import PhotoSlot from "@/components/photo_slot";

// Committee photo, or the Union crest when no photo has been added yet.
export default function MemberPhoto({ member, className = "" }) {
  return (
    <PhotoSlot
      src={member.image}
      alt={member.name || member.title}
      aspect="aspect-square"
      className={className}
    />
  );
}
