import React, { useState } from 'react';
import { AdminUser } from '@/types/api';
import { BaseUrl, getApiHeaders } from '@/app/utils';
import ConfirmModal from './ConfirmModal';

const ArchiveAccount = ({
	adminUser,
}: {
	adminUser: AdminUser;
}): JSX.Element => {
	const [isOpen, setIsOpen] = useState<boolean>(true);
	const [submitMsg, setSubmitMsg] = useState<string>('Awaiting option...');

	let action: string = 'archive';
	if (adminUser?.archivedDTM) action = 'restore';
	const confirmMessage: string = `Please confirm that you want to ${action} this user account.`;

	const closeModal = (): void => {
		setIsOpen(false);
		setSubmitMsg('You have decided to cancel the proposed action.');
	};

	const confirmSubmit = async (): Promise<void> => {
		closeModal();
		setSubmitMsg('Submitting data...');

		const response = await fetch(`${BaseUrl}/portal/app/user/archive`, {
			method: 'PUT',
			headers: await getApiHeaders(),
			body: JSON.stringify({
				uid: adminUser.userId,
				action: action,
			}),
		});

		const res: any = await response.json();

		if (!response.ok) setSubmitMsg(res.errorMessage);
		else setSubmitMsg(`Action (${action}) successful for user.`);
	};

	return (
		<>
			{isOpen && (
				<ConfirmModal
					isOpen={isOpen}
					closeModal={closeModal}
					confirmSubmit={confirmSubmit}
					confirmMessage={confirmMessage}
				/>
			)}
			{submitMsg && (
				<div className='flex flex-col pb-5 text-red-300'>
					{submitMsg}
				</div>
			)}
		</>
	);
};

export default ArchiveAccount;
