'use client';
import PolicyActions from '@/app/(site)/components/actionButtons/PolicyActions';
import PolicyHolderDetails from '@/app/(site)/components/PolicyHolderDetails';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useContext, useState } from 'react';
import {
	PolicyContext,
	PolicyContextInterface,
} from '../../../components/PolicyContext';
import { setRecentPolicies } from '@/app/(site)/hooks/useLocalStorage';

const PolicyDetails = (): JSX.Element => {
	const [actionPanelOpen, setActionPanelOpen] = useState<boolean>(false);
	const { policy, isLoading } =
		useContext<PolicyContextInterface>(PolicyContext);
	const [actionPanel] = useState<{ title: string }>();

	if (policy && policy.policy && !isLoading) setRecentPolicies(policy.policy);

	return (
		<div className='flex flex-col xl:flex-row gap-7 xl:gap-7 p-7'>
			<PolicyHolderDetails policy={policy} isLoading={isLoading} />

			<div className='flex flex-col gap-8'>
				<div className='flex flex-col 2xl:flex-row gap-8'>
					{/* <PolicyHolderCancellation />
					<PolicyHolderPreferences /> */}
				</div>
				<PolicyActions policy={policy} />
			</div>

			<Transition.Root show={actionPanelOpen} as='div'>
				<Dialog
					as='div'
					className='relative z-10'
					onClose={() => setActionPanelOpen(false)}
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
													{actionPanel?.title}
												</Dialog.Title>
												<button
													type='button'
													className='rounded-md hover:text-jagged-ice focus:outline-none focus:ring-0'
													onClick={(evt) => {
														evt.preventDefault();
														setActionPanelOpen(
															false
														);
													}}
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
											<div className='mt-12 flex-1 px-8' />
										</div>
									</Dialog.Panel>
								</Transition.Child>
							</div>
						</div>
					</div>
				</Dialog>
			</Transition.Root>
		</div>
	);
};

export default PolicyDetails;
