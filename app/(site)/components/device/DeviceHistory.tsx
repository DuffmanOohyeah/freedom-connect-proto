import { DeviceDetails } from '@/types/api';
import { format } from 'date-fns';
import React from 'react';
import { FaCheck } from 'react-icons/fa';

interface DeviceHistory {
	date: string;
	unplug: boolean;
	description: string;
}

const DeviceHistory = ({
	devices,
}: {
	devices: DeviceDetails[];
}): JSX.Element => {
	const dtFormat: string = 'yyyy-MM-dd HH:mm';

	return (
		<>
			<div className='flex flex-row justify-between items-center'>
				<h1 className='text-lg font-semibold sticky top-0 bg-gradient-to-b from-aqua-haze via-aqua-haze to-transparent pb-12 z-50'>
					Device History
				</h1>
			</div>

			<div className='flex flex-col gap-12 ml-3 mt-0 pl-8 2xl:pr-6 pb-8 border-l-2 border-shark'>
				{devices.map((device, index) => {
					let unassignedDate: string = '';
					let fontColor: string = 'text-shark';
					if (device.unassignedDTM) {
						unassignedDate = format(
							new Date(device.unassignedDTM),
							dtFormat
						);
						fontColor = 'text-slate-400';
					}

					return (
						<div
							key={index}
							className='flex flex-col gap-4 relative'
						>
							<span className='text-[8px] text-shark bg-jagged-ice border-4 border-aqua-haze rounded-full p-[6px] absolute -left-[47px] -top-[6px]'>
								<FaCheck />
							</span>
							{/* <p className='text-xs'>{format(new Date(device.lastUnPlugDTM), dtFormat)}</p> */}
							<div className='bg-white rounded-2xl shadow-tile-shadow px-6 py-4 w-full flex flex-col gap-4'>
								<div className='flex justify-between'>
									<h4
										className={`text-xs font-semibold ${fontColor}`}
									>
										Device ID: {device.barcode}
									</h4>
								</div>

								<div className='flex flex-col justify-between'>
									{device.assignedDTM && (
										<p className={`text-xs ${fontColor}`}>
											Device Assigned:{' '}
											{format(
												new Date(device.assignedDTM),
												dtFormat
											)}
										</p>
									)}

									{device.firstPluginDTM && (
										<p className={`text-xs ${fontColor}`}>
											First Plugin:{' '}
											{format(
												new Date(device.firstPluginDTM),
												dtFormat
											)}
										</p>
									)}

									{device.deviceRequestedFromSupplier && (
										<p className={`text-xs ${fontColor}`}>
											Supplier Requested:{' '}
											{format(
												new Date(
													device.deviceRequestedFromSupplier
												),
												dtFormat
											)}
										</p>
									)}

									{device.model && (
										<p className={`text-xs ${fontColor}`}>
											Supplier Model: {device.model}
										</p>
									)}

									{unassignedDate && (
										<p className='text-xs text-red-400'>
											Device Unassigned: {unassignedDate}
										</p>
									)}
								</div>
							</div>
						</div>
					);
				})}
			</div>

			<div className='sticky bottom-0 min-h-[50px] bg-gradient-to-t from-aqua-haze via-aqua-haze to-transparent z-50' />
		</>
	);
};

export default DeviceHistory;
