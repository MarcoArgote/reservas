export type Appointment = {
  id: string;
  date: string;
  time: string;
  reason: string;
};

export type User = {
  id: string;
  email: string;
  password?: string; // Note: In a real app, never store plaintext passwords! This is for demo purposes.
};
