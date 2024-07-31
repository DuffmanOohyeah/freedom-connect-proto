'use client';
import DeviceHistory from '@/app/(site)/components/device/DeviceHistory';
import ReplaceDevice from '@/app/(site)/components/device/ReplaceDevice';
import { DeviceDetails } from '@/types/api';
import { format } from 'date-fns';
import { useContext, useEffect, useState } from 'react';
import {
	PolicyContextInterface,
	PolicyContext,
} from '../../../components/PolicyContext';

const DeviceDetailsPage = (): JSX.Element => {
	const { policy, isLoading } =
		useContext<PolicyContextInterface>(PolicyContext);
	const [devices, setDevices] = useState<DeviceDetails[]>([]);
	const dtMask: string = 'd-MMM-yyyy, HH:mm';

	useEffect(() => {
		if (policy && !isLoading) {
			const { devices } = policy;
			if (devices) setDevices(devices);
		}
	}, [policy]);

	return (
		<div className='p-7 2xl:pl-4 2xl:pr-0'>
			<div className='flex flex-row 2xl:flex-row gap-8 2xl:gap-12'>
				<div className='basis-1/2 flex flex-col gap-0.5 whitespace-pre'>
					{devices
						.sort((a: DeviceDetails, b: DeviceDetails) => {
							const aDate = new Date(a.assignedBy).getTime();
							const bDate = new Date(b.assignedBy).getTime();

							if (aDate > bDate) return 1;
							else if (aDate < bDate) return -1;
							else return 0;
						})
						.map((device: DeviceDetails, idx: number) => {
							const {
								lastLongitude,
								lastPluginDTM,
								firstPluginDTM,
								lastHeartbeatDTM,
								lastDataDTM,
								lastUnPlugDTM,
								model,
								dispatchedDTM,
								lastTripEndDTM,
								unassignedDTM,
								barcode,
								lastLatitude,
								status,
								supplier,
							} = device;

							let unassignedDate: string = '';
							let fontColor: string = 'text-shark';
							if (unassignedDTM) {
								unassignedDate = format(
									new Date(unassignedDTM),
									dtMask
								);
								fontColor = 'text-slate-400';
							}

							return (
								<div
									className={`bg-white rounded-2xl shadow-tile-shadow px-8 py-6 mt-12 w-full ${fontColor}`}
									key={idx}
								>
									<h1 className='text-lg font-semibold mb-10'>
										Device Overview
										<br />
										{unassignedDate && (
											<span className='text-sm text-red-400'>
												{`(Unassigned on ${unassignedDate})`}
											</span>
										)}
									</h1>
									<div className='flex gap-2 justify-between w-full mb-8'>
										<span
											className={`text-xs ${fontColor}`}
										>
											Device ID
										</span>
										<span
											className={`text-xs font-semibold ${fontColor}`}
										>
											{barcode}
										</span>
									</div>
									<div className='flex gap-2 justify-between w-full mb-8'>
										<span
											className={`text-xs ${fontColor}`}
										>
											Supplier
										</span>
										<span
											className={`text-xs font-semibold ${fontColor}`}
										>
											{supplier}
										</span>
									</div>
									<div className='flex gap-2 justify-between w-full mb-8'>
										<span
											className={`text-xs ${fontColor}`}
										>
											Device Model
										</span>
										<span
											className={`text-xs font-semibold ${fontColor}`}
										>
											{model}
										</span>
									</div>
									<div className='flex gap-2 justify-between w-full mb-8'>
										<span
											className={`text-xs ${fontColor}`}
										>
											Dispatched Date
										</span>
										<span
											className={`text-xs font-semibold ${fontColor}`}
										>
											{dispatchedDTM &&
												format(
													new Date(dispatchedDTM),
													dtMask
												)}
										</span>
									</div>
									<div className='flex justify-between w-full'>
										<span
											className={`text-xs ${fontColor}`}
										>
											Status
										</span>
										<span
											className={`text-xs font-semibold ${fontColor}`}
										>
											{status}
										</span>
									</div>

									<div className='py-6 w-full' key={barcode}>
										<h1 className='text-lg font-semibold mb-10'>
											Activity
										</h1>

										{firstPluginDTM && (
											<div className='flex gap-2 justify-between w-full mb-8'>
												<span
													className={`text-xs ${fontColor}`}
												>
													First Plug In DTM
												</span>
												<span
													className={`text-xs font-semibold ${fontColor}`}
												>
													{format(
														new Date(
															firstPluginDTM
														),
														dtMask
													)}
												</span>
											</div>
										)}

										{lastPluginDTM && (
											<div className='flex gap-2 justify-between w-full mb-8'>
												<span
													className={`text-xs ${fontColor}`}
												>
													Last Plug In DTM
												</span>
												<span
													className={`text-xs font-semibold ${fontColor}`}
												>
													{format(
														new Date(lastPluginDTM),
														dtMask
													)}
												</span>
											</div>
										)}

										{lastUnPlugDTM && (
											<div className='flex gap-2 justify-between w-full mb-8'>
												<span
													className={`text-xs ${fontColor}`}
												>
													Last Unplug DTM
												</span>
												<span
													className={`text-xs font-semibold ${fontColor}`}
												>
													{format(
														new Date(lastUnPlugDTM),
														dtMask
													)}
												</span>
											</div>
										)}

										{lastTripEndDTM && (
											<div className='flex gap-2 justify-between w-full mb-8'>
												<span
													className={`text-xs ${fontColor}`}
												>
													Last Trip End DTM
												</span>
												<span
													className={`text-xs font-semibold ${fontColor}`}
												>
													{format(
														new Date(
															lastTripEndDTM
														),
														dtMask
													)}
												</span>
											</div>
										)}

										{lastHeartbeatDTM && (
											<div className='flex gap-2 justify-between w-full mb-8'>
												<span
													className={`text-xs ${fontColor}`}
												>
													Last Heartbeat DTM
												</span>
												<span
													className={`text-xs font-semibold ${fontColor}`}
												>
													{format(
														new Date(
															lastHeartbeatDTM
														),
														dtMask
													)}
												</span>
											</div>
										)}

										{lastDataDTM && (
											<div className='flex gap-2 justify-between w-full mb-8'>
												<span
													className={`text-xs ${fontColor}`}
												>
													Latest Location DTM
												</span>
												<span
													className={`text-xs font-semibold ${fontColor}`}
												>
													{format(
														new Date(lastDataDTM),
														dtMask
													)}
												</span>
											</div>
										)}

										{lastLongitude && (
											<div className='flex gap-2 justify-between w-full mb-8'>
												<span
													className={`text-xs ${fontColor}`}
												>
													Latest Longitude
												</span>
												<span
													className={`text-xs font-semibold ${fontColor}`}
												>
													{Math.round(
														lastLongitude * 1000000
													) / 1000000}
												</span>
											</div>
										)}

										{lastLatitude && (
											<div className='flex justify-between w-full'>
												<span
													className={`text-xs ${fontColor}`}
												>
													Latest Latitude
												</span>
												<span
													className={`text-xs font-semibold ${fontColor}`}
												>
													{Math.round(
														lastLatitude * 1000000
													) / 1000000}
												</span>
											</div>
										)}
									</div>
								</div>
							);
						})}
				</div>

				<div className='basis-1/2 flex flex-col 2xl:mt-14 overflow-y-scroll 2xl:max-h-[793px] relative'>
					{policy && <ReplaceDevice policy={policy} />}
					<DeviceHistory devices={devices} />
				</div>
			</div>
		</div>
	);
};

export default DeviceDetailsPage;
