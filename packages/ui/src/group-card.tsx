import Link from "next/link";

type Props = {
  id: string;
  name: string;
  description?: string | null;
  role?: string;
};

export function GroupCard({ id, name, description, role }: Props) {
  return (
    <Link
      href={`/groups/${id}`}
      className="block rounded-xl border border-[#d9e0f4] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[#b9c8f5] hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-[#1f2454]">{name}</h3>
        {role ? (
          <span className="rounded-full bg-[#edf0ff] px-2 py-0.5 text-xs text-[#353d76]">
            {role}
          </span>
        ) : null}
      </div>
      {description ? <p className="mt-2 line-clamp-2 text-sm text-[#5d6485]">{description}</p> : null}
    </Link>
  );
}
