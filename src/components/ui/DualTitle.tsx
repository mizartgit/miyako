type DualTitleProps = {
  nameJa?: string;
  nameEn: string;
  className?: string;
  subClassName?: string;
};

export function DualTitle({
  nameJa,
  nameEn,
  className = "",
  subClassName = "mt-1 block text-[0.72em] font-normal leading-snug tracking-normal opacity-75",
}: DualTitleProps) {
  if (!nameJa) {
    return <span className={className}>{nameEn}</span>;
  }

  return (
    <span className={className}>
      <span className="block">{nameJa}</span>
      <span className={subClassName}>{nameEn}</span>
    </span>
  );
}
