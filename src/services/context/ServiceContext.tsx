import React, { createContext, useContext } from 'react';
import { publicacionService } from '../publicacionService';
import { anuncioService } from '../anuncioService';

const services = {
    publicacion: publicacionService,
    anuncio: anuncioService,
};

const ServiceContext = createContext(services);

export const ServiceProvider = ({ children }: { children: React.ReactNode }) => (
    <ServiceContext.Provider value={services}>{children}</ServiceContext.Provider>
);

export const useServices = () => useContext(ServiceContext);