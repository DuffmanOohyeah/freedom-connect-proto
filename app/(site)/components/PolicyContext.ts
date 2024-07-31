import { GetPolicyRes } from '@/types/api';
import { createContext } from 'react';

export interface PolicyContextInterface {
	policy: GetPolicyRes | null;
	isLoading: boolean;
	isError: boolean;
}

export const PolicyContext = createContext<PolicyContextInterface>({
	policy: null,
	isLoading: true,
	isError: false,
});
