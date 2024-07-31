import React, { useEffect, useState, Fragment } from 'react';
import { AdminUser } from '@/types/api';
import LoadingSpinner from '../LoadingSpinner';
import { BaseUrl, getApiHeaders } from '@/app/utils';
import { GetReportAccess } from '@/types/api/reportAccess';
import { Dialog, Transition } from '@headlessui/react';

const getReportResources = async (setRptResources: any): Promise<void> => {
	const response = await fetch(`${BaseUrl}/portal/app/resources?ro=1`, {
		method: 'GET',
		headers: await getApiHeaders(),
	});

	if (response.ok) {
		const rptAccess = (await response.json()) as GetReportAccess[];
		setRptResources(rptAccess || []);
	} else setRptResources([]);
};

const getUserResources = async (
	setUserResources: any,
	userId: number
): Promise<void> => {
	const response = await fetch(
		`${BaseUrl}/portal/app/user/resources?ro=1&uid=${userId}`,
		{
			method: 'GET',
			headers: await getApiHeaders(),
		}
	);

	if (response.ok) {
		const userAccess = (await response.json()) as GetReportAccess[];
		setUserResources(userAccess || []);
	} else setUserResources([]);
};

const isSelected = (arr: GetReportAccess[], id: number): boolean => {
	let rtnBln: boolean = false;
	for (let idx: number = 0; idx < arr.length; idx++) {
		if (arr[idx].appResourceId == id) {
			rtnBln = true;
			break;
		}
	}
	return rtnBln;
};

const getDefaultValues = (
	setSelectedAppIds: any,
	arr: GetReportAccess[]
): void => {
	if (arr.length) {
		const tmpArr: string[] = [];
		arr.map((obj) => {
			tmpArr.push(obj.appResourceId.toString());
		});
		setSelectedAppIds(tmpArr);

		const select = document.getElementById(
			'report-access'
		) as HTMLSelectElement;
		if (select) {
			const options: any = select.options;
			for (const option of options) {
				option.selected = false;
				for (const user of arr) {
					if (option.value == user.appResourceId)
						option.selected = true;
				}
			}
		}
	} else setSelectedAppIds([]);
};

const setSelectDefault = (setSelectedAppIds: any, evt: any): void => {
	const tmpArr: string[] = [];
	const options: any = evt.target.options;
	for (const option of options) {
		if (option.selected) tmpArr.push(option.value.toString());
	}
	setSelectedAppIds(tmpArr);
};

const confirmModal = (isOpen: boolean, setIsOpen: any) => {
	setIsOpen(!isOpen);
};

const ReportAccess = ({ adminUser }: { adminUser: AdminUser }): JSX.Element => {
	const [rptResources, setRptResources] = useState<GetReportAccess[]>([]);
	const [userResources, setUserResources] = useState<GetReportAccess[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [selectedAppIds, setSelectedAppIds] = useState<string[]>([]);
	const [submitDisabled, setSubmitDisabled] = useState<boolean>(true);
	const [submitMsg, setSubmitMsg] = useState<string>('');
	const [isOpen, setIsOpen] = useState<boolean>(false);

	const closeModal = (): void => {
		setIsOpen(false);
	};

	const confirmSubmit = async (): Promise<void> => {
		closeModal();
		setSubmitMsg('Submitting data...');

		const select = document.getElementById(
			'report-access'
		) as HTMLSelectElement;

		if (select) {
			const options: any = select.options;
			const chosenIdArr: number[] = [];
			for (const option of options) {
				if (option.selected) chosenIdArr.push(parseInt(option.value));
			}

			if (!chosenIdArr.length) chosenIdArr.push(0); // need to fudge population as the endpoint will bomb

			const response = await fetch(
				`${BaseUrl}/portal/app/user/resources`,
				{
					method: 'PUT',
					headers: await getApiHeaders(),
					body: JSON.stringify({
						uid: adminUser.userId,
						ids: chosenIdArr,
						ro: 1,
					}),
				}
			);

			const res: any = await response.json();

			if (!response.ok)
				setSubmitMsg('An error occurred when submitting the data.');
			else setSubmitMsg(res.message);
		}
	};

	useEffect(() => {
		getReportResources(setRptResources);
		getUserResources(setUserResources, adminUser.userId);
		getDefaultValues(setSelectedAppIds, userResources);
		setIsLoading(false);
	}, []);

	return (
		<div className='flex flex-col justify-between h-full'>
			{isLoading && <LoadingSpinner />}
			{!isLoading && (
				<form>
					<div className='flex flex-col pb-5'>
						<div className='w-full'>
							<span className='w-1/2 inline-block'>User:</span>
							<span className='w-1/2 inline-block'>
								{adminUser.name}
							</span>
						</div>
					</div>

					{submitMsg ? (
						<div className='flex flex-col pb-5 text-red-300'>
							{submitMsg}
						</div>
					) : (
						<>
							<div className='flex flex-col pb-5'>
								<div className='w-full'>
									<span className='w-1/2 inline-block'>
										Choose Report(s):
									</span>
									<span className='w-1/2 inline-block italic'>
										(`ctrl + click` for multiple)
									</span>
								</div>
								<br />
								{rptResources.length == 0 ? (
									<LoadingSpinner />
								) : (
									<select
										multiple
										size={10}
										id='report-access'
										className='h-80 rounded-md'
										defaultValue={selectedAppIds}
										onChange={(evt) => {
											evt.preventDefault();
											setSelectDefault(
												setSelectedAppIds,
												evt
											);
											setSubmitDisabled(false);
										}}
									>
										{rptResources.map((rpt) => (
											<option
												key={rpt.appResourceId}
												value={rpt.appResourceId.toString()}
												className='text-black'
												selected={isSelected(
													userResources,
													rpt.appResourceId
												)}
											>
												{rpt.name}
											</option>
										))}
									</select>
								)}
							</div>
							<br />
							<div className='flex flex-col pb-5'>
								<div className='w-full'>
									<span className='w-1/2 inline-block'>
										<button
											type='reset'
											className='bg-red-500 rounded-md shadow-sm px-4 py-2 hover:bg-red-300'
											onClick={(evt) => {
												evt.preventDefault();
												getDefaultValues(
													setSelectedAppIds,
													userResources
												);
												setSubmitDisabled(true);
											}}
										>
											Reset
										</button>
									</span>
									<span className='w-1/2 inline-block text-right'>
										<button
											type='button'
											className={`${
												submitDisabled
													? 'bg-slate-500'
													: 'bg-green-500'
											} rounded-md shadow-sm px-4 py-2 hover:bg-green-300`}
											disabled={submitDisabled}
											onClick={(evt) => {
												evt.preventDefault();
												confirmModal(isOpen, setIsOpen);
											}}
										>
											Submit
										</button>
									</span>
								</div>
							</div>
							{isOpen && (
								<ConfirmModal
									isOpen={isOpen}
									closeModal={closeModal}
									confirmSubmit={confirmSubmit}
								/>
							)}
						</>
					)}
				</form>
			)}
		</div>
	);
};

const ConfirmModal = ({
	isOpen,
	closeModal,
	confirmSubmit,
}: {
	isOpen: boolean;
	closeModal: any;
	confirmSubmit: any;
}): JSX.Element => {
	return (
		<Transition appear show={isOpen} as={Fragment}>
			<Dialog as='div' className='relative z-10' onClose={closeModal}>
				<Transition.Child
					as={Fragment}
					enter='ease-out duration-300'
					enterFrom='opacity-0'
					enterTo='opacity-100'
					leave='ease-in duration-200'
					leaveFrom='opacity-100'
					leaveTo='opacity-0'
				>
					<div className='fixed inset-0 bg-black/25' />
				</Transition.Child>

				<div className='fixed inset-0 overflow-y-auto'>
					<div className='flex min-h-full items-center justify-center p-4 text-center'>
						<Transition.Child
							as={Fragment}
							enter='ease-out duration-300'
							enterFrom='opacity-0 scale-95'
							enterTo='opacity-100 scale-100'
							leave='ease-in duration-200'
							leaveFrom='opacity-100 scale-100'
							leaveTo='opacity-0 scale-95'
						>
							<Dialog.Panel className='w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all'>
								<Dialog.Title
									as='h3'
									className='text-lg font-medium leading-6 text-gray-900'
								>
									Confirm submit
								</Dialog.Title>

								<div className='mt-2'>
									<p className='text-sm text-gray-500'>
										Please confirm that you want to change
										the report access for the chosen user.
									</p>
								</div>

								<div className='mt-4 w-full'>
									<span className='w-1/2 inline-block px-8'>
										<button
											type='button'
											className='inline-flex justify-center rounded-md border border-transparent bg-green-100 px-4 py-2 text-sm font-medium text-green-900 hover:bg-green-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2'
											onClick={confirmSubmit}
										>
											Yes, I agree
										</button>
									</span>

									<span className='w-1/2 inline-block px-8'>
										<button
											type='button'
											className='inline-flex justify-center rounded-md border border-transparent bg-red-100 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2'
											onClick={closeModal}
										>
											No thanks
										</button>
									</span>
								</div>
							</Dialog.Panel>
						</Transition.Child>
					</div>
				</div>
			</Dialog>
		</Transition>
	);
};

export default ReportAccess;
