"use client";
 
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {  schemaHorario,  type HorarioFormData} from "../schemas/zodSchemas";
import { apiClient } from "../lib/apiClient";


export function useFormHorario() {
  const form = useForm<HorarioFormData>({
    resolver: zodResolver(schemaHorario),
    defaultValues: {
      inicio_intervalo: "",
      fin_intervalo: "",
    },
  });
 
  const onSubmit = form.handleSubmit(async (data) => {
    await apiClient.post("/api/disponibilidad", {
      inicio_intervalo: new Date(data.inicio_intervalo).toISOString(),
      fin_intervalo: new Date(data.fin_intervalo).toISOString(),
    });
  });
 
  return { form, onSubmit };
}