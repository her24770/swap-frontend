import React, { createContext, useContext } from 'react';
import { publicacionService } from '../publicacionService';

const services = {
    publicacion: publicacionService,
};

const ServiceContext = createContext(services);

export const ServiceProvider = ({ children }: { children: React.ReactNode }) => (
    <ServiceContext.Provider value={services}>{children}</ServiceContext.Provider>
);

export const useServices = () => useContext(ServiceContext);