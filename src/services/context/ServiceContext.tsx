import React, { createContext, useContext } from 'react';
import { publicacionService } from '../publicacionService';
import { anuncioService } from '../anuncioService';
import { resenaService } from '../resenaService';

const services = {
    publicacion: publicacionService,
    anuncio: anuncioService,
    resena: resenaService,
};

const ServiceContext = createContext(services);

export const ServiceProvider = ({ children }: { children: React.ReactNode }) => (
    <ServiceContext.Provider value={services}>{children}</ServiceContext.Provider>
);

export const useServices = () => useContext(ServiceContext);