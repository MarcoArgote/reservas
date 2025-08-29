"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppointmentForm } from '@/components/appointment-form';
import { AppointmentHistory } from '@/components/appointment-history';
import { useAppointments } from '@/hooks/use-appointments';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const { user, loading, logout } = useAuth();
  const { appointments, addAppointment, deleteAppointment } = useAppointments(user?.id);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
       <header className="sticky top-0 z-10 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="m9 16 2 2 4-4"/></svg>
          <h1 className="text-2xl font-bold text-foreground ml-2">CitaFacil</h1>
          <div className="ml-auto flex items-center gap-4">
            <span className="text-sm font-medium">Hola, {user.email}</span>
            <Button variant="ghost" size="sm" onClick={logout}>Cerrar sesión</Button>
          </div>
        </div>
      </header>
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Tu Agendador de Citas Fácil</h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
            Agenda rápidamente tu próxima cita. Usa nuestro asistente de IA para ayudarte a describir el motivo de tu visita.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          <div className="lg:col-span-2">
            <AppointmentForm onAppointmentSubmit={addAppointment} />
          </div>
          <div className="lg:col-span-3">
            <AppointmentHistory appointments={appointments} onDeleteAppointment={deleteAppointment} />
          </div>
        </div>
      </main>
      <footer className="py-6 md:px-8 md:py-0 border-t">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Construido por un ingeniero senior. El código fuente está disponible.
          </p>
        </div>
      </footer>
    </div>
  );
}
