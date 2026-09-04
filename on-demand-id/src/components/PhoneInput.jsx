import { useState } from "react";
import {
  getCountries,
  getCountryCallingCode,
  Metadata,
} from "libphonenumber-js/core";
import metadata from "libphonenumber-js/metadata.max.json";

const countryNames = new Intl.DisplayNames(["en"], {
  type: "region",
});
const countries = getCountries(metadata);

function getCountryFlag(country) {
  return country
    .toUpperCase()
    .replace(/./g, (char) =>
      String.fromCodePoint(127397 + char.charCodeAt())
    );
}

function getMaximumMobileLength(country) {
  const phoneMetadata = new Metadata(metadata);
  phoneMetadata.selectNumberingPlan(country);

  const mobileLengths = phoneMetadata.type("MOBILE")?.possibleLengths();
  const possibleLengths =
    mobileLengths ?? phoneMetadata.numberingPlan.possibleLengths();

  return Math.max(...possibleLengths);
}

function PhoneInput({phoneNumber,setPhoneNumber,selectedCountry,setSelectedCountry}) {
  const maximumLength = getMaximumMobileLength(selectedCountry);

  function handlePhoneChange(e) {
    const value = e.target.value;
    const digitsOnly = value.replace(/\D/g, "");
    const limitedNumber = digitsOnly.slice(0, maximumLength);
    setPhoneNumber(limitedNumber);
  }

  function handleCountryChange(e) {
    const newCountry = e.target.value;
    const newMaximumLength = getMaximumMobileLength(newCountry);

    setSelectedCountry(newCountry);

    setPhoneNumber((currentNumber) =>
      currentNumber.slice(0, newMaximumLength)
    );
  }

  return (
    <div className="phone-input">
      <label htmlFor="phone">
        Enter User's Mobile Number
      </label>

      <div className="phone-control">
        <label className="country-label" htmlFor="country">
          Select Country
        </label>

        <div className="country-picker">
          <span className="selected-flag" aria-hidden="true">
            {getCountryFlag(selectedCountry)}
          </span>

          <select
            id="country"
            value={selectedCountry}
            onChange={handleCountryChange}
            aria-label="Select country"
          >
            {countries.map((country) => (
              <option key={country} value={country}>
                {getCountryFlag(country)} {countryNames.of(country)} (+
                {getCountryCallingCode(country, metadata)})
              </option>
            ))}
          </select>
        </div>

        <input
          id="phone"
          type="tel"
          placeholder="Enter a phone number"
          value={phoneNumber}
          onChange={handlePhoneChange}
        />
      </div>
    </div>
  );
}

export default PhoneInput;
