"use client";

import { SearchableSelect } from "@/components/ui/searchable-select";
import { useCountries } from "@/hooks/use-locations";

export interface CountrySelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  name?: string;
  id?: string;
  placeholder?: string;
}

export function CountrySelect({ value, onChange, disabled, name, id, placeholder = "Select country" }: CountrySelectProps) {
  const { options, isLoading, error, retry } = useCountries();

  return (
    <SearchableSelect
      id={id}
      name={name}
      aria-label="Country"
      value={value}
      onChange={onChange}
      options={options}
      disabled={disabled}
      loading={isLoading}
      error={error}
      onRetry={retry}
      placeholder={placeholder}
      searchPlaceholder="Search countries…"
      emptyMessage="No countries found."
    />
  );
}
