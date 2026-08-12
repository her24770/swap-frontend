export interface Resena {
    id_resena: number;
    contenido: string;
    calificacion: number;
    me_gusta: number;
    emisor: EmisorResena;
    id_receptor: number;
    id_tipo_resena: number;
    fecha_resena: string;
}


export interface EmisorResena {
    id_usuario: number;
    nombre: string;
    url_foto_perfil: string;
}
