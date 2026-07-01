"use client";

import { SearchableSelect } from "@/components/ui/searchable-select";
import { useStates } from "@/hooks/use-locations";

export interface StateSelectProps {
  country: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  name?: string;
  id?: string;
  placeholder?: string;
}

export function StateSelect({ country, value, onChange, disabled, name, id, placeholder = "Select state" }: StateSelectProps) {
  const { options, isLoading, error, retry } = useStates(country);

  return (
    <SearchableSelect
      id={id}
      name={name}
      aria-label="State"
      value={value}
      onChange={onChange}
      options={options}
      disabled={disabled || !country}
      loading={isLoading}
      error={error}
      onRetry={retry}
      placeholder={country ? placeholder : "Select a country first"}
      searchPlaceholder="Search states…"
      emptyMessage="No states found."
    />
  );
}
