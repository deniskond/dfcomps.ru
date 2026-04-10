import { faker } from '@faker-js/faker';

const POSTGRES_INT_MAX = 2147483647;

export function randomInt(): number {
  return faker.number.int({ max: POSTGRES_INT_MAX });
}
