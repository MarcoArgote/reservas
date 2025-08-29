"use client";

import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, Clock, BookOpen, History } from 'lucide-react';
import type { Appointment } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from './ui/scroll-area';

interface AppointmentHistoryProps {
  appointments: Appointment[];
}

function AppointmentItem({ appointment }: { appointment: Appointment }) {
  const appointmentDate = parseISO(`${appointment.date}T${appointment.time}`);
  
  return (
    <div className="p-4 border-b last:border-b-0">
      <div className="flex items-start space-x-4">
        <div className="flex flex-col items-center justify-center p-2 rounded-md bg-muted text-muted-foreground">
          <span className="text-sm font-bold">{format(appointmentDate, 'MMM', { locale: es })}</span>
          <span className="text-2xl font-bold">{format(appointmentDate, 'dd')}</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-medium">{format(appointmentDate, 'p', { locale: es })}</p>
          </div>
          <div className="flex items-start space-x-2">
            <BookOpen className="h-4 w-4 text-muted-foreground mt-0.5" />
            <p className="text-sm text-muted-foreground">{appointment.reason}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AppointmentList({ appointments, emptyMessage }: { appointments: Appointment[]; emptyMessage: string }) {
  if (appointments.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {appointments.map(app => (
        <AppointmentItem key={app.id} appointment={app} />
      ))}
    </div>
  );
}

export function AppointmentHistory({ appointments }: AppointmentHistoryProps) {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historial de Citas</CardTitle>
          <CardDescription>Cargando tu historial de citas...</CardDescription>
        </CardHeader>
        <CardContent className="h-[200px] flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Cargando...</div>
        </CardContent>
      </Card>
    );
  }

  const now = new Date();
  const upcomingAppointments = appointments
    .filter(app => new Date(`${app.date}T${app.time}`) >= now)
    .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());

  const pastAppointments = appointments
    .filter(app => new Date(`${app.date}T${app.time}`) < now)
    .sort((a, b) => new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime());

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de Citas</CardTitle>
        <CardDescription>Mira tus citas próximas y pasadas.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upcoming">
              <Calendar className="mr-2 h-4 w-4" />
              Próximas ({upcomingAppointments.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              <History className="mr-2 h-4 w-4" />
              Pasadas ({pastAppointments.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="upcoming">
            <ScrollArea className="h-[400px] border rounded-md">
                <AppointmentList
                    appointments={upcomingAppointments}
                    emptyMessage="No tienes citas próximas."
                />
            </ScrollArea>
          </TabsContent>
          <TabsContent value="past">
            <ScrollArea className="h-[400px] border rounded-md">
                <AppointmentList
                    appointments={pastAppointments}
                    emptyMessage="No tienes citas pasadas."
                />
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
