export interface CalendarEventConfig {
  title: string
  details: string
  location: string
  recurrence: string
  buttonText: string
  dateLabel: string
  /**
   * The email address(es) to automatically invite as guests (comma-separated if multiple)
   */
  inviteEmail: string
  /**
   * Show status as busy on the calendar
   */
  showAsBusy: boolean
}

export const calendarConfig: CalendarEventConfig = {
  title: 'Our Anniversary',
  details: 'Annual celebration of our special day',
  location: 'My house <3',
  recurrence: 'RRULE:FREQ=YEARLY',
  buttonText: 'Add to Google Calendar',
  dateLabel: 'Anniversary Date:',
  inviteEmail: 'your-email@example.com',
  showAsBusy: true,
}
