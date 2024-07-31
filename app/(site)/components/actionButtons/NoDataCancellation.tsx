import { BaseUrl, getApiHeaders } from '@/app/utils';
import { DeviceDetails } from '@/types/api';
import { Listbox } from '@headlessui/react';
import { useMutation } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';

const NoDataCancellation = ({
	opid,
	devices,
}: {
	opid: any;
	devices: DeviceDetails[] | null | undefined;
}): JSX.Element => {
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [success, setSuccess] = useState<boolean>(false);
	const [selectedDevice, setSelectedDevice] =
		useState<DeviceDetails | null>();
	const action = useMutation(['deviceNoDataCancellation'], {
		mutationFn: async (): Promise<boolean> => {
			const response = await fetch(
				`${BaseUrl}/portal/device/cancel-for-nodata`,
				{
					method: 'POST',
					body: JSON.stringify({
						opid: opid,
						barcode: selectedDevice?.barcode,
					}),
					headers: await getApiHeaders(),
				}
			);

			const res = await response.json();
			if (!response.ok) {
				console.error(res);
				setErrorMessage('An error occurred');
				return false;
			} else {
				setSuccess(true);
				return true;
			}
		},
	});

	useEffect(() => {
		if (devices && devices.length > 0) setSelectedDevice(devices[0]);
		else setErrorMessage('No Devices');
	}, [devices]);

	return (
		<div className='flex flex-col justify-between h-full'>
			<div>
				{devices && devices.length > 0 && selectedDevice ? (
					<>
						<label>
							<span className='text-white my-4'>
								Please Select the Correct Device
							</span>
						</label>
						<Listbox
							value={selectedDevice}
							onChange={setSelectedDevice}
						>
							<Listbox.Button className='relative listbox mt-4 px-4 border-0 bg-placeholder-bg shadow-none text-left text-shark'>
								{selectedDevice.barcode}
							</Listbox.Button>
							<Listbox.Options className='absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-placeholder-bg py-1 text-shark text-xs shadow-lg'>
								{devices.map((device) => (
									<Listbox.Option
										key={device.barcode}
										value={device}
									>
										{device.barcode}
									</Listbox.Option>
								))}
							</Listbox.Options>
						</Listbox>
					</>
				) : (
					<span className='text-white'>
						No Devices assigned to policy
					</span>
				)}
				<p className='text-xs text-center mt-12'>
					You are about to raise a cancellation for device no data.
					(OPID: {opid} Barcode:{' '}
					{selectedDevice?.barcode ?? 'No Device Selected'})
				</p>
				<p className='text-xs text-center mt-6'>
					Please click Confirm below to do this
				</p>
			</div>
			<div className='flex flex-col gap-2 w-full'>
				{errorMessage && (
					<p className='text-xs text-center text-red-700'>
						{errorMessage}
					</p>
				)}
				<button
					onClick={() => action.mutate()}
					disabled={errorMessage ? true : false}
					className='action-btn'
				>
					{action.isLoading ? 'Loading' : 'Confirm'}
				</button>
				{success && (
					<p className='text-jagged-ice text-xs text-center'>Sent</p>
				)}
			</div>
		</div>
	);
};

export default NoDataCancellation;
