export interface Certificacion {
  id_certificacion: number;
  nombre: string;
  lugar_emision: string;
  ruta_pdf: string;
  id_etiqueta: number;
  etiqueta?: {
    id_etiqueta: number;
    nombre: string;
  };
}
