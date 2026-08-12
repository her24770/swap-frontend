export interface Resena {
    id_resena: number;
    contenido: string;
    calificacion: number;
    me_gusta: number;
    id_emisor: number;
    emisor: EmisorResena;
    id_receptor: number;
    id_tipo_resena: number;
    fecha_resena: string;
}


export interface EmisorResena {
    nombre: string;
    url_foto_perfil: string;
}
