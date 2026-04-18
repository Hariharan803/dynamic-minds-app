import Link from "next/link";

type Note = {
  id: string;
  title: string;
  updatedAt: Date;
};

type Props = {
  note: Note;
  href: string;
};

export function NoteCard({ note, href }: Props) {
  return (
    <Link
      href={href}
      className="block rounded-xl border border-[#d9e0f4] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[#b9c8f5] hover:shadow-md"
    >
      <h3 className="font-semibold text-[#1f2454]">{note.title}</h3>
      <p className="mt-2 text-xs text-[#6a7191]">
        Updated {new Date(note.updatedAt).toLocaleString()}
      </p>
    </Link>
  );
}
