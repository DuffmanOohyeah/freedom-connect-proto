'use client';
import { useRouter } from 'next/navigation';
import { GetIndividualTrip, Trip, Waypoint } from '@/types/api';
import { BaseUrl, getApiHeaders, fullSignOut } from '@/app/utils';
import { useQuery } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { decode, LatLngTuple } from '@googlemaps/polyline-codec';
import LoadingSpinner from '../LoadingSpinner';
import { AiOutlineArrowLeft } from 'react-icons/ai';
import Link from 'next/link';
import TripMapGraph from './TripMapGraph';

interface IndividualTripProps {
	opid: string;
	sdtm: string;
}

const IndividualTrip = ({ opid, sdtm }: IndividualTripProps): JSX.Element => {
	const router = useRouter();
	const [trip, setTrip] = useState<Trip | null>(null);
	const [wayPoints, setWayPoints] = useState<Waypoint[]>([]);
	const [polyline, setPolyline] = useState<null | string>(null);
	const [start, setStart] = useState<null | LatLngTuple>(null);
	const [end, setEnd] = useState<null | LatLngTuple>(null);

	useEffect(() => {
		if (trip) {
			const decoded = decode(trip.polyline, 5);
			setStart(decoded[0]);
			setEnd(decoded[decoded.length - 1]);
		}
	}, [trip]);

	const { isLoading } = useQuery(
		['getPolicyTrips'],
		async () => {
			const response: Response = await fetch(
				`${BaseUrl}/portal/policy/trip?opid=${opid}&sdtm=${sdtm}`,
				{
					method: 'GET',
					headers: await getApiHeaders(),
				}
			);
			if (!response.ok) {
				const res = await response.json();
				if (res.errorMessage == 'Unauthorised') fullSignOut();
				throw new Error('Network response was not ok');
			}
			const resPolicies = (await response.json()) as GetIndividualTrip;
			const { trip, waypoints } = resPolicies;
			const { polyline } = trip;
			if (trip) setTrip(trip);
			if (waypoints && waypoints.length) setWayPoints(waypoints);
			if (polyline) setPolyline(polyline);
			return true;
		},
		{
			enabled: opid && sdtm ? true : false,
		}
	);

	return (
		<div className='h-full w-full p-4'>
			{isLoading && <LoadingSpinner />}

			{!isLoading && trip && (
				<div className='h-full text-xs flex flex-col gap-4'>
					<div className='flex flex-row gap-4 justify-start items-center'>
						<button
							onClick={() => router.back()}
							className='bg-white rounded-full w-8 h-8 flex justify-center items-center'
						>
							<AiOutlineArrowLeft className='h-4 w-4' />
						</button>
						<h1 className='text-xl'>Trip Details</h1>
					</div>

					<div className='grid grid-cols-2 gap-4 w-full'>
						<div className='flex flex-col p-4 rounded-lg bg-white'>
							<div className='flex flex-row justify-between w-full mb-4'>
								<span className='text-base'>Start</span>
								<img
									src='/marker_green_dot.png'
									style={{ height: '85%' }}
								/>
							</div>

							<div>
								<div className='flex flex-row justify-between'>
									<span>Time: </span>
									<span className='font-bold'>
										{trip.start.time}
									</span>
								</div>
								<div className='flex flex-row justify-between'>
									<span>Address: </span>
									<span className='font-bold'>
										{trip.start.address}
									</span>
								</div>
								<div className='flex flex-row justify-between'>
									<span>Location: </span>
									<span className='font-bold'>
										{start && (
											<Link
												className='text-xs underline'
												target='_blank'
												href={`https://www.google.com/maps/search/?api=1&query=${start[0]},${start[1]}`}
											>
												{start[0]} {start[1]}
											</Link>
										)}
									</span>
								</div>
							</div>
						</div>

						<div className='flex flex-col p-4 rounded-lg bg-white'>
							<div className='flex flex-row justify-between w-full mb-4'>
								<span className='text-base'>End</span>
								<img
									src='/marker_red_dot.png'
									style={{ height: '85%' }}
								/>
							</div>
							<div className=''>
								<div className='flex flex-row justify-between'>
									<span>Time: </span>
									<span className='font-bold'>
										{trip.end.time}
									</span>
								</div>
								<div className='flex flex-row justify-between'>
									<span>Address: </span>
									<span className='font-bold'>
										{trip.end.address}
									</span>
								</div>
								<div className='flex flex-row justify-between'>
									<span>Location: </span>
									<span className='font-bold'>
										{end && (
											<Link
												className='text-xs underline'
												target='_blank'
												href={`https://www.google.com/maps/search/?api=1&query=${end[0]},${end[1]}`}
											>
												{end[0]} {end[1]}
											</Link>
										)}
									</span>
								</div>
							</div>
						</div>
					</div>

					{trip && (
						<div className='grid grid-cols-4 gap-4 rounded-lg bg-white p-4'>
							<span>
								Max Speed:{' '}
								<span className='font-bold'>
									{trip.maxSpeedmph}
								</span>
							</span>
							<span>
								Average Speed:{' '}
								<span className='font-bold'>
									{trip.avgSpeedmph}
								</span>
							</span>
							<span>
								Distance:{' '}
								<span className='font-bold'>
									{trip.distanceMiles}
								</span>
							</span>
							<span>
								Duration:{' '}
								<span className='font-bold'>
									{trip.durationHours}
								</span>
							</span>
						</div>
					)}

					{start && end && (
						<TripMapGraph
							start={start}
							end={end}
							wayPoints={wayPoints}
							polyline={polyline}
						/>
					)}
				</div>
			)}
		</div>
	);
};

export default IndividualTrip;
