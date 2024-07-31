import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { BaseUrl, getApiHeaders } from '@/app/utils';
import { useSession } from 'next-auth/react';
//import { SessionType } from '@/types/api';

const ResetSMSAttempts = ({ pUserId }: { pUserId: number }): JSX.Element => {
	const [pResetReason, setPReason] = useState<string>('');
	const [errorMessage, setErrorMessage] = useState<string>('');
	const [success, setSuccess] = useState<boolean>(false);
	const { data: session } = useSession();
	//const userSession: SessionType | null = session;
	// const reqUserId = userSession?.user?.userId || -99;

	const action = useMutation(['resetSMSAttempts'], {
		mutationFn: async (): Promise<boolean> => {
			const response: Response = await fetch(
				`${BaseUrl}/portal/user/resetSMSConfirmation`,
				{
					method: 'PUT',
					body: JSON.stringify({
						pUserId: pUserId,
						pResetReason: pResetReason,
					}),
					headers: await getApiHeaders(),
				}
			);

			let rtnBln: boolean = true; // set default; overwrite below

			if (!response.ok) {
				const res: any = await response.json();
				const err: string = res.errorMessage ?? 'An error occurred';
				setErrorMessage(err);
				rtnBln = false;
			} else setSuccess(true);

			return rtnBln;
		},
	});

	return (
		<div className='flex flex-col justify-between text-center h-full'>
			<div>
				<p className='text-xs text-center mt-12'>
					You are about to reset the SMS counter attempts for policy
					user: {pUserId}. Please enter a reason below then click
					`Confirm` below to submit.
				</p>

				<div className='my-5'>
					<label className='pb-4'>
						<span className='my-4 text-white'>
							Reason for resetting the SMS counter attempts:
						</span>
					</label>
					<input
						type='text'
						className='text-black'
						value={pResetReason}
						onChange={(evt) => setPReason(evt.target.value)}
					/>
				</div>
			</div>

			<div className='flex flex-col gap-2 w-full'>
				{errorMessage && (
					<p className='text-xs text-center text-red-700'>
						{`Error message: ${errorMessage}`}
					</p>
				)}

				<button
					onClick={() => action.mutate()}
					disabled={
						errorMessage || !pResetReason.trim().length
							? true
							: false
					}
					className='action-btn'
				>
					{action.isLoading ? 'Loading' : 'Confirm'}
				</button>

				{success && (
					<p className='text-jagged-ice text-xs text-center'>
						User SMS confirmation attempts reset.
					</p>
				)}
			</div>
		</div>
	);
};

export default ResetSMSAttempts;
