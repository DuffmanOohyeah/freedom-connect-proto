import {
	GetIndividualTrip,
	GetPolicyTrips,
	IndividualTrip,
	Trip,
	Waypoint,
} from '@/types/api';
import { BaseUrl, getApiHeaders, fullSignOut } from '@/app/utils';
import { formatISO, startOfDay, endOfDay } from 'date-fns';
import { useEffect, useState } from 'react';

interface EventTripProps {
	trip: Trip | null;
	waypoints: Waypoint[];
}

const useEventTripId = (
	opid: string,
	eventDtm: string | null
): EventTripProps => {
	const [trip, setTrip] = useState<Trip | null>(null);
	const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
	const [tripId, setTripId] = useState<string | null>(null);
	const [eventEpoch, setEventEpoch] = useState<number>();
	const [possibleTrips, setPossibleTrips] = useState<IndividualTrip[]>([]);
	const [fromDate, setFromDate] = useState<string>();
	const [toDate, setToDate] = useState<string>();

	const getTripsByDate = async (): Promise<boolean> => {
		let rtnBln: boolean = false;

		if (Number(opid) > 0 && fromDate && toDate) {
			const response = await fetch(
				`${BaseUrl}/portal/policy/trips?opid=${opid}&f=${fromDate}&t=${toDate}`,
				{
					method: 'GET',
					headers: await getApiHeaders(),
				}
			);

			if (!response.ok) {
				const res = await response.json();
				if (res.errorMessage == 'Unauthorised') fullSignOut();
				throw new Error('Network response was not ok');
			} else {
				const resPolicies = (await response.json()) as GetPolicyTrips;
				if (resPolicies.monthlyTrips.length > 0)
					setPossibleTrips(
						resPolicies.monthlyTrips[0].individualTrips
					);
			}

			rtnBln = true;
		}

		return rtnBln;
	};

	const getTripById = async (): Promise<boolean> => {
		let rtnBln: boolean = false;

		if (Number(opid) > 0 && Number(tripId) > 0) {
			const response = await fetch(
				`${BaseUrl}/portal/policy/trip?opid=${opid}&sdtm=${tripId}`,
				{
					method: 'GET',
					headers: await getApiHeaders(),
				}
			);

			if (!response.ok) {
				const res = await response.json();
				if (res.errorMessage == 'Unauthorised') fullSignOut();
				throw new Error('Network response was not ok');
			} else {
				const getTripRes = (await response.json()) as GetIndividualTrip;
				setTrip(getTripRes.trip);
				setWaypoints(getTripRes.waypoints);
				rtnBln = true;
			}
		}

		return rtnBln;
	};

	useEffect(() => {
		if (eventDtm) {
			const dtEvt = new Date(eventDtm);
			const dtPast = dtEvt.setHours(dtEvt.getHours() - 2);
			const dtFuture = dtEvt.setHours(dtEvt.getHours() + 2);

			const newFromDate = formatISO(
				startOfDay(dtPast), // WB: possible prev day (FCWS-140)
				{
					representation: 'date',
				}
			);
			setFromDate(newFromDate);

			const newToDate = formatISO(
				endOfDay(dtFuture), // WB: possible next day (FCWS-140)
				{
					representation: 'date',
				}
			);

			setToDate(newToDate);
			setEventEpoch(dtEvt.getTime());
		}
	}, [eventDtm]);

	useEffect(() => {
		if (possibleTrips.length > 0 && eventEpoch) {
			const tripsBeforeEvent = possibleTrips
				.sort((a, b) => {
					if (a.startDTMutc < b.startDTMutc) {
						return -1;
					} else if (a.startDTMutc > b.startDTMutc) {
						return 1;
					}
					{
						return 0;
					}
				})
				.filter((x) => {
					if (Number(x.startDTMutc) < eventEpoch) return true;
				});

			if (tripsBeforeEvent.length > 0)
				setTripId(
					tripsBeforeEvent[tripsBeforeEvent.length - 1].startDTMutc
				);
		}
	}, [possibleTrips, eventEpoch]);

	useEffect(() => {
		if (opid && fromDate && toDate) getTripsByDate(); // sets state var; returns boolean
	}, [fromDate, toDate]);

	useEffect(() => {
		if (opid && tripId) getTripById(); // sets state vars; returns boolean
	}, [tripId]);

	return { trip, waypoints };
};

export { useEventTripId };
