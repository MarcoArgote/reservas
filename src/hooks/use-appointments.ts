"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Appointment } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";

const getStorageKey = (userId?: string) => `citaFacilAppointments_${userId || 'guest'}`;

export function useAppointments(userId?: string) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const { toast } = useToast();
  const STORAGE_KEY = getStorageKey(userId);

  useEffect(() => {
    if (!userId) return;
    try {
      const storedAppointments = localStorage.getItem(STORAGE_KEY);
      if (storedAppointments) {
        const parsedAppointments: Appointment[] = JSON.parse(storedAppointments);
        setAppointments(parsedAppointments);
        
        parsedAppointments.forEach(appt => scheduleNotification(appt));
      } else {
        setAppointments([]);
      }
    } catch (error) {
      console.error("Failed to parse appointments from localStorage", error);
    }
  }, [userId, STORAGE_KEY]); // Re-run when userId changes

  const scheduleNotification = useCallback((appointment: Appointment) => {
    const appointmentTime = new Date(`${appointment.date}T${appointment.time}`).getTime();
    const notificationTime = appointmentTime - 15 * 60 * 1000;
    const now = Date.now();

    if (notificationTime > now) {
      const delay = notificationTime - now;
      setTimeout(() => {
        toast({
          title: "🗓️ Cita próxima",
          description: `Tu cita es en 15 minutos.`,
        });
      }, delay);
    }
  }, [toast]);
  
  const addAppointment = useCallback((newAppointment: Omit<Appointment, 'id'>) => {
    if(!userId) return;

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
  }, [userId, STORAGE_KEY, scheduleNotification]);

  const deleteAppointment = useCallback((id: string) => {
    if(!userId) return;

    setAppointments(prev => {
        const updatedAppointments = prev.filter(appt => appt.id !== id);
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAppointments));
            toast({
              title: "✅ Cita Eliminada",
              description: "Tu cita ha sido eliminada exitosamente.",
            });
        } catch (error) {
            console.error("Failed to save appointments to localStorage", error);
            toast({
              variant: 'destructive',
              title: "Error",
              description: "No se pudo eliminar la cita.",
            });
        }
        return updatedAppointments;
    });
  }, [userId, STORAGE_KEY, toast]);
  
  return { appointments, addAppointment, deleteAppointment };
}
