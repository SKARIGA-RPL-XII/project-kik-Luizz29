import { useRef } from "react";

export default function AutoTextarea({
  label,
  value,
  onChange,
  placeholder,
}) {
  const ref = useRef(null);

  const handleChange = (e) => {
    const el = ref.current;

    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";

    onChange(e);
  };

  return (
    <div className="space-y-1">
      <label className="text-sm">{label}</label>

      <textarea
        ref={ref}
        rows={1}
        value={value}
        placeholder={placeholder}
        onChange={handleChange}
        className="
          w-full resize-none overflow-hidden
          rounded-lg px-3 py-2
          bg-card border border-divider
          focus:ring-2 focus:ring-primary/40
        "
      />
    </div>
  );
}
