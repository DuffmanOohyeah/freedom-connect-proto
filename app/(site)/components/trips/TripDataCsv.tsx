import {
	useAllTripWaypoints,
	checkTripDateRange,
} from '../../hooks/useAllTripWaypoints';
import { CSVLink } from 'react-csv';
import { TripSearchProps } from '@/types/api/tripDetails';
import LoadingSpinner from '../LoadingSpinner';
import { Fragment, useRef, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { ChartBarIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { Waypoint } from '@/types/api';

const TripDataCsv = ({
	opid,
	fromDate,
	toDate,
	dayRange = 7,
}: TripSearchProps): JSX.Element => {
	const [open, setOpen] = useState<boolean>(true);
	const cancelButtonRef = useRef(null);
	const [waypointsCsv, setWaypointsCsv] = useState<Waypoint[]>([]);
	const { waypoints, loading } = useAllTripWaypoints({
		opid,
		fromDate,
		toDate,
		dayRange,
	});

	/* start: FCWS-165_v2 */
	if (!loading && !waypointsCsv.length) {
		waypoints.sort((a, b) =>
			a.localDTM > b.localDTM ? 1 : b.localDTM > a.localDTM ? -1 : 0
		); // sort by date asc
		const tmpArr: Waypoint[] = [];

		waypoints.map((row) => {
			tmpArr.push({
				satellites: row.satellites,
				speedMph: row.speedMph,
				speedLimitMph: row.speedLimitMph,
				localDTM: row.localDTM.split(' ')[0], // should return dd/mm/yyyy -- see: \resource_handlers\adminPortal\policy\view-trip-handler.js
				type: row.type,
				lat: row.lat,
				long: row.long,
				speeding: row.speeding,
				harshCorner: row.harshCorner,
				harshBrake: row.harshBrake,
				excessiveSpeed: row.excessiveSpeed,
				harshAccel: row.harshAccel,
			});
		});

		if (tmpArr.length) setWaypointsCsv(tmpArr);
	}
	/* end: FCWS-165_v2 */

	return (
		<>
			{loading ? (
				<>
					Building trip data CSV ...
					<LoadingSpinner />
				</>
			) : !checkTripDateRange(fromDate, toDate, dayRange) ? (
				<div>Cannot create CSV; day range exceeds {dayRange} days.</div>
			) : waypointsCsv.length === 0 ? (
				<div>There is no trip data for search parameters provided.</div>
			) : (
				waypointsCsv.length > 0 && (
					<Transition.Root show={open} as={Fragment}>
						<Dialog
							as='div'
							className='relative z-10'
							initialFocus={cancelButtonRef}
							onClose={setOpen}
						>
							<Transition.Child
								as={Fragment}
								enter='ease-out duration-300'
								enterFrom='opacity-0'
								enterTo='opacity-100'
								leave='ease-in duration-200'
								leaveFrom='opacity-100'
								leaveTo='opacity-0'
							>
								<div className='fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity' />
							</Transition.Child>

							<div className='fixed inset-0 z-10 w-screen overflow-y-auto'>
								<div className='flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0'>
									<Transition.Child
										as={Fragment}
										enter='ease-out duration-300'
										enterFrom='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
										enterTo='opacity-100 translate-y-0 sm:scale-100'
										leave='ease-in duration-200'
										leaveFrom='opacity-100 translate-y-0 sm:scale-100'
										leaveTo='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
									>
										<Dialog.Panel className='relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg'>
											<div className='bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4'>
												<div className='sm:flex sm:items-start'>
													<div className='mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10'>
														<ChartBarIcon
															className='h-6 w-6 text-red-600'
															aria-hidden='true'
														/>
													</div>
													<div className='mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left'>
														<Dialog.Title
															as='h3'
															className='text-base font-semibold leading-6 text-gray-900'
														>
															Trip date CSV ready
															to download.
														</Dialog.Title>
														{
															<div className='mt-2'>
																<p className='text-sm text-gray-500'>
																	This trip
																	report
																	should
																	contain all
																	waypoints
																	for the
																	journey in
																	question.
																	{fromDate &&
																		toDate && (
																			<>
																				<br />
																				Date
																				range:{' '}
																				{format(
																					new Date(
																						fromDate
																					),
																					'dd/MM/yyyy'
																				)}{' '}
																				-{' '}
																				{format(
																					new Date(
																						toDate
																					),
																					'dd/MM/yyyy'
																				)}
																			</>
																		)}
																	<br />
																	Waypoints
																	found:{' '}
																	{
																		waypointsCsv.length
																	}
																</p>
															</div>
														}
													</div>
												</div>
											</div>
											<div className='bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6'>
												<CSVLink
													className='action-btn mx-2 flex justify-center items-center w-32 max-w-32 font-semibold shadow-sm'
													data={waypointsCsv}
													filename={`${opid}-tripdata-${new Date().toISOString()}.csv`}
													onClick={() => {
														setOpen(false);
														setTimeout(() => {
															window.close();
														}, 3000);
													}}
												>
													Download CSV
												</CSVLink>
												<button
													type='button'
													className='action-btn mt-3 inline-flex w-full justify-center bg-red-100 font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto'
													onClick={() => {
														setOpen(false);
														window.close();
													}}
													ref={cancelButtonRef}
												>
													Cancel
												</button>
											</div>
										</Dialog.Panel>
									</Transition.Child>
								</div>
							</div>
						</Dialog>
					</Transition.Root>
				)
			)}
		</>
	);
};

export default TripDataCsv;
