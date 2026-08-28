type EmptyStateProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-dashed border-line bg-paper px-6 py-12 text-center text-ink shadow-[0_8px_28px_rgb(0_0_0/0.35)]">
      <p className="font-heading text-lg text-ink">{title}</p>
      {description && (
        <p className="mt-2 text-sm text-ink-muted">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
