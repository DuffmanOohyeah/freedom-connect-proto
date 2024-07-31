import React, { useState } from 'react';
import ActionPanel, { ActionProps } from './ActionPanel';
import { BaseUrl, getApiHeaders, fullSignOut } from '@/app/utils';
import { useMutation, useQuery } from '@tanstack/react-query';
import { FnolStatus } from '@/types/api';
import LoadingSpinner from '../LoadingSpinner';

interface FnolUpdateProps {
	fnolId: string;
}

const FNOLUpdateStatus = ({ fnolId }: FnolUpdateProps): JSX.Element => {
	const [open, setOpen] = useState<boolean>(false);
	const action: ActionProps = {
		title: 'Update FNOL Status',
		component: <FnolUpdateStatusAction fnolId={fnolId} />,
	};

	return (
		<>
			<button className='action-btn w-24' onClick={() => setOpen(!open)}>
				Update
			</button>
			<ActionPanel open={open} setOpen={setOpen} action={action} />
		</>
	);
};

const FnolUpdateStatusAction = ({ fnolId }: FnolUpdateProps): JSX.Element => {
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [success, setSuccess] = useState<boolean>(false);
	const [statues, setStatues] = useState<FnolStatus[]>();
	const [selectedStatus, setSelectedStatus] = useState<FnolStatus>();
	const { isLoading } = useQuery(
		['getFnolStatuses'],
		async () => {
			const response = await fetch(
				`${BaseUrl}/portal/policy/fnol/status`,
				{
					method: 'GET',
					headers: await getApiHeaders(),
				}
			);
			if (!response.ok) {
				const res = await response.json();
				if (res.errorMessage == 'Unauthorised') fullSignOut();
				throw new Error('Network response was not ok');
			}
			const scoresRes = (await response.json()) as FnolStatus[];
			setStatues(scoresRes);
			return true;
		},
		{
			retry: false,
		}
	);
	const action = useMutation(['updateFNOLStatus'], {
		mutationFn: async (): Promise<boolean> => {
			const response = await fetch(`${BaseUrl}/portal/policy/fnol`, {
				method: 'PUT',
				body: JSON.stringify({
					fnolId: fnolId,
					statusId: selectedStatus?.fnolStatusId,
				}),
				headers: await getApiHeaders(),
			});

			const res = await response.json();
			if (!response.ok) {
				console.error(res);
				setErrorMessage('An error occurred');
				return false;
			} else {
				setSuccess(true);
				return true;
			}
		},
	});

	return (
		<div className='flex flex-col justify-between h-full'>
			<div>
				<p className='text-xs text-center my-6'>
					Please select the FNOL Status below
				</p>
				{isLoading && <LoadingSpinner />}
				<div className='flex flex-col gap-2'>
					{statues?.map((status: FnolStatus, index: number) => {
						return (
							<button
								className={`action-btn ${
									selectedStatus?.fnolStatusId ===
										status.fnolStatusId &&
									'bg-jagged-ice-900 text-white font-bold'
								}`}
								key={index}
								onClick={() => setSelectedStatus(status)}
							>
								{status.status}
							</button>
						);
					})}
				</div>
			</div>
			<div className='flex flex-col gap-2 w-full'>
				{errorMessage && (
					<p className='text-xs text-center text-red-700'>
						{errorMessage}
					</p>
				)}
				<button
					onClick={() => action.mutate()}
					disabled={selectedStatus?.fnolStatusId ? false : true}
					className={`action-btn`}
				>
					{action.isLoading ? 'Loading' : 'Confirm'}
				</button>
				{success && (
					<p className='text-jagged-ice text-xs text-center'>
						Updated
					</p>
				)}
			</div>
		</div>
	);
};

export default FNOLUpdateStatus;
