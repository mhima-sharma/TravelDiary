"use client";

import { useState } from "react";
import { CountrySelect } from "@/components/location/country-select";
import { StateSelect } from "@/components/location/state-select";
import { CitySelect } from "@/components/location/city-select";

interface LocationFilterFieldsProps {
  initialCountry?: string;
  initialState?: string;
  initialCity?: string;
}

/**
 * Location filters for the native GET search form on /explore. Each select renders a
 * hidden input (via `name`) so the values submit along with the rest of the filter fields.
 */
export function LocationFilterFields({ initialCountry = "", initialState = "", initialCity = "" }: LocationFilterFieldsProps) {
  const [country, setCountry] = useState(initialCountry);
  const [state, setState] = useState(initialState);
  const [city, setCity] = useState(initialCity);

  return (
    <>
      <div className="w-[160px]">
        <CountrySelect
          name="country"
          value={country}
          onChange={(v) => {
            setCountry(v);
            setState("");
            setCity("");
          }}
          placeholder="Country"
        />
      </div>
      <div className="w-[160px]">
        <StateSelect
          name="state"
          country={country}
          value={state}
          onChange={(v) => {
            setState(v);
            setCity("");
          }}
          placeholder="State"
        />
      </div>
      <div className="w-[160px]">
        <CitySelect name="city" country={country} state={state} value={city} onChange={setCity} placeholder="City" />
      </div>
    </>
  );
}
