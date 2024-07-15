export class Person {
  PersonID?: number | null;
  FirstName?: string | null;
  LastName?: string | null;
  GenderID?: number | null;
  PhoneNumber?: string | null;
  Email?: string | null;
  DateOfBirth?: string | null;
  CountryID?: number | null;

  constructor(
    PersonID?: number | null,
    FirstName?: string | null,
    LastName?: string | null,
    GenderID?: number | null,
    PhoneNumber?: string | null,
    Email?: string | null,
    CountryID?: number | null,
  ) {
    this.PersonID = PersonID || null;
    this.FirstName = FirstName || null;
    this.LastName = LastName || null;
    this.GenderID = GenderID || null;
    this.PhoneNumber = PhoneNumber || null;
    this.Email = Email || null;
    this.CountryID = CountryID || null;
  }
}
