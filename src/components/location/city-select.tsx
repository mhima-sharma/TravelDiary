"use client";

import { SearchableSelect } from "@/components/ui/searchable-select";
import { useCities } from "@/hooks/use-locations";

export interface CitySelectProps {
  country: string;
  state: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  name?: string;
  id?: string;
  placeholder?: string;
}

export function CitySelect({ country, state, value, onChange, disabled, name, id, placeholder = "Select city" }: CitySelectProps) {
  const { options, isLoading, error, retry } = useCities(country, state);

  return (
    <SearchableSelect
      id={id}
      name={name}
      aria-label="City"
      value={value}
      onChange={onChange}
      options={options}
      disabled={disabled || !country || !state}
      loading={isLoading}
      error={error}
      onRetry={retry}
      placeholder={!country ? "Select a country first" : !state ? "Select a state first" : placeholder}
      searchPlaceholder="Search cities…"
      emptyMessage="No cities found."
    />
  );
}
