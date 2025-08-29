"use client";

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
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
    required_error: 'A date is required.',
  }),
  time: z.string({
    required_error: 'A time is required.',
  }),
  reason: z.string().min(10, {
    message: 'Reason must be at least 10 characters.',
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
        title: "AI Assistant Error",
        description: "Please provide a brief reason first (at least 5 characters).",
      });
      return;
    }

    startAiTransition(async () => {
      try {
        const result = await appointmentReasonAssistance({ reason: currentReason });
        if (result.elaboration) {
          form.setValue('reason', result.elaboration, { shouldValidate: true });
          toast({
            title: "AI Assistant",
            description: "Your reason has been elaborated.",
          });
        }
      } catch (error) {
        console.error("AI elaboration failed:", error);
        toast({
          variant: "destructive",
          title: "AI Error",
          description: "Could not connect to the AI assistant. Please try again later.",
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
      title: "✅ Appointment Booked!",
      description: `Your appointment is set for ${format(data.date, 'PPP')} at ${timeSlots.find(t => t.value === data.time)?.label}.`,
    });
    form.reset();
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Book an Appointment</CardTitle>
        <CardDescription>Fill out the form below to schedule your visit.</CardDescription>
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
                    <FormLabel>Date</FormLabel>
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
                              format(field.value, 'PPP')
                            ) : (
                              <span>Pick a date</span>
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
                    <FormLabel>Time</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <Clock className="mr-2 h-4 w-4 opacity-50" />
                          <SelectValue placeholder="Select a time" />
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
                    <FormLabel>Reason for Appointment</FormLabel>
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
                      Elaborate with AI
                    </Button>
                  </div>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Annual check-up, feeling unwell, etc."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
              Schedule Appointment
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
