type PageHeaderProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
};

export function PageHeader({ eyebrow, title, subtitle }: PageHeaderProps) {
  return (
    <div className="px-6 pb-4 pt-1">
      <p className="text-[11px] font-semibold tracking-[0.3px] text-[#6c757d]">
        {eyebrow}
      </p>
      <h2 className="mt-1 text-[30px] leading-none font-semibold tracking-tight text-[#212529]">
        {title}
      </h2>
      <p className="mt-1 text-xs text-[#6c757d]">{subtitle}</p>
    </div>
  );
}
