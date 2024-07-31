import { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import ReplaceDeviceForm from '../ReplaceDeviceForm';

const ReplaceDevice = ({ policy }: any): JSX.Element => {
	const [open, setOpen] = useState<boolean>(false);

	return (
		<>
			{policy.devices?.length > 0 && (
				<>
					<button
						className='action-btn w-40'
						onClick={() => setOpen(true)}
					>
						Replace Device
					</button>

					<br />

					<Transition.Root show={open} as='div'>
						<Dialog
							as='div'
							className='relative z-50'
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
							<ReplaceDeviceForm
								policy={policy}
								created={() => {
									setOpen(false);
								}}
								setOpen={(x) => setOpen(x)}
							/>
						</Dialog>
					</Transition.Root>
				</>
			)}
		</>
	);
};

export default ReplaceDevice;
