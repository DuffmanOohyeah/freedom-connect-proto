import { BusinessUnit, CreateUser, Unit } from '@/types/api';
import { BaseUrl, getApiHeaders, fullSignOut } from '@/app/utils';
import { Dialog, Listbox, Transition } from '@headlessui/react';
import {
	CheckIcon,
	ChevronUpDownIcon,
	XMarkIcon,
} from '@heroicons/react/24/outline';
import { useMutation, useQuery } from '@tanstack/react-query';
import React, { ChangeEvent, useState } from 'react';

interface UserCreateProps {
	created: () => void;
	setOpen: (x: boolean) => void;
}

const UserCreate = ({ created, setOpen }: UserCreateProps): JSX.Element => {
	const [createUserError, setCreateUserError] = useState<string>('');
	const [newUser, setNewUser] = useState<CreateUser | null>(null);
	const [selectedBroker, setSelectedBroker] = useState<Unit | null>(null);
	const [businessUnits, setBusinessUnits] = useState<BusinessUnit[]>([]);

	useQuery(['GetBusinessUnits'], async () => {
		const response = await fetch(`${BaseUrl}/portal/unit/business`, {
			method: 'GET',
			headers: await getApiHeaders(),
		});
		if (!response.ok) {
			const res = await response.json();
			if (res.errorMessage == 'Unauthorised') fullSignOut();
			throw new Error('Network response was not ok');
		}
		const resPolicies = await response.json();
		if (resPolicies) setBusinessUnits(resPolicies);
		return true;
	});

	const createUser = useMutation(['createNote'], {
		mutationFn: async (): Promise<boolean> => {
			setCreateUserError('');
			const response = await fetch(`${BaseUrl}/user`, {
				method: 'POST',
				body: JSON.stringify({
					email: newUser?.email,
					firstName: newUser?.firstName,
					lastName: newUser?.surname,
					unitId: selectedBroker?.unitId,
				}),
				headers: await getApiHeaders(),
			});

			if (!response.ok) {
				const res = await response.json();
				if (res.errorMessage == 'Unauthorised') fullSignOut();
				else setCreateUserError(res.errorMessage);
				throw new Error('Network response was not ok');
			} else {
				created();
				return true;
			}
		},
	});

	return (
		<div className='fixed inset-0 overflow-hidden'>
			<div className='absolute inset-0 overflow-hidden'>
				<div className='pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10'>
					<Transition.Child
						as='div'
						enter='transform transition ease-in-out duration-500 sm:duration-700'
						enterFrom='translate-x-full'
						enterTo='translate-x-0'
						leave='transform transition ease-in-out duration-500 sm:duration-700'
						leaveFrom='translate-x-0'
						leaveTo='translate-x-full'
					>
						<Dialog.Panel className='pointer-events-auto relative w-screen h-screen max-w-md'>
							<Transition.Child
								as='div'
								enter='ease-in-out duration-500'
								enterFrom='opacity-0'
								enterTo='opacity-100'
								leave='ease-in-out duration-500'
								leaveFrom='opacity-100'
								leaveTo='opacity-0'
							>
								{/* <div className='absolute top-0 left-0 -ml-8 flex pt-4 pr-2 sm:-ml-10 sm:pr-4'>
									<button
									type='button'
									className='rounded-md text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-white'
									onClick={() => setOpen(false)}
									>
									<span className='sr-only'>Close panel</span>
									<XMarkIcon className='h-6 w-6' aria-hidden='true' />
									</button>
								</div> */}
							</Transition.Child>
							<div className='flex h-full flex-col overflow-y-scroll bg-shark text-white text-xs py-8 shadow-xl'>
								<div className='px-8 flex flex-row justify-between items-center'>
									<Dialog.Title className='text-lg font-semibold'>
										Create New User
									</Dialog.Title>
									<button
										type='button'
										className='rounded-md hover:text-jagged-ice focus:outline-none focus:ring-0'
										onClick={() => setOpen(false)}
									>
										<span className='sr-only'>
											Close panel
										</span>
										<XMarkIcon
											className='h-6 w-6'
											aria-hidden='true'
										/>
									</button>
								</div>
								<div className='mt-12 flex-1 px-8'>
									<div className='flex flex-col gap-10 divide-y divide-shark-400'>
										<div>
											<h4 className='text-sm font-medium px-1'>
												First Name
											</h4>
											<input
												name='newuser-firstname'
												type='text'
												className='mt-4 px-4 border-0 bg-shark-400 placeholder:text-white/50 placeholder:font-medium focus:ring-0 shadow-none'
												placeholder='Enter...'
												autoComplete='new-password'
												value={newUser?.firstName}
												onChange={(
													e: ChangeEvent<HTMLInputElement>
												) =>
													setNewUser({
														...newUser,
														firstName:
															e.target.value,
													})
												}
											/>
										</div>
										<div className='pt-10'>
											<h4 className='text-sm font-medium px-1'>
												Surname
											</h4>
											<input
												name='newuser-surname'
												type='text'
												className='mt-4 px-4 border-0 bg-shark-400 placeholder:text-white/50 placeholder:font-medium focus:ring-0 shadow-none'
												placeholder='Enter...'
												autoComplete='new-password'
												value={newUser?.surname}
												onChange={(
													e: ChangeEvent<HTMLInputElement>
												) =>
													setNewUser({
														...newUser,
														surname: e.target.value,
													})
												}
											/>
										</div>
										<div className='pt-10'>
											<h4 className='text-sm font-medium px-1'>
												Email Address
											</h4>
											<input
												name='newuser-email'
												type='text'
												className='mt-4 px-4 border-0 bg-shark-400 placeholder:text-white/50 placeholder:font-medium focus:ring-0 shadow-none'
												placeholder='Enter...'
												autoComplete='new-password'
												value={newUser?.email}
												onChange={(
													e: ChangeEvent<HTMLInputElement>
												) =>
													setNewUser({
														...newUser,
														email: e.target.value,
													})
												}
											/>
										</div>

										<div className='pt-10'>
											<h4 className='text-sm font-medium px-1'>
												Broker
											</h4>
											<Listbox
												value={selectedBroker}
												onChange={setSelectedBroker}
											>
												<div className='relative'>
													<Listbox.Button className='relative listbox mt-4 px-4 border-0 bg-shark-400 shadow-none text-left'>
														<span
															className={`${
																!selectedBroker &&
																'text-white/50 font-medium'
															}`}
														>
															{selectedBroker?.name ||
																'Select Broker'}
														</span>
														<span className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2'>
															<ChevronUpDownIcon
																className='h-5 w-5 text-white/50'
																aria-hidden='true'
															/>
														</span>
													</Listbox.Button>
													<Transition
														as='div'
														leave='transition ease-in duration-100'
														leaveFrom='opacity-100'
														leaveTo='opacity-0'
													>
														<Listbox.Options className='absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-shark-400 py-1 text-xs shadow-lg'>
															{businessUnits.map(
																(
																	broker,
																	idx
																) => (
																	<Listbox.Option
																		key={
																			idx
																		}
																		className={({
																			active,
																		}) =>
																			`relative cursor-default select-none py-2 pl-10 pr-4 ${
																				active &&
																				'bg-shark-300'
																			}`
																		}
																		value={
																			broker
																		}
																	>
																		{({
																			selected,
																		}) => (
																			<>
																				<span
																					className={`block truncate ${
																						selected
																							? 'font-medium text-jagged-ice'
																							: 'font-normal'
																					}`}
																				>
																					{
																						broker.name
																					}
																				</span>
																				{selected && (
																					<span className='absolute inset-y-0 left-0 flex items-center pl-3 text-jagged-ice'>
																						<CheckIcon
																							className='h-5 w-5'
																							aria-hidden='true'
																						/>
																					</span>
																				)}
																			</>
																		)}
																	</Listbox.Option>
																)
															)}
														</Listbox.Options>
													</Transition>
												</div>
											</Listbox>
											<button
												onClick={() =>
													createUser.mutate()
												}
												type='button'
												className='action-btn mt-12'
											>
												Create User
											</button>
											{createUserError && (
												<div>
													<p className='text-base text-red-700'>
														An Error Occurred!
													</p>
													<p className='text-xs text-red-700'>
														{createUserError}
													</p>
												</div>
											)}
										</div>
									</div>
								</div>
							</div>
						</Dialog.Panel>
					</Transition.Child>
				</div>
			</div>
		</div>
	);
};

export default UserCreate;
