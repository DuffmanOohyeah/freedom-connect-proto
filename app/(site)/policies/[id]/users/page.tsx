'use client';
import { User } from '@/types/api';
import { useContext, useEffect, useState } from 'react';
import {
	PolicyContext,
	PolicyContextInterface,
} from '@/app/(site)/components/PolicyContext';
import ActionPanel, {
	ActionProps,
} from '@/app/(site)/components/actionButtons/ActionPanel';
import UnlockUser from '@/app/(site)/components/actionButtons/UnlockUser';
import LockUser from '@/app/(site)/components/actionButtons/LockUser';

interface LockUserProps {
	title: string;
	component: JSX.Element;
}

const lockUser = (userId: number): LockUserProps => {
	return {
		title: 'Lock User',
		component: <LockUser userId={userId} />,
	};
};

const unlockUser = (userId: number): LockUserProps => {
	return {
		title: 'Unlock User',
		component: <UnlockUser userId={userId} />,
	};
};

const PolicyDetails = (): JSX.Element => {
	const { policy } = useContext<PolicyContextInterface>(PolicyContext);
	const [users, setUsers] = useState<User[] | null>(null);
	const [open, setOpen] = useState<boolean>(false);
	const [action, setAction] = useState<ActionProps | null>(null);

	const setActionFn = (action: ActionProps): void => {
		setAction(action);
		setOpen(true);
	};

	useEffect(() => {
		if (policy?.policy) setUsers(policy.users);
	}, [policy]);

	return (
		<div className='flex flex-col gap-5 m-5'>
			<ActionPanel
				open={open}
				setOpen={(x) => setOpen(x)}
				action={action}
			/>
			<h1 className='text-lg font-semibold'>User Logins</h1>

			{users?.map((user: User, idx: number) => {
				const {
					activatedDTM,
					archivedDTM,
					email,
					forename,
					homePhone,
					lockedDTM,
					lockedReason,
					mobilePhone,
					smsConfirmedDTM,
					smsNumberConfirmed,
					surname,
					termsAccepted,
					userId,
				} = user;

				return (
					<div
						key={idx}
						className='bg-white rounded-2xl shadow-tile-shadow px-8 py-6 w-full'
					>
						<div className='flex gap-2 justify-between w-full mb-8'>
							<span className='text-xs text-shark'>Name</span>
							<span className='text-xs text-shark font-semibold'>
								{forename} {surname}
							</span>
						</div>

						<div className='flex gap-2 justify-between w-full mb-8'>
							<span className='text-xs text-shark'>Email</span>
							<span className='text-xs text-shark font-semibold'>
								{email}
							</span>
						</div>
						<div className='flex gap-2 justify-between w-full mb-8'>
							<span className='text-xs text-shark'>
								Home Phone
							</span>
							<span className='text-xs text-shark font-semibold'>
								{homePhone}
							</span>
						</div>
						<div className='flex gap-2 justify-between w-full mb-8'>
							<span className='text-xs text-shark'>
								Mobile Phone
							</span>
							<span className='text-xs text-shark font-semibold'>
								{mobilePhone}
							</span>
						</div>

						{lockedDTM && (
							<>
								<div className='flex gap-2 justify-between w-full mb-8'>
									<span className='text-xs text-shark'>
										Locked Date
									</span>
									<span className='text-xs text-shark font-semibold'>
										{lockedDTM}
									</span>
								</div>
								<div className='flex gap-2 justify-between w-full mb-8'>
									<span className='text-xs text-shark'>
										Lock Reason
									</span>
									<span className='text-xs text-shark font-semibold'>
										{lockedReason}
									</span>
								</div>
								<div className='flex gap-2 justify-between w-full mb-8'>
									<button
										onClick={() =>
											setActionFn(unlockUser(userId))
										}
										className='action-btn'
									>
										Unlock User
									</button>
								</div>
							</>
						)}

						<div className='flex gap-2 justify-between w-full mb-8'>
							<span className='text-xs text-shark'>
								SMS Confirmed Date
							</span>
							<span className='text-xs text-shark font-semibold'>
								{smsConfirmedDTM}
							</span>
						</div>
						<div className='flex gap-2 justify-between w-full mb-8'>
							<span className='text-xs text-shark'>
								SMS Number Confirmed
							</span>
							<span className='text-xs text-shark font-semibold'>
								{smsNumberConfirmed}
							</span>
						</div>
						<div className='flex gap-2 justify-between w-full mb-8'>
							<span className='text-xs text-shark'>
								Terms Accepted
							</span>
							<span className='text-xs text-shark font-semibold'>
								{termsAccepted ? 'Accepted' : 'Not Accepted'}
							</span>
						</div>
						<div className='flex gap-2 justify-between w-full mb-8'>
							<span className='text-xs text-shark'>
								Activated Date
							</span>
							<span className='text-xs text-shark font-semibold'>
								{activatedDTM}
							</span>
						</div>

						{archivedDTM && (
							<div className='flex gap-2 justify-between w-full mb-8'>
								<span className='text-xs text-shark'>
									Archived Date
								</span>
								<span className='text-xs text-shark font-semibold'>
									{archivedDTM}
								</span>
							</div>
						)}

						{lockedDTM === null && (
							<div className='flex gap-2 justify-between w-full mb-8'>
								<button
									onClick={(evt) => {
										evt.preventDefault();
										setActionFn(lockUser(userId));
									}}
									className='action-btn'
								>
									Lock User
								</button>
							</div>
						)}
					</div>
				);
			})}
		</div>
	);
};

export default PolicyDetails;
