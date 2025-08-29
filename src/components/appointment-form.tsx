"use client";

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon, Clock, Loader2, Sparkles } from 'lucide-react';

import { appointmentReasonAssistance } from '@/ai/flows/appointment-reason-assistance';
import type { Appointment } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const appointmentSchema = z.object({
  date: z.date({
    required_error: 'Se requiere una fecha.',
  }),
  time: z.string({
    required_error: 'Se requiere una hora.',
  }),
  reason: z.string().min(10, {
    message: 'El motivo debe tener al menos 10 caracteres.',
  }),
});

type AppointmentFormValues = z.infer<typeof appointmentSchema>;

const timeSlots = Array.from({ length: 18 }, (_, i) => {
  const hour = Math.floor(i / 2) + 8;
  const minute = i % 2 === 0 ? '00' : '30';
  const period = hour < 12 ? 'AM' : 'PM';
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return {
    value: `${String(hour).padStart(2, '0')}:${minute}`,
    label: `${displayHour}:${minute} ${period}`,
  };
});

interface AppointmentFormProps {
  onAppointmentSubmit: (appointment: Omit<Appointment, 'id'>) => void;
}

export function AppointmentForm({ onAppointmentSubmit }: AppointmentFormProps) {
  const [isAiPending, startAiTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      reason: '',
    },
  });

  const handleAiElaborate = () => {
    const currentReason = form.getValues('reason');
    if (!currentReason || currentReason.length < 5) {
      toast({
        variant: "destructive",
        title: "Error del Asistente de IA",
        description: "Por favor, proporciona un motivo breve primero (al menos 5 caracteres).",
      });
      return;
    }

    startAiTransition(async () => {
      try {
        const result = await appointmentReasonAssistance({ reason: currentReason });
        if (result.elaboration) {
          form.setValue('reason', result.elaboration, { shouldValidate: true });
          toast({
            title: "Asistente de IA",
            description: "Tu motivo ha sido elaborado.",
          });
        }
      } catch (error) {
        console.error("AI elaboration failed:", error);
        toast({
          variant: "destructive",
          title: "Error de IA",
          description: "No se pudo conectar con el asistente de IA. Por favor, inténtalo de nuevo más tarde.",
        });
      }
    });
  };

  function onSubmit(data: AppointmentFormValues) {
    onAppointmentSubmit({
      ...data,
      date: format(data.date, 'yyyy-MM-dd'),
    });
    toast({
      title: "✅ ¡Cita Agendada!",
      description: `Tu cita está programada para ${format(data.date, 'PPP', { locale: es })} a las ${timeSlots.find(t => t.value === data.time)?.label}.`,
    });
    form.reset();
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Agendar una Cita</CardTitle>
        <CardDescription>Completa el formulario para agendar tu visita.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP', { locale: es })
                            ) : (
                              <span>Elige una fecha</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                          initialFocus
                          locale={es}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Hora</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <Clock className="mr-2 h-4 w-4 opacity-50" />
                          <SelectValue placeholder="Elige una hora" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timeSlots.map(slot => (
                          <SelectItem key={slot.value} value={slot.value}>
                            {slot.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center">
                    <FormLabel>Motivo de la Cita</FormLabel>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleAiElaborate}
                      disabled={isAiPending}
                      className="text-xs"
                    >
                      {isAiPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="mr-2 h-4 w-4 text-yellow-500" />
                      )}
                      Elaborar con IA
                    </Button>
                  </div>
                  <FormControl>
                    <Textarea
                      placeholder="Ej: Chequeo anual, malestar, etc."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
              Agendar Cita
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
