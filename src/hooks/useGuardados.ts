import { useContext } from 'react';
import { GuardadosContext } from '../context/GuardadosContext';

export const useGuardados = () => {
    const context = useContext(GuardadosContext);
    if (context === undefined) {
        throw new Error('useGuardados debe ser utilizado dentro de un GuardadosProvider');
    }
    return context;
};