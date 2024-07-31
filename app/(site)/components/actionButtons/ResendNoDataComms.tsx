import { BaseUrl, getApiHeaders } from '@/app/utils';
import { GetPolicyRes, User } from '@/types/api';
import { Listbox } from '@headlessui/react';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

interface ResendNoDataCommsProps {
	policy: GetPolicyRes | null;
}

const ResendNoDataComms = ({ policy }: ResendNoDataCommsProps): JSX.Element => {
	const users: User[] = policy?.users || [];
	const [errorMessage, setErrorMessage] = useState<string>('');
	const [success, setSuccess] = useState<boolean>(false);
	const [selectedUser, setSelectedUser] = useState<User | undefined>();

	const action = useMutation(['resendNoDataComms'], {
		mutationFn: async (): Promise<boolean> => {
			const response = await fetch(`${BaseUrl}/portal/comm/resend`, {
				method: 'POST',
				body: JSON.stringify({
					commType: 'RESEND_NO_DATA_COMMS',
					userId: selectedUser?.userId,
				}),
				headers: await getApiHeaders(),
			});

			const res = await response.json();
			if (!response.ok) {
				setErrorMessage(res.errorMessage);
				return false;
			} else {
				setSuccess(true);
				return true;
			}
		},
	});

	useEffect(() => {
		if (users && users.length > 0) setSelectedUser(users[0]);
		else setErrorMessage('No Devices');
	}, [users]);

	/*console.log('policy:', policy);
	console.log('selectedUser:', selectedUser);*/

	return (
		<>
			<div>
				{users && users.length > 0 ? (
					<>
						<label>
							<span className='text-white my-4'>
								Please Select the Correct User
							</span>
						</label>
						<Listbox
							value={selectedUser}
							onChange={setSelectedUser}
						>
							<Listbox.Button className='relative listbox mt-4 px-4 border-0 bg-placeholder-bg shadow-none text-left text-shark'>
								{selectedUser?.forename} {selectedUser?.surname}{' '}
								({selectedUser?.email})
							</Listbox.Button>
							<Listbox.Options className='absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-placeholder-bg py-1 text-xs shadow-lg text-shark'>
								{users.map((user) => (
									<Listbox.Option
										key={user.userId}
										value={user}
									>
										{user.forename} {user.surname} (
										{user.email})
									</Listbox.Option>
								))}
							</Listbox.Options>
						</Listbox>
					</>
				) : (
					<span className='text-white'>
						No users assigned to policy
					</span>
				)}
				<p className='text-xs text-center mt-12'>
					Your are about to resend the no data comms email to{' '}
					<span className='underline'>{selectedUser?.email}</span>
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
				<br />
				{selectedUser && !success && (
					<button
						onClick={() => action.mutate()}
						disabled={errorMessage ? true : false}
						className='action-btn'
					>
						{action.isLoading ? 'Loading' : 'Confirm'}
					</button>
				)}
				{success && (
					<p className='text-jagged-ice text-xs text-center'>Sent</p>
				)}
			</div>
		</>
	);
};

export default ResendNoDataComms;
