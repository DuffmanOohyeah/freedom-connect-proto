import { BaseUrl, getApiHeaders } from '@/app/utils';
import { useMutation } from '@tanstack/react-query';
import React, { useState } from 'react';

const SpeedingValidate = ({
	valid,
	eventId,
}: {
	valid: boolean;
	eventId: number;
}): JSX.Element => {
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const action = useMutation(['resendActivationEmail'], {
		mutationFn: async (): Promise<boolean> => {
			const response = await fetch(`${BaseUrl}/portal/policy/excessive`, {
				method: 'PUT',
				body: JSON.stringify({
					eventId: eventId,
					decision: valid ? 'VALID' : 'INVALID', // VALID or
				}),
				headers: await getApiHeaders(),
			});

			const res = await response.json();
			if (!response.ok) {
				setErrorMessage('An error occurred');
				return false;
			} else return true;
		},
	});

	return (
		<div className='flex flex-col justify-between h-full'>
			<div>
				<p className='text-xs text-center mt-12'>
					Your are about to set the excessive speeding event as{' '}
					{valid ? 'valid' : 'invalid'}.
				</p>
				<p className='text-xs text-center mt-6'>
					Please click Confirm below to do this
				</p>
			</div>

			<div className='flex flex-col gap-2 w-full'>
				{errorMessage && (
					<p className='text-xs text-center text-red-700'>
						{errorMessage}
					</p>
				)}
				<button
					onClick={() => action.mutate()}
					disabled={errorMessage ? true : false}
					className='action-btn'
				>
					{action.isLoading ? 'Loading' : 'Confirm'}
				</button>
			</div>
		</div>
	);
};

export default SpeedingValidate;
