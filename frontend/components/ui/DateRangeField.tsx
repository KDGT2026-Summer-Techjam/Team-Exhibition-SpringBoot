import { TextField } from "@/components/ui/TextField";

type DateRangeFieldProps = {
  startLabel?: string;
  endLabel?: string;
  startValue?: string;
  endValue?: string;
  onStartChange?: (value: string) => void;
  onEndChange?: (value: string) => void;
  error?: string;
};

export function DateRangeField({
  startLabel = "開始日",
  endLabel = "終了日",
  startValue,
  endValue,
  onStartChange,
  onEndChange,
  error,
}: DateRangeFieldProps) {
  const rangeError =
    error ??
    (startValue && endValue && endValue < startValue
      ? "終了日は開始日以降にしてください"
      : undefined);

  return (
    <div className="space-y-1">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label={startLabel}
          type="date"
          value={startValue}
          onChange={(e) => onStartChange?.(e.target.value)}
        />
        <TextField
          label={endLabel}
          type="date"
          value={endValue}
          onChange={(e) => onEndChange?.(e.target.value)}
        />
      </div>
      {rangeError && <p className="text-sm text-danger">{rangeError}</p>}
    </div>
  );
}
