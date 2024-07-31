'use client';
import React, { useEffect } from 'react';
import EventTripMap from '@/app/(site)/components/maps/EventTripMap';
import { useEventTripId } from '@/app/(site)/hooks/useEventTripId';
import { zonedTimeToUtc } from 'date-fns-tz';
import { useState } from 'react';
import { GetPersistentSpeedingEvent } from '@/types/api';
import { BaseUrl, fullSignOut, getApiHeaders } from '@/app/utils';
import { useMutation, useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
	PersistentSpeedingProps,
	PersistentSpeedingEventDetailsProps,
	PersistentSpeedingActionsProps,
} from '@/types/api/persistentSpeeding';

const dtMask: string = 'd-MMM-yyyy, HH:mm:ss';

const PersistentSpeeding = ({
	eventId,
	opid,
	showValidButtons = true,
	validatedDTM,
	invalidatedDTM,
}: PersistentSpeedingProps): JSX.Element => {
	const [eventDtmUtcIsoString, setEventDtmUtcIsoString] = useState<
		string | null
	>(null);
	const [events, setEvents] = useState<GetPersistentSpeedingEvent[]>([]);
	const [open, setOpen] = useState<boolean>(false);
	const { waypoints } = useEventTripId(opid, eventDtmUtcIsoString);

	const { isLoading, isError } = useQuery(
		['ReportingPersistentSpeeding'],
		async () => {
			const response = await fetch(
				`${BaseUrl}/portal/policy/persistent?eid=${eventId}`,
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
			const res = (await response.json()) as GetPersistentSpeedingEvent[];
			setEvents(res);
			return true;
		},
		{
			retry: false,
		}
	);

	useEffect(() => {
		if (events.length > 0 && events[0].eventDTMLocal) {
			setEventDtmUtcIsoString(
				zonedTimeToUtc(
					events[0].eventDTMLocal,
					'Europe/London'
				).toISOString()
			);
		}
	}, [events]);

	return (
		<>
			{events.length > 0 && (
				<div className='h-screen m-2 flex flex-col gap-4'>
					<h2 className='text-xl'>Persistent Speeding Event</h2>
					<div className='flex flex-col gap-2 h-full'>
						<PersistentSpeedingActions
							eventId={eventId}
							onChangeOpen={(newOpen) => setOpen(newOpen)}
							showValidButtons={showValidButtons}
							validatedDTM={validatedDTM}
							invalidatedDTM={invalidatedDTM}
						/>
						<br />
						{events.map((evt, idx) => {
							const {
								latitude: lat,
								longitude: long,
							}: GetPersistentSpeedingEvent = evt;
							return (
								<>
									<PersistentSpeedingEventDetails
										event={evt}
										key={idx}
									/>
									{lat && long && waypoints.length > 0 && (
										<div className='h-full w-full'>
											<EventTripMap
												startCoords={{
													lat: Number(lat),
													lng: Number(long),
												}}
												waypoints={waypoints}
											/>
										</div>
									)}
									<br />
								</>
							);
						})}
					</div>
				</div>
			)}

			{!isLoading && !isError && !events && (
				<p className='text-sm'>Event not found</p>
			)}
			{isError && <p className='text-sm'>An error occurred</p>}
		</>
	);
};

const PersistentSpeedingEventDetails = ({
	event,
}: PersistentSpeedingEventDetailsProps): JSX.Element => {
	const {
		eventDTMLocal,
		actualSpeedMph,
		speedLimitMph,
		satelliteFix,
		durationOfSpeedingSeconds,
		durationOfSpeedingMetres,
	}: GetPersistentSpeedingEvent = event;
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

const PersistentSpeedingActions = ({
	eventId,
	onChangeOpen,
	showValidButtons = true,
	validatedDTM,
	invalidatedDTM,
}: PersistentSpeedingActionsProps): JSX.Element => {
	const [open, setOpen] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);
	const [valid, setValid] = useState<boolean | null>(null);

	const validatePersistentSpeedingEvent = useMutation(
		['validatePersistentSpeedingEvent'],
		{
			mutationFn: async (): Promise<boolean> => {
				const response = await fetch(
					`${BaseUrl}/portal/policy/persistent`,
					{
						method: 'PUT',
						body: JSON.stringify({
							eventId: eventId,
							decision: valid ? 'VALID' : 'INVALID',
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

	useEffect(() => {
		onChangeOpen(open);
	}, [open, onChangeOpen]);

	return (
		<>
			{!open ? (
				<div className='flex flex-row justify-between gap-4 w-full'>
					{showValidButtons && (
						<>
							{validatedDTM == null ? (
								<button
									className='action-btn'
									onClick={() => {
										setValid(true);
										setOpen(true);
									}}
								>
									Validate
								</button>
							) : (
								<>
									Validated on:{' '}
									{format(new Date(validatedDTM), dtMask)}
								</>
							)}
							{invalidatedDTM == null ? (
								<button
									className='action-btn'
									onClick={() => {
										setValid(false);
										setOpen(true);
									}}
								>
									Invalidate
								</button>
							) : (
								<>
									Invalidated on:{' '}
									{format(new Date(invalidatedDTM), dtMask)}
								</>
							)}
						</>
					)}
				</div>
			) : (
				<div className='flex flex-col gap-4 w-full'>
					<div>
						<p className='text-xs text-center mt-12'>
							Your are about to set the persistent speeding event
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
							onClick={() =>
								validatePersistentSpeedingEvent.mutate()
							}
							disabled={errorMessage ? true : false}
							className='action-btn bg-shark-100 text-white'
						>
							{validatePersistentSpeedingEvent.isLoading
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

export default PersistentSpeeding;
