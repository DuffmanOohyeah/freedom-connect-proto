import { Auth } from '@/types/api';
import { createContext } from 'react';

export interface AuthContextInterface {
	credentials: Auth | null;
	error: string;
	setCredentials: (credentials: Auth) => void;
	setError: (error: string) => void;
}

export const AuthContext = createContext<AuthContextInterface>({
	credentials: { username: null, password: null },
	error: '',
	setCredentials: () => {},
	setError: () => '',
});
