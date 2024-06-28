// src/app/services/date-util.service.ts
import { Injectable } from '@angular/core';
import { formatDistanceToNow, parseISO, isToday } from 'date-fns';

@Injectable({
  providedIn: 'root',
})
export class DateUtilService {
  constructor() {}

  getRelativeTime(dateString: string): string {
    const date = parseISO(dateString);
    if (isToday(date)) {
      return 'today';
    }
    return formatDistanceToNow(date, { addSuffix: true });
  }

  getCurrentDateTimeString(): string {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  calculateAge(DateOfBirth: string) {
    const today = new Date();

    const dob = new Date(DateOfBirth);
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    return age;
  }
}
