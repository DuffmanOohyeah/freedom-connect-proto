'use client';
import { BaseUrl, fullSignOut, getApiHeaders } from '@/app/utils';
import { ArrowsPointingOutIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import LoadingSpinner from '../LoadingSpinner';
import { PolicySearchResultsProps } from '@/types/api/policySearchResults';

const PolicySearchResults = ({
	policyNumber,
	forename,
	surname,
	phoneNumber,
	postcode,
	vrn,
	email,
}: PolicySearchResultsProps) => {
	const [policies, setPolicies] = useState([]);
	const { isLoading } = useQuery(
		[
			'PolicySearchResults',
			policyNumber,
			forename,
			surname,
			phoneNumber,
			postcode,
			vrn,
			email,
		],
		async () => {
			const searchParams = {
				policyNo: policyNumber ?? '',
				forename: forename ?? '',
				surname: surname ?? '',
				telNo: phoneNumber ?? '',
				postcode: postcode ?? '',
				vrm: vrn ?? '',
				email: email ?? '',
			};
			const response = await fetch(`${BaseUrl}/portal/search`, {
				method: 'POST',
				body: JSON.stringify({
					searchParams: searchParams,
				}),
				headers: await getApiHeaders(),
			});
			if (!response.ok) {
				const res = await response.json();
				if (res.errorMessage == 'Unauthorised') fullSignOut();
				throw new Error('Network response was not ok');
			}
			const resPolicies = await response.json();
			setPolicies(resPolicies.policies || []);
			return true;
		},
		{
			retry: false,
		}
	);

	return (
		<div className='flex flex-col bg-white rounded-2xl shadow-tile-shadow px-8 py-6 mt-12'>
			<h1 className='text-lg font-semibold whitespace-pre mb-4'>
				Search Results
				{policies.length > 0 && (
					<span className='text-sm'>
						&nbsp;&nbsp;&nbsp;(Records found: {policies.length})
					</span>
				)}
			</h1>
			{isLoading && <LoadingSpinner />}
			{policies.length > 0 ? (
				<div className='max-h-96 overflow-y-auto'>
					<table className='w-full table-auto zebraTable'>
						<thead>
							<tr className='text-left text-xs font-semibold text-shark'>
								<th className='py-4'>Policy Number</th>
								<th className='py-4'>Policy Ref</th>
								<th className='py-4'>Forename</th>
								<th className='py-4'>Surname</th>
								<th className='py-4'>Email Address</th>
								<th className='py-4'>VRN</th>
								<th className='py-4'>Postcode</th>
								<th className='py-4'>Policy Status</th>
								<th className='py-4'>View</th>
							</tr>
						</thead>
						<tbody>
							{policies.map((policy: any, idx) => {
								return (
									<tr
										className='text-xs text-shark'
										key={idx}
									>
										<td className='py-4'>
											{policy.policyNo}
										</td>
										<td className='py-4'>
											{policy.policyRef}
										</td>
										<td className='py-4'>
											{policy.forename}
										</td>
										<td className='py-4'>
											{policy.surname}
										</td>
										<td className='py-4'>{policy.email}</td>
										<td className='py-4'>{policy.vrm}</td>
										<td className='py-4'>
											{policy.correspondencePostcode}
										</td>
										<td className='py-4'>
											{policy.cancelled ? (
												<span className='bg-score-red rounded-full py-1 px-2'>
													Cancelled
												</span>
											) : (
												<span className='bg-jagged-ice-500  rounded-full py-1 px-2'>
													Active
												</span>
											)}
										</td>
										<td className='py-4'>
											<Link
												href={`/policies/${policy.opid}/policyholderdetails`}
											>
												<ArrowsPointingOutIcon className='h-4 cursor-pointer' />
											</Link>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			) : (
				!isLoading && (
					<div className='flex items-center justify-center h-24 w-full'>
						<h1 className='text-xl font-light'>No results</h1>
					</div>
				)
			)}
		</div>
	);
};

export default PolicySearchResults;
