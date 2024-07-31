import { Transition, Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import React from 'react';

export interface ActionProps {
	title: string;
	component: JSX.Element;
}

interface ActionPanelProps {
	open: boolean;
	setOpen: (x: boolean) => void;
	action: ActionProps | null;
}

const ActionPanel = ({
	open,
	setOpen,
	action,
}: ActionPanelProps): JSX.Element => {
	return (
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
									></Transition.Child>
									<div className='flex h-full flex-col overflow-y-scroll bg-shark text-white text-xs py-8 shadow-xl'>
										<div className='px-8 flex flex-row justify-between items-center'>
											<Dialog.Title className='text-lg font-semibold'>
												{action?.title}
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
											{action?.component}
										</div>
									</div>
								</Dialog.Panel>
							</Transition.Child>
						</div>
					</div>
				</div>
			</Dialog>
		</Transition.Root>
	);
};

export default ActionPanel;
