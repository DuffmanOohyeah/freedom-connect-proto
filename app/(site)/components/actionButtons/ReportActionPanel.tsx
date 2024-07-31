import { Transition, Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import { BiArrowBack } from 'react-icons/bi';
import PolicyNotesTable from '../notes/PolicyNotesTable';
import CreateNote from '../notes/CreateNote';
import Link from 'next/link';
import {
	ReportActionComponent,
	ReportActionLink,
} from '@/types/api/reportActionPanel';

export type ReportAction = ReportActionComponent | ReportActionLink;

export interface ActionPolicy {
	policyNumber: string;
	opid: number;
	customActions: ReportAction[];
}

const ReportActionPanel = ({
	policy,
}: {
	policy: ActionPolicy | null;
}): JSX.Element => {
	const [open, setOpen] = useState<boolean>(false);
	const [selectedAction, setSelectedAction] =
		useState<ReportActionComponent | null>(null);
	const [actions, setActions] = useState<ReportAction[]>([]);

	useEffect(() => {
		setSelectedAction(null);
		if (policy) {
			const { customActions, opid }: ActionPolicy = policy;
			const defaultActions: ReportAction[] = [
				{
					type: 'link',
					title: 'Go to Policy',
					href: `/policies/${opid}/policyholderdetails`,
				},
				{
					type: 'component',
					title: 'View Notes',
					component: (
						<PolicyNotesTable
							opid={opid.toString()}
							indexNumber={0}
						/>
					),
				},
				{
					type: 'component',
					title: 'Add Note',
					component: (
						<CreateNote
							opid={opid.toString()}
							policySpecfic={true}
							created={() => setOpen(false)}
						/>
					),
				},
			];
			setActions([...defaultActions, ...customActions]);
			setOpen(true);
		} else setOpen(false);
	}, [policy]);

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
									{selectedAction &&
									selectedAction.type === 'component' ? (
										<div className='flex h-full flex-col overflow-y-scroll bg-shark text-white text-xs py-8 shadow-xl'>
											<div className='px-8 flex flex-row justify-between items-center'>
												<Dialog.Title className='text-lg font-semibold flex flex-row gap-4 '>
													<button>
														<BiArrowBack
															className='w-5'
															onClick={() =>
																setSelectedAction(
																	null
																)
															}
														/>
													</button>
													{selectedAction?.title}
												</Dialog.Title>
												<button
													type='button'
													className='rounded-md hover:text-jagged-ice focus:outline-none focus:ring-0'
													onClick={() =>
														setOpen(false)
													}
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
												{selectedAction?.component}
											</div>
										</div>
									) : (
										<div className='flex h-full flex-col overflow-y-scroll bg-shark text-white text-xs py-8 shadow-xl'>
											<div className='px-8 flex flex-row justify-between items-center'>
												<Dialog.Title className='text-lg font-semibold'>
													{policy &&
														`Policy No: ${policy.policyNumber}`}
												</Dialog.Title>
												<button
													type='button'
													className='rounded-md hover:text-jagged-ice focus:outline-none focus:ring-0'
													onClick={() =>
														setOpen(false)
													}
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
											<div className='mt-12 px-8 flex flex-wrap gap-2'>
												{actions.map(
													(action, index) => {
														if (
															action.type ===
															'component'
														) {
															return (
																<button
																	key={index}
																	className='action-btn'
																	onClick={() =>
																		setSelectedAction(
																			action
																		)
																	}
																>
																	{
																		action.title
																	}
																</button>
															);
														} else {
															return (
																<Link
																	key={index}
																	className='action-btn text-center'
																	href={
																		action.href
																	}
																>
																	{
																		action.title
																	}
																</Link>
															);
														}
													}
												)}
											</div>
										</div>
									)}
								</Dialog.Panel>
							</Transition.Child>
						</div>
					</div>
				</div>
			</Dialog>
		</Transition.Root>
	);
};

export default ReportActionPanel;
