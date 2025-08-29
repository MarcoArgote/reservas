"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Appointment } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";

const STORAGE_KEY = 'citaFacilAppointments';

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedAppointments = localStorage.getItem(STORAGE_KEY);
      if (storedAppointments) {
        const parsedAppointments: Appointment[] = JSON.parse(storedAppointments);
        setAppointments(parsedAppointments);
        
        // Schedule notifications for existing appointments on initial load
        parsedAppointments.forEach(appt => scheduleNotification(appt));
      }
    } catch (error) {
      console.error("Failed to parse appointments from localStorage", error);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  // Empty dependency array is intentional to run only once on mount.

  const scheduleNotification = useCallback((appointment: Appointment) => {
    const appointmentTime = new Date(`${appointment.date}T${appointment.time}`).getTime();
    const notificationTime = appointmentTime - 15 * 60 * 1000;
    const now = Date.now();

    if (notificationTime > now) {
      const delay = notificationTime - now;
      setTimeout(() => {
        toast({
          title: "🗓️ Upcoming Appointment",
          description: `Your appointment is in 15 minutes.`,
        });
      }, delay);
    }
  }, [toast]);
  
  const addAppointment = useCallback((newAppointment: Omit<Appointment, 'id'>) => {
    const appointmentWithId = { ...newAppointment, id: crypto.randomUUID() };
    
    setAppointments(prev => {
      const updatedAppointments = [...prev, appointmentWithId]
        .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());
      
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAppointments));
      } catch (error) {
        console.error("Failed to save appointments to localStorage", error);
      }
      
      scheduleNotification(appointmentWithId);

      return updatedAppointments;
    });
  }, [scheduleNotification]);
  
  return { appointments, addAppointment };
}
