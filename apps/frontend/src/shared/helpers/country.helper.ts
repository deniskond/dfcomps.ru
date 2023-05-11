import { COUNTRIES_CONFIG } from '../configs/countries.config';
import { CountryInterface } from '../interfaces/country.interface';

export function getCountryFullNameByShortName(name: string): string {
  const country = COUNTRIES_CONFIG.COUNTRIES.find(({ shortName }: CountryInterface) => name === shortName);

  return country ? country.fullName : '';
}
