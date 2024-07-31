'use client';
import { Dialog, Transition } from '@headlessui/react';
import { useState } from 'react';
import UserCreate from '../components/UserCreate';
import UsersTable from '../components/UsersTable';

const UserManagement = (): JSX.Element => {
	const [open, setOpen] = useState<boolean>(false);
	const [searchId, setSearchId] = useState<number>(0);

	return (
		<div className='p-12 relative'>
			<h1 className='text-2xl font-bold flex items-center'>
				User Management
			</h1>
			<button
				onClick={() => setOpen(true)}
				type='button'
				className='bg-shark hover:bg-shark-450 text-white text-xs px-4 py-3 mt-12 rounded-full whitespace-pre'
			>
				Create New User
			</button>
			<UsersTable />
			<Transition.Root show={open} as='div'>
				<Dialog
					as='div'
					className='relative z-10'
					onClose={() => setOpen(false)}
				>
					<Transition.Child
						as='div'
						enter='ease-in-out duration-500'
						enterFrom='opacity-0'
						enterTo='opacity-100'
						leave='ease-in-out duration-500'
						leaveFrom='opacity-100'
						leaveTo='opacity-0'
					>
						<div className='fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity' />
					</Transition.Child>
					<UserCreate
						created={() => {
							setOpen(false);
							setSearchId(searchId + 1);
						}}
						setOpen={(x) => setOpen(x)}
					/>
				</Dialog>
			</Transition.Root>
		</div>
	);
};

export default UserManagement;
