import { BaseUrl, getApiHeaders, fullSignOut } from '@/app/utils';
import { useQuery } from '@tanstack/react-query';
import React, { createContext, useEffect, useReducer } from 'react';
import {
	BusinessUnitState,
	BusinessUnitContextType,
	BUAction,
} from '@/types/api/businessUnitProvider';

const initialState: BusinessUnitState = {
	businessUnit: null,
	businessUnits: [],
	isLoading: true,
};

const BusinessUnitCtx = createContext<BusinessUnitContextType | null>(null);

// Define the reducer function
const reducer = (
	state: BusinessUnitState,
	action: BUAction
): BusinessUnitState => {
	const { type, payload } = action;
	switch (type) {
		case 'UPDATE_BU':
			return {
				...state,
				businessUnit: payload,
			};
		case 'UPDATE_BUS':
			return {
				...state,
				businessUnits: payload,
			};
		case 'UPDATE_LOADING':
			return {
				...state,
				isLoading: payload,
			};
		default:
			throw new Error('BusinessUnit Type not found');
	}
};

const BusinessUnitProvider = ({
	children,
}: {
	children: React.ReactNode;
}): JSX.Element => {
	const [state, dispatch] = useReducer(reducer, initialState);
	const { isLoading } = useQuery(
		['GetBusinessUnits'],
		async () => {
			const response = await fetch(`${BaseUrl}/portal/unit/business`, {
				method: 'GET',
				headers: await getApiHeaders(),
			});

			if (!response.ok) {
				const res = await response.json();
				if (res.errorMessage == 'Unauthorised') fullSignOut();
				throw new Error('Network response was not ok');
			}

			const resPolicies = await response.json();
			resPolicies.sort((a: { name: string }, b: { name: string }) =>
				a.name.localeCompare(b.name)
			); // sort array by alphabetical name

			if (resPolicies) {
				dispatch({
					type: 'UPDATE_BUS',
					payload: resPolicies,
				});
				if (!state.businessUnit) {
					dispatch({
						type: 'UPDATE_BU',
						payload: resPolicies[0],
					});
				}
			}
			return true;
		},
		{
			retry: false,
			enabled: state.businessUnits.length === 0 ? true : false,
		}
	);

	useEffect(() => {
		dispatch({
			type: 'UPDATE_LOADING',
			payload: isLoading,
		});
	}, [isLoading]);

	return (
		<BusinessUnitCtx.Provider value={{ state, dispatch }}>
			{children}
		</BusinessUnitCtx.Provider>
	);
};

export default BusinessUnitProvider;
export { BusinessUnitCtx };
