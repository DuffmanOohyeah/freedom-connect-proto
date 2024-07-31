import React, { useEffect, useState } from 'react';
import ActionPanel, { ActionProps } from './ActionPanel';
import { BaseUrl, getApiHeaders } from '@/app/utils';
import { useMutation } from '@tanstack/react-query';
import { AdminUser } from '@/types/api';
import { BsThreeDotsVertical } from 'react-icons/bs';
import UnlockUser from './UnlockUser';
import LockUser from './LockUser';
import ReportAccess from './ReportAccess';
import ArchiveAccount from './ArchiveAccount';

const AgentActionsBtn = ({
	adminUser,
}: {
	adminUser: AdminUser;
}): JSX.Element => {
	const defaultAction = {
		title: 'Agent Actions',
		component: (
			<AgentActions
				adminUser={adminUser}
				onActionChange={(action) => {
					setAction(action);
				}}
			/>
		),
	};
	const [open, setOpen] = useState(false);
	const [action, setAction] = useState(defaultAction);

	useEffect(() => {
		setAction(defaultAction);
	}, [open]);

	return (
		<>
			<button className=' w-5' onClick={() => setOpen(!open)}>
				<BsThreeDotsVertical />
			</button>
			<ActionPanel open={open} setOpen={setOpen} action={action} />
		</>
	);
};

const AgentActions = ({
	adminUser,
	onActionChange,
}: {
	adminUser: AdminUser;
	onActionChange: (action: ActionProps) => void;
}): JSX.Element => {
	const getActions = (adminUser: AdminUser): ActionProps[] => {
		const basicActions = [
			{
				title: 'Resend Activation Email',
				component: (
					<AgentResendActivationEmailAction adminUser={adminUser} />
				),
			},
		];

		const lockActions = (adminUser: AdminUser): ActionProps[] => {
			if (adminUser?.lockedDTM) {
				return [
					{
						title: 'Unlock User',
						component: <UnlockUser userId={adminUser.userId} />,
					},
				];
			} else {
				return [
					{
						title: 'Lock User',
						component: <LockUser userId={adminUser.userId} />,
					},
				];
			}
		};

		const reportActions = [
			{
				title: 'Report Access',
				component: <ReportAccess adminUser={adminUser} />,
			},
		];

		const archiveActions = (adminUser: AdminUser): ActionProps[] => [
			{
				title: `${
					adminUser?.archivedDTM ? 'Restore' : 'Archive'
				} User Account`,
				component: <ArchiveAccount adminUser={adminUser} />,
			},
		];

		const allActions = [
			...basicActions,
			...lockActions(adminUser),
			...reportActions,
			...archiveActions(adminUser),
		];
		return allActions;
	};

	const actions: ActionProps[] = getActions(adminUser);

	return (
		<div className='flex flex-col gap-2'>
			{actions.map((action: ActionProps) => {
				return (
					<button
						key={action.title}
						onClick={() => {
							onActionChange(action);
						}}
						className='action-btn'
					>
						{action.title}
					</button>
				);
			})}
		</div>
	);
};

const AgentResendActivationEmailAction = ({
	adminUser,
}: {
	adminUser: AdminUser;
}): JSX.Element => {
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);

	const action = useMutation(['resendActivationEmail'], {
		mutationFn: async (): Promise<boolean> => {
			const response = await fetch(`${BaseUrl}/portal/comm/resend`, {
				method: 'POST',
				body: JSON.stringify({
					commType: 'ACTIVATION',
					userId: adminUser.userId,
					unitId: adminUser.unitId,
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

	return (
		<div className='flex flex-col justify-between h-full'>
			<div>
				<p className='text-xs text-center my-6'>
					{
						"You are about to resend this user's activation email. Please click confirm to proceed. "
					}
				</p>
				<div className='flex flex-col gap-2' />
			</div>
			<div className='flex flex-col gap-2 w-full'>
				{errorMessage && (
					<p className='text-xs text-center text-red-700'>
						{errorMessage}
					</p>
				)}
				{success && (
					<p className='text-jagged-ice text-xs text-center'>Sent!</p>
				)}
				<button
					onClick={() => action.mutate()}
					className={`action-btn`}
					disabled={errorMessage || success ? true : false}
				>
					{action.isLoading ? 'Loading' : 'Confirm'}
				</button>
			</div>
		</div>
	);
};

export default AgentActionsBtn;
