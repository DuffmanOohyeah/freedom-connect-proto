'use client';
import { GetPolicyRes } from '@/types/api';
import { BaseUrl, getApiHeaders, fullSignOut } from '@/app/utils';
import { useQuery } from '@tanstack/react-query';
import { PolicyContext } from '../../components/PolicyContext';
import { useState } from 'react';
import PolicyNav from '../../components/PolicyNav';

type PoliciesLayoutProps = {
	children: React.ReactNode;
	params: { id: number };
};

const PoliciesLayout = ({
	children,
	params,
}: PoliciesLayoutProps): JSX.Element => {
	const [policy, setPolicy] = useState<GetPolicyRes | null>(null);

	const { isLoading, isError } = useQuery(
		['getPolicyDetails'],
		async () => {
			const response = await fetch(
				`${BaseUrl}/portal/policy?opid=${params.id}`,
				{
					method: 'GET',
					headers: await getApiHeaders(),
				}
			);
			if (!response.ok) {
				const res = await response.json();
				if (res.errorMessage == 'Unauthorised') fullSignOut();
				throw new Error('Network response was not ok');
			} // get token, call signin to refresh session?
			const resPolicies = (await response.json()) as GetPolicyRes;

			setPolicy(resPolicies);
			return true;
		},
		{
			retry: false,
		}
	);

	return (
		<div className='flex min-h-screen'>
			<PolicyContext.Provider
				value={{
					policy: policy,
					isLoading: isLoading,
					isError: isError,
				}}
			>
				<PolicyNav policyId={params.id} />
				<div className='flex-1'>{children}</div>
			</PolicyContext.Provider>
		</div>
	);
};

export default PoliciesLayout;
