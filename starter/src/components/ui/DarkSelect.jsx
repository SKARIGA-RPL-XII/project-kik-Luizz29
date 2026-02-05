import { Listbox, Transition } from "@headlessui/react";
import { Fragment } from "react";
import {
  CheckIcon,
  ChevronUpDownIcon,
} from "@heroicons/react/20/solid";

/**
 * DarkSelect (Tailux-compatible, non-transparent)
 *
 * props:
 * - label?: string
 * - placeholder?: string
 * - value: number | string | null   (PRIMITIVE)
 * - options: { value: number | string, label: string }[]
 * - onChange: (value) => void
 */
export default function DarkSelect({
  label,
  placeholder = "Pilih...",
  value,
  options = [],
  onChange,
}) {
  const selected = options.find((o) => o.value === value);

  return (
    <div className="w-full space-y-1">
      {/* LABEL */}
      {label && (
        <label className="text-sm font-medium text-muted">
          {label}
        </label>
      )}

      <Listbox value={value} onChange={onChange}>
        <div className="relative">
          {/* BUTTON */}
          <Listbox.Button
            className="
              relative w-full cursor-pointer
              rounded-lg border border-divider
              bg-background !bg-white dark:!bg-[#0f1115]
              px-4 py-2 pr-10
              text-left text-sm text-foreground
              focus:outline-none focus:ring-2 focus:ring-primary/40
              hover:bg-muted/30 dark:hover:bg-[#151821]
            "
          >
            <span className="block truncate">
              {selected ? (
                selected.label
              ) : (
                <span className="text-muted">
                  {placeholder}
                </span>
              )}
            </span>

            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <ChevronUpDownIcon className="h-4 w-4 text-muted" />
            </span>
          </Listbox.Button>

          {/* OPTIONS */}
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options
              className="
                absolute z-[9999] mt-1 max-h-60 w-full overflow-auto
                rounded-lg
                bg-background !bg-white dark:!bg-[#0f1115]
                text-foreground
                border border-divider
                shadow-2xl
                text-sm focus:outline-none
              "
            >
              {options.length === 0 && (
                <div className="px-4 py-2 text-sm text-muted">
                  Tidak ada data
                </div>
              )}

              {options.map((opt) => (
                <Listbox.Option
                  key={opt.value}
                  value={opt.value}
                  className={({ active }) =>
                    `
                      cursor-pointer select-none px-4 py-2
                      transition
                      ${
                        active
                          ? "bg-primary/20 text-primary"
                          : "text-foreground"
                      }
                    `
                  }
                >
                  {({ selected }) => (
                    <div className="flex items-center gap-2">
                      {selected && (
                        <CheckIcon className="h-4 w-4 text-primary" />
                      )}
                      <span
                        className={`truncate ${
                          selected ? "font-semibold" : ""
                        }`}
                      >
                        {opt.label}
                      </span>
                    </div>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
}
