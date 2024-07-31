import { BaseUrl, getApiHeaders } from '@/app/utils';
// import { DeviceDetails } from '@/types/api';
import { useMutation } from '@tanstack/react-query';
import React, { useState } from 'react';

const UnlockUser = ({ userId }: { userId: number }): JSX.Element => {
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [success, setSuccess] = useState<boolean>(false);
	// const [selectedDevice, setSelectedDevice] = useState<DeviceDetails | null>();
	const [reason, setReason] = useState<string>('');
	const action = useMutation(['deviceNoDataCancellation'], {
		mutationFn: async (): Promise<boolean> => {
			const response = await fetch(`${BaseUrl}/portal/user/lock`, {
				method: 'PUT',
				body: JSON.stringify({
					userToLockOrUnlockId: userId,
					reason: reason,
					lock: false,
				}),
				headers: await getApiHeaders(),
			});

			const res = await response.json();
			if (!response.ok) {
				console.error(res);
				let err = res.errorMessage ?? 'An error occurred';
				setErrorMessage(err);
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
				<p className='text-xs text-center mt-12'>
					You are about to unlock the user (UserId: {userId}). Please
					add a reason for unlocking the user.
				</p>
				<p className='text-xs text-center mt-6'>
					Please click Confirm below to do this
				</p>
				<div className='my-5'>
					<label className='pb-4'>
						<span className='my-4 text-white'>
							Reason for unlocking user
						</span>
					</label>
					<input
						type='text'
						className='text-black'
						value={reason}
						onChange={(e) => setReason(e.target.value)}
					/>
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
					disabled={
						errorMessage || (reason && reason.length === 0)
							? true
							: false
					}
					className='action-btn'
				>
					{action.isLoading ? 'Loading' : 'Confirm'}
				</button>
				{success && (
					<p className='text-jagged-ice text-xs text-center'>
						User Unlocked
					</p>
				)}
			</div>
		</div>
	);
};

export default UnlockUser;
