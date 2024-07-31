import React, { Fragment, useContext, useEffect, useState } from 'react';
import { format } from 'date-fns';
import { useMutation, useQuery } from '@tanstack/react-query';
import { BaseUrl, fullSignOut, getApiHeaders } from '@/app/utils';
import { GetPolicyRes, Policy } from '@/types/api';
import LoadingSpinner from '../LoadingSpinner';
import { BusinessUnitCtx } from '../providers/BusinessUnitProvider';
import BusinessUnitSelector from '../../reporting/BusinessUnitSelector';
import { Dialog, Transition } from '@headlessui/react';
import { setItem, getItem } from '@/app/(site)/hooks/useLocalStorage';
import { GetCurrentBusinessUnitProps } from '@/types/api/businessUnitProvider';

const DSReportsTelematicsReferrals = ({
	opid,
}: {
	opid: number;
}): JSX.Element => {
	const [policyObj, setPolicyObj] = useState<GetPolicyRes | null>(null);
	const {
		state: { businessUnit },
	} = useContext(BusinessUnitCtx)!;
	const dateNow: string = format(new Date(), 'yyyy-MM-dd');
	const [errMessage, setErrMessage] = useState<string>('');
	const [submitDisabled, setSubmitDisabled] = useState<boolean>(true);
	const [referredDate, setReferredDate] = useState<string>(dateNow);
	const [responseDate, setResponseDate] = useState<string>(dateNow);
	const [processLinkedTo, setProcessLinkedTo] = useState<string>('');
	const [proofReceived, setProofReceived] = useState<string>('');
	const [queryDetail, setQueryDetail] = useState<string>('');
	const [responseText, setResponseText] = useState<string>('');
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const [buObj, setBuObj] = useState<GetCurrentBusinessUnitProps>({
		id: 0,
		name: '',
	});

	const closeModal = (): void => {
		setIsOpen(false);
	};

	const { isLoading } = useQuery(
		['getPolicyDetails'],
		async () => {
			const response = await fetch(
				`${BaseUrl}/portal/policy?opid=${opid}`,
				{
					method: 'GET',
					headers: await getApiHeaders(),
				}
			);
			if (!response.ok) {
				const res = await response.json();
				if (res.errorMessage == 'Unauthorised') fullSignOut();
				setErrMessage('Network response was not ok.');
			}
			const resPolicies = (await response.json()) as GetPolicyRes;
			setPolicyObj(resPolicies);

			/* start: set BU local storage based on incoming policy vars */
			if (resPolicies.policy) {
				const { businessUnit: buName, businessUnitId: buId } =
					resPolicies.policy;
				if (buName.length && buId && buId > 0) {
					setItem(
						'businessUnit',
						JSON.stringify({
							id: buId,
							name: buName,
						})
					);
				}
			}
			/* end: set BU local storage based on incoming policy vars */

			return true;
		},
		{
			retry: false,
		}
	);

	const canSubmit = (): void => {
		if (
			businessUnit &&
			referredDate &&
			responseDate &&
			(processLinkedTo || queryDetail || proofReceived || responseText)
		) {
			{
				setSubmitDisabled(false);
				setErrMessage('');
			}
		} else {
			setSubmitDisabled(true);
			setErrMessage(
				'Please polulate all required fields (& at least one optional).'
			);
		}
	};

	const confirmModal = (isOpen: boolean, setIsOpen: any): void => {
		setIsOpen(!isOpen);
	};

	const submitForm = useMutation(['submitReferral'], {
		mutationFn: async (): Promise<boolean> => {
			let rtnBln: boolean = false;
			setIsOpen(!isOpen);
			setSubmitDisabled(true);
			setErrMessage('Submitting data...');
			let unitId: number = 0;
			if (buObj.id > 0) unitId = buObj.id;

			const response = await fetch(
				`${BaseUrl}/portal/policy/telematics/referrals`,
				{
					body: JSON.stringify({
						opid: opid,
						unitId: unitId,
						referredDate: referredDate,
						processLinkedTo: processLinkedTo,
						queryDetail: queryDetail,
						proofReceived: proofReceived,
						responseText: responseText,
						responseDate: responseDate,
					}),
					headers: await getApiHeaders(),
					method: 'POST',
				}
			);

			const res = await response.json();
			if (!response.ok) setErrMessage(res.errorMessage);
			else {
				setErrMessage('Data submitted successfully.');
				rtnBln = true;
			}

			return rtnBln;
		},
	});

	useEffect(() => {
		const lsBuItem: string | null = getItem('businessUnit'); // get BU attribues from local storage
		if (policyObj) {
			const { policy }: GetPolicyRes = policyObj;
			const {
				businessUnitId: policyBuId,
				businessUnit: policyBuName,
			}: Policy = policy;
			if (policyBuId && policyBuId > 0)
				setBuObj({ id: Number(policyBuId), name: policyBuName });
		} else if (lsBuItem) {
			const { id, name }: GetCurrentBusinessUnitProps =
				JSON.parse(lsBuItem);
			setBuObj({ id: Number(id), name: name });
		} else if (businessUnit && businessUnit.unitId > 0) {
			const { unitId, name } = businessUnit;
			setBuObj({
				id: Number(unitId),
				name: name,
			});
		}
	}, [policyObj, businessUnit]);

	return (
		<div className='bg-white rounded-2xl shadow-tile-shadow px-8 py-6 w-full text-shark'>
			<div className='justify-between'>
				<h1 className='basis-1/8 text-lg font-semibold flex items-center whitespace-pre mr-4'>
					Telematics Referrals
				</h1>

				<div className='gap-8 whitespace-pre pt-4'>
					{errMessage && (
						<div className='text-red-500 text-sm pb-6'>
							{errMessage}
						</div>
					)}
					{isLoading && <LoadingSpinner />}
					{!isLoading && (
						<form>
							<div className='w-full text-xs pb-5'>
								<span className='w-1/6 inline-block'>
									Policy No:
								</span>
								<div className='inline-block'>
									<span className='pr-2'>
										{policyObj?.policy.policyNo}
									</span>
									(Ref: {policyObj?.policy.policyRef})
								</div>
							</div>

							<div className='w-full text-xs pb-5'>
								<span className='w-1/6 inline-block'>
									Broker: *
								</span>
								<span className='inline-block'>
									{buObj.name !== '' ? (
										`${buObj.name}`
									) : (
										<BusinessUnitSelector
											showGoBtn={false}
										/>
									)}
								</span>
							</div>

							<div className='w-full text-xs pb-5'>
								<span className='w-1/6 inline-block'>
									<label
										htmlFor='referredDate'
										className='font-normal'
									>
										Date Referred: *
									</label>
								</span>
								<span className='inline-block'>
									<input
										className={`w-48 border-0 bg-placeholder-bg font-medium focus:text-black focus:font-normal focus:ring-0 shadow-none rounded-md ${
											referredDate
												? 'text-black'
												: 'text-placeholder-text'
										}`}
										id='referredDate'
										type='date'
										value={referredDate}
										onChange={(
											evt: React.ChangeEvent<HTMLInputElement>
										) => {
											evt.preventDefault();
											setReferredDate(evt.target.value);
										}}
										onBlur={() => canSubmit()}
									/>
								</span>
							</div>

							<div className='w-full text-xs pb-5'>
								<span className='w-1/6 inline-block'>
									Inception Date:
								</span>
								<span className='inline-block'>
									{policyObj?.policy.inceptionDate}
								</span>
							</div>

							<div className='w-full text-xs pb-5'>
								<span className='w-1/6 inline-block'>
									<label
										htmlFor='processLinkedTo'
										className='font-normal'
									>
										Process Linked To:
									</label>
								</span>
								<span className='w-4/6 inline-block'>
									<input
										type='text'
										id='processLinkedTo'
										className='rounded-md'
										value={processLinkedTo}
										onChange={(
											evt: React.ChangeEvent<HTMLInputElement>
										) => {
											evt.preventDefault();
											setProcessLinkedTo(
												evt.target.value
											);
											canSubmit();
										}}
										onBlur={() => canSubmit()}
									/>
								</span>
							</div>

							<div className='w-full text-xs pb-5'>
								<span className='w-1/6 inline-block align-top'>
									<label
										htmlFor='queryDetail'
										className='font-normal'
									>
										Query Detail:
									</label>
								</span>
								<span className='w-4/6 inline-block'>
									<textarea
										className='h-28 rounded-md'
										value={queryDetail}
										id='queryDetail'
										onChange={(
											evt: React.ChangeEvent<HTMLTextAreaElement>
										) => {
											evt.preventDefault();
											setQueryDetail(evt.target.value);
										}}
										onBlur={() => canSubmit()}
									/>
								</span>
							</div>

							<div className='w-full text-xs pb-5'>
								<span className='w-1/6 inline-block'>
									<label
										htmlFor='proofReceived'
										className='font-normal'
									>
										Proof Received:
									</label>
								</span>
								<span className='w-4/6 inline-block'>
									<input
										type='text'
										className='rounded-md'
										value={proofReceived}
										id='proofReceived'
										onChange={(
											evt: React.ChangeEvent<HTMLInputElement>
										) => {
											evt.preventDefault();
											setProofReceived(evt.target.value);
										}}
										onBlur={() => canSubmit()}
									/>
								</span>
							</div>

							<div className='w-full text-xs pb-5'>
								<span className='w-1/6 inline-block align-top'>
									<label
										htmlFor='responseText'
										className='font-normal'
									>
										Response:
									</label>
								</span>
								<span className='w-4/6 inline-block'>
									<textarea
										className='h-28 rounded-md'
										value={responseText}
										id='responseText'
										onChange={(
											evt: React.ChangeEvent<HTMLTextAreaElement>
										) => {
											evt.preventDefault();
											setResponseText(evt.target.value);
										}}
										onBlur={() => canSubmit()}
									/>
								</span>
							</div>

							<div className='w-full text-xs pb-5'>
								<span className='w-1/6 inline-block'>
									<label
										htmlFor='responseDate'
										className='font-normal'
									>
										Response Date: *
									</label>
								</span>
								<span className='inline-block'>
									<input
										className={`w-48 border-0 bg-placeholder-bg font-medium focus:text-black focus:font-normal focus:ring-0 shadow-none rounded-md ${
											responseDate
												? 'text-black'
												: 'text-placeholder-text'
										}`}
										type='date'
										value={responseDate}
										id='responseDate'
										onChange={(
											evt: React.ChangeEvent<HTMLInputElement>
										) => {
											evt.preventDefault();
											setResponseDate(evt.target.value);
										}}
										onBlur={() => canSubmit()}
									/>
								</span>
							</div>

							<div className='w-full text-xs pb-5'>
								<span className='w-4/5 inline-block text-right'>
									<button
										type='button'
										className={`${
											submitDisabled
												? 'bg-slate-500 text-white'
												: 'bg-green-500 text-slate-900 hover:bg-green-300'
										} rounded-md shadow-sm px-4 py-2 font-semibold`}
										disabled={submitDisabled}
										onClick={async (
											evt: React.MouseEvent<
												HTMLButtonElement,
												MouseEvent
											>
										) => {
											evt.preventDefault();
											confirmModal(isOpen, setIsOpen);
											// submitForm.mutate();
										}}
									>
										Submit
									</button>
								</span>
							</div>
							{isOpen && (
								<ConfirmModal
									isOpen={isOpen}
									closeModal={closeModal}
									confirmSubmit={submitForm.mutate}
								/>
							)}
						</form>
					)}
				</div>
			</div>
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
										Please confirm that you want to add a
										new telematics referral for the chosen
										policy.
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

export default DSReportsTelematicsReferrals;
