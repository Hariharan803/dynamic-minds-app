type Internship = {
  id: string;
  company: string;
  position: string;
  status: string;
  appliedDate: Date;
};

type Props = {
  internship: Internship;
};

export function InternshipCard({ internship }: Props) {
  return (
    <article className="rounded-xl border border-[#d9e0f4] bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-semibold text-[#1f2454]">{internship.company}</h3>
        <span className="rounded-full bg-[#ccfff2] px-2 py-0.5 text-xs font-medium text-[#1f5a50]">
          {internship.status}
        </span>
      </div>
      <p className="mt-1 text-sm text-[#4f5679]">{internship.position}</p>
      <p className="mt-2 text-xs text-[#6a7191]">
        Applied {new Date(internship.appliedDate).toLocaleDateString()}
      </p>
    </article>
  );
}
