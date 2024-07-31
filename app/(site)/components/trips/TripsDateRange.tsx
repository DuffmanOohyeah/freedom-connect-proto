import { MonthlyTrip, GetPolicyTrips, IndividualTrip } from '@/types/api';
import { BaseUrl, getApiHeaders, fullSignOut } from '@/app/utils';
import { ArrowsPointingOutIcon } from '@heroicons/react/24/outline';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import React, { useState } from 'react';
import LoadingSpinner from '../LoadingSpinner';
import { checkTripDateRange } from '../../hooks/useAllTripWaypoints';
import { TripSearchProps } from '@/types/api/tripDetails';

const TripsDateRange = ({
	opid,
	fromDate,
	toDate,
	dayRange = 7,
}: TripSearchProps): JSX.Element => {
	const [monthlyTrips, setMonthlyTrips] = useState<MonthlyTrip[] | null>(
		null
	);
	const [trips, setTrips] = useState<IndividualTrip[]>([]);

	const { isLoading } = useQuery(
		['getPolicyTrips', fromDate, toDate],
		async () => {
			let rtnBln: boolean = false;
			if (fromDate && toDate) {
				const response = await fetch(
					`${BaseUrl}/portal/policy/trips?opid=${opid}&f=${fromDate}&t=${toDate}`,
					{
						method: 'GET',
						headers: await getApiHeaders(),
					}
				);
				const res = (await response.json()) as GetPolicyTrips;
				if (!response.ok) {
					if (res.errorMessage == 'Unauthorised') fullSignOut();
					throw new Error('Network response was not ok');
				}
				const { monthlyTrips }: GetPolicyTrips = res;
				if (monthlyTrips) {
					setMonthlyTrips(monthlyTrips);
					const newInidivTrips: IndividualTrip[] = [];
					monthlyTrips.forEach((monthTrip) => {
						monthTrip.individualTrips.forEach((indivTrip) => {
							newInidivTrips.push(indivTrip);
						});
					});
					setTrips(newInidivTrips);
				}
				rtnBln = true;
			}
			return rtnBln;
		},
		{
			enabled: fromDate && toDate ? true : false,
		}
	);

	return (
		<>
			{isLoading && <LoadingSpinner />}
			{!isLoading &&
				(trips && trips.length > 0 ? (
					<>
						<div className='flex flex-row gap-4'>
							<span className='text-sm mt-3'>
								Records found: {trips.length}
							</span>

							{checkTripDateRange(fromDate, toDate, dayRange) ? (
								<Link
									href={`/policies/${opid}/tripDataCsv?fromDate=${fromDate}&toDate=${toDate}`}
									target='_blank'
									className='action-btn text-center w-32 max-w-32'
								>
									Export CSV
								</Link>
							) : (
								<div className='text-sm mt-3 text-green-900'>
									(Export CSV button will show when date range
									within {dayRange} days.)
								</div>
							)}
						</div>

						<div className='max-h-96 overflow-y-auto'>
							<table className='text-xs w-full text-shark zebraTable'>
								<thead>
									<tr className='h-8'>
										<td className='font-bold'>Time</td>
										<td className='font-bold'>Distance</td>
										<td className='font-bold'>Duration</td>
										<td className='font-bold'>View</td>
									</tr>
								</thead>
								<tbody>
									{trips.map(
										(trip: IndividualTrip, idx: number) => {
											const {
												localTimes,
												distance,
												duration,
												startDTMutc,
											}: IndividualTrip = trip;
											return (
												<tr
													key={idx}
													className='h-8 border-y-2'
												>
													<td>{localTimes}</td>
													<td>{distance}</td>
													<td>{duration}</td>
													<td>
														<Link
															href={`/policies/${opid}/trip/${startDTMutc}`}
														>
															<ArrowsPointingOutIcon className='h-4' />
														</Link>
													</td>
												</tr>
											);
										}
									)}
								</tbody>
							</table>
						</div>
					</>
				) : (
					<span className='text-center m-8 text-xs'>
						No Trips found in the period selected
					</span>
				))}
		</>
	);
};

export default TripsDateRange;
