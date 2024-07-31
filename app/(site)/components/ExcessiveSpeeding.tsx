'use client';
import React from 'react';
import { useEventTripId } from '@/app/(site)/hooks/useEventTripId';
import { zonedTimeToUtc } from 'date-fns-tz';
import { useEffect, useState } from 'react';
import { GetExcessiveSpeedingEvent /*, Waypoint*/ } from '@/types/api';
import { BaseUrl, fullSignOut, getApiHeaders } from '@/app/utils';
import { useMutation, useQuery } from '@tanstack/react-query';
import GoogleMapGenerics from './maps/GoogleMapGenerics';
import { format } from 'date-fns';
import {
	ExcessiveSpeedingProps,
	ExcessiveSpeedingActionsProps,
} from '@/types/api/excessiveSpeeding';

const ExcessiveSpeeding = ({
	eventId,
	opid,
	showValidButtons = true,
}: ExcessiveSpeedingProps): JSX.Element => {
	const [eventDtmUtcIsoString, setEventDtmUtcIsoString] = useState<
		string | null
	>(null);
	const [event, setEvent] = useState<GetExcessiveSpeedingEvent>();
	const { waypoints } = useEventTripId(opid, eventDtmUtcIsoString);
	const [open, setOpen] = useState<boolean>(false);
	const [startCoords, setStartCoords] = useState({ lat: 0, lng: 0 });
	//const [endCoords, setEndCoords] = useState({ lat: 0, lng: 0 });

	const { isLoading, isError } = useQuery(
		['ReportingExcessiveSpeeding'],
		async () => {
			const response = await fetch(
				`${BaseUrl}/portal/policy/excessive?eid=${eventId}`,
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
			const res = (await response.json()) as GetExcessiveSpeedingEvent;
			setEvent(res);
			return true;
		},
		{
			retry: false,
		}
	);

	useEffect(() => {
		if (event && event.eventDTMLocal) {
			setEventDtmUtcIsoString(
				zonedTimeToUtc(
					event.eventDTMLocal,
					'Europe/London'
				).toISOString()
			);
			setStartCoords({ lat: event.latitude, lng: event.longitude });
			//setEndCoords({ lat: event.latitude, lng: event.longitude });
		}
	}, [event]);

	/*useEffect(() => {
		if (waypoints && waypoints.length > 0) {
			const tripCoords = getTripCoords(waypoints);
			if (tripCoords) {
				setStartCoords(tripCoords.start);
				setEndCoords(tripCoords.end);
			}
		}
	}, [waypoints]);*/

	return (
		<>
			{event && (
				<div className='h-screen m-2 flex flex-col gap-4'>
					<h2 className='text-xl'>Speeding Event</h2>
					<div className='flex flex-col gap-2 h-full'>
						<ExcessiveSpeedingActions
							eventId={eventId}
							onChangeOpen={(newOpen) => setOpen(newOpen)}
							showValidButtons={showValidButtons}
						/>
						{!open && (
							<>
								<ExcessiveSpeedingEventDetails event={event} />
								{startCoords.lat > 0 &&
									waypoints.length > 0 && (
										<div className='h-full w-full'>
											<GoogleMapGenerics
												startCoords={startCoords}
												//endCoords={endCoords}
												waypoints={waypoints}
											/>
										</div>
									)}
							</>
						)}
					</div>
				</div>
			)}

			{!isLoading && !isError && !event && (
				<p className='text-sm'>Event not found</p>
			)}
			{isError && <p className='text-sm'>An error occurred</p>}
		</>
	);
};

const ExcessiveSpeedingEventDetails = ({
	event,
}: {
	event: GetExcessiveSpeedingEvent;
}): JSX.Element => {
	const dtMask: string = 'd-MMM-yyyy, HH:mm:ss';
	const {
		eventDTMLocal,
		actualSpeedMph,
		speedLimitMph,
		satelliteFix,
		durationOfSpeedingSeconds,
		durationOfSpeedingMetres,
	}: GetExcessiveSpeedingEvent = event;
	return (
		<div className='flex flex-col p-4 rounded-lg bg-white text-shark'>
			<div className='flex flex-row justify-between'>
				Event DTM:
				<span className='font-bold'>
					{format(new Date(eventDTMLocal), dtMask)}
				</span>
			</div>
			<div className='flex flex-row justify-between'>
				Actual Speed:
				<span className='font-bold'>
					{Number(actualSpeedMph).toFixed(2)} mph
				</span>
			</div>
			<div className='flex flex-row justify-between'>
				Limit Speed:
				<span className='font-bold'>
					{Number(speedLimitMph).toFixed(2)} mph
				</span>
			</div>
			{satelliteFix && (
				<div className='flex flex-row justify-between'>
					Satellite Fix:
					<span className='font-bold'>{satelliteFix}</span>
				</div>
			)}
			<div className='flex flex-row justify-between'>
				Duration of Speeding:
				<span className='font-bold'>
					{durationOfSpeedingSeconds} secs ({durationOfSpeedingMetres}{' '}
					m)
				</span>
			</div>
		</div>
	);
};

const ExcessiveSpeedingActions = ({
	eventId,
	onChangeOpen,
	showValidButtons = true,
}: ExcessiveSpeedingActionsProps): JSX.Element => {
	const [open, setOpen] = useState(false);
	const validateExcessSpeedingEvent = useMutation(
		['validateExcessSpeedingEvent'],
		{
			mutationFn: async (): Promise<boolean> => {
				const response = await fetch(
					`${BaseUrl}/portal/policy/excessive`,
					{
						method: 'PUT',
						body: JSON.stringify({
							eventId: eventId,
							decision: valid ? 'VALID' : 'INVALID', // VALID or
						}),
						headers: await getApiHeaders(),
					}
				);

				if (!response.ok) {
					const res = await response.json();
					setErrorMessage(res.errorMessage);
					return false;
				} else {
					setSuccess(true);
					return true;
				}
			},
		}
	);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);
	const [valid, setValid] = useState<boolean | null>(null);

	useEffect(() => {
		onChangeOpen(open);
	}, [open, onChangeOpen]);

	return (
		<>
			{!open ? (
				<div className='flex flex-row justify-between gap-4 w-full'>
					{showValidButtons && (
						<>
							<button
								className='action-btn'
								onClick={() => {
									setValid(true);
									setOpen(true);
								}}
							>
								Validate
							</button>
							<button
								className='action-btn'
								onClick={() => {
									setValid(false);
									setOpen(true);
								}}
							>
								Invalidate
							</button>
						</>
					)}
				</div>
			) : (
				<div className='flex flex-col gap-4 w-full'>
					<div>
						<p className='text-xs text-center mt-12'>
							Your are about to set the excessive speeding event
							as {valid ? 'valid' : 'invalid'}.
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
							onClick={() => validateExcessSpeedingEvent.mutate()}
							disabled={errorMessage ? true : false}
							className='action-btn'
						>
							{validateExcessSpeedingEvent.isLoading
								? 'Loading'
								: 'Confirm'}
						</button>
						<button
							onClick={() => setOpen(false)}
							className='action-btn bg-shark-100 text-white'
						>
							Cancel
						</button>
						{success && (
							<p className='text-base text-jagged-ice'>
								Success!
							</p>
						)}
					</div>
				</div>
			)}
		</>
	);
};

/*const getTripCoords = (waypoints: Waypoint[]) => {
	const rtnObj = { start: { lat: 0, lng: 0 }, end: { lat: 0, lng: 0 } }; // set default return coords

	if (waypoints.length > 0) {
		const arrLen: number = waypoints.length;
		rtnObj.start = { lat: waypoints[0].lat, lng: waypoints[0].long };
		rtnObj.end = {
			lat: waypoints[arrLen - 1].lat,
			lng: waypoints[arrLen - 1].long,
		};
	}

	return rtnObj;
};*/

export default ExcessiveSpeeding;
