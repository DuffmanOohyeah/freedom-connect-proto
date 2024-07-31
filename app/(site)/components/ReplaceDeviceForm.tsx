import { Dialog, Listbox, Transition } from '@headlessui/react';
import {
	CheckIcon,
	ChevronUpDownIcon,
	XMarkIcon,
} from '@heroicons/react/24/outline';
import { useState } from 'react';
import { BaseUrl, getApiHeaders, fullSignOut } from '@/app/utils';
import { useQuery } from '@tanstack/react-query';
import LoadingSpinner from './LoadingSpinner';
import {
	AddDeviceTypeProps,
	GetDeviceTypesResProps,
	ReplaceDeviceFormProps,
} from '@/types/api/deviceTypes';

const ReplaceDeviceForm = ({
	policy,
	created,
	setOpen,
}: ReplaceDeviceFormProps): JSX.Element => {
	const [deviceTypes, setDeviceTypes] = useState<GetDeviceTypesResProps[]>(
		[]
	);
	const [currentModel, setCurrentModel] = useState<string>('');
	const [selectedModelId, setSelectedModelId] = useState<number | null>(0);
	const [selectedSupplierId, setSelectedSupplierId] = useState<number | null>(
		0
	);
	const [enableSubmit, setEnableSubmit] = useState<boolean>(false);
	const [addDeviceMsg, setAddDeviceMsg] = useState<string>('');

	const opid = policy.policy.opid || 0;
	if (policy.devices && policy.devices[0].model && !currentModel)
		setCurrentModel(
			getDeviceLabel(
				'',
				policy.devices[0].model,
				policy.devices[0].supplier
			)
		); // aka "TrakM8 C330 (Supplier: TrakM8)"

	const { isLoading, isError } = useQuery(
		['getDeviceTypes'],
		async () => {
			const response = await fetch(
				`${BaseUrl}/portal/device/types?opid=${opid}`,
				{
					method: 'GET',
					headers: await getApiHeaders(),
				}
			);

			if (response.ok) {
				const successRes =
					(await response.json()) as GetDeviceTypesResProps[];
				if (successRes.length > 0) setDeviceTypes(successRes);
			} else {
				const failedRes = await response.json();
				if (failedRes.errorMessage == 'Unauthorised') fullSignOut();
				throw new Error('Network response was not ok');
			}

			return true;
		},
		{
			retry: false,
		}
	);

	const compatibleDeviceLabel: string = '- Send Compatible Device -';

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
							/>
							<div className='flex h-full flex-col overflow-y-scroll bg-shark text-white text-xs py-8 shadow-xl'>
								<div className='px-8 flex flex-row justify-between items-center'>
									<Dialog.Title className='text-lg font-semibold'>
										Replace Device
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

								{isLoading && <LoadingSpinner />}

								{isError && (
									<div className='w-full h-full flex flex-row justify-center items-center'>
										<br />
										An error occurred.
									</div>
								)}

								{deviceTypes.length > 0 && (
									<div className='mt-12 flex-1 px-8'>
										<div className='flex flex-col gap-10 divide-y divide-shark-400'>
											<h4 className='text-sm font-medium'>
												Choose Device Type:
											</h4>

											<Listbox
												onChange={() =>
													setEnableSubmit(true)
												}
											>
												<div className='relative'>
													<Listbox.Button className='relative listbox mt-4 px-4 border-0 bg-shark-400 shadow-none text-left'>
														<span
															className={`${
																!currentModel &&
																'text-white/50 font-medium'
															}`}
														>
															{currentModel ||
																'Choose option'}
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
															<Listbox.Option
																onClick={() => {
																	setSelectedModelId(
																		null
																	);
																	setSelectedSupplierId(
																		null
																	);
																	setCurrentModel(
																		compatibleDeviceLabel
																	);
																}}
																className={({
																	active,
																}) =>
																	`relative cursor-default select-none py-2 pl-10 pr-4 ${
																		active &&
																		'bg-shark-300'
																	}`
																}
																value={0}
															>
																{({
																	selected,
																}) => (
																	<>
																		{selected && (
																			<span className='absolute inset-y-0 left-0 flex items-center pl-3 text-jagged-ice'>
																				<CheckIcon
																					className='h-5 w-5'
																					aria-hidden='true'
																				/>
																			</span>
																		)}
																		<span
																			className={`block truncate ${
																				selected
																					? 'font-medium text-jagged-ice'
																					: 'font-normal'
																			}`}
																		>
																			{
																				compatibleDeviceLabel
																			}
																		</span>
																	</>
																)}
															</Listbox.Option>
															{deviceTypes.map(
																(
																	device,
																	idx
																) => (
																	<Listbox.Option
																		onClick={() => {
																			setSelectedModelId(
																				device.modelId
																			);
																			setSelectedSupplierId(
																				device.supplierId
																			);
																			setCurrentModel(
																				`${device.manufacturer} ${device.model}`
																			);
																		}}
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
																			device.modelId
																		}
																	>
																		{({
																			selected,
																		}) => (
																			<>
																				{selected && (
																					<span className='absolute inset-y-0 left-0 flex items-center pl-3 text-jagged-ice'>
																						<CheckIcon
																							className='h-5 w-5'
																							aria-hidden='true'
																						/>
																					</span>
																				)}
																				<span
																					className={`block truncate ${
																						selected
																							? 'font-medium text-jagged-ice'
																							: 'font-normal'
																					}`}
																				>
																					{`${getDeviceLabel(
																						device.manufacturer,
																						device.model,
																						device.supplier
																					)}`}
																				</span>
																			</>
																		)}
																	</Listbox.Option>
																)
															)}
														</Listbox.Options>
													</Transition>
												</div>
											</Listbox>

											{enableSubmit && (
												<button
													onClick={async () => {
														const addArgs = {
															opid: opid,
															deviceModelId:
																selectedModelId,
															deviceSupplierId:
																selectedSupplierId,
														};
														const submitMsg =
															await addDeviceType(
																addArgs
															);
														setAddDeviceMsg(
															submitMsg
														);
														setEnableSubmit(false);
														setTimeout(
															() => created(),
															5000
														);
													}}
													type='button'
													className='action-btn mt-12'
												>
													Submit
												</button>
											)}

											{!enableSubmit &&
												addDeviceMsg.length > 0 && (
													<>{addDeviceMsg}</>
												)}
										</div>
									</div>
								)}
							</div>
						</Dialog.Panel>
					</Transition.Child>
				</div>
			</div>
		</div>
	);
};

const addDeviceType = async ({
	opid,
	deviceModelId,
	deviceSupplierId,
}: AddDeviceTypeProps): Promise<string> => {
	let rtnMsg = 'Device type not selected';

	if (opid > 0) {
		const resBody = JSON.stringify({
			deviceRequestTypeId: 6, // 6 = replace (tbl: DeviceRequestType)
			opid: opid, // number
			deviceModelId: deviceModelId, // number || null
			deviceSupplierId: deviceSupplierId, // number || null
		});

		const response = await fetch(`${BaseUrl}/portal/device/request`, {
			method: 'POST',
			headers: await getApiHeaders(),
			body: resBody,
		});

		if (response.ok) rtnMsg = 'Device type added successfully';
		else rtnMsg = 'There was an error when adding a device type';
	}

	return rtnMsg;
};

const getDeviceLabel = (
	manufacturer: string,
	model: string,
	supplier: string
): string => {
	let rtnStr = '';
	if (manufacturer) rtnStr += manufacturer + ' ';
	rtnStr += model + ' ';
	rtnStr += '(Supplier: ' + supplier + ')';
	return rtnStr;
};

export default ReplaceDeviceForm;
