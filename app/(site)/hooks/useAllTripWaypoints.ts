import { BaseUrl, getApiHeaders } from '@/app/utils';
import {
	GetIndividualTrip,
	GetPolicyTrips,
	IndividualTrip,
	MonthlyTrip,
	Waypoint,
} from '@/types/api';
import { TripSearchProps } from '@/types/api/tripDetails';
import { useEffect, useState } from 'react';

const checkTripDateRange = (
	fromDate: string | null,
	toDate: string | null,
	dayRange: number
): boolean => {
	let rtnBln: boolean = true;
	const fromDtUtc: number = fromDate ? new Date(fromDate).getTime() : -1;
	const toDtUtc: number = toDate ? new Date(toDate).getTime() : -1;

	if (
		fromDtUtc < 0 ||
		toDtUtc < 0 ||
		fromDtUtc > toDtUtc ||
		(toDtUtc - fromDtUtc) / (1000 * 3600 * 24) > dayRange // check for day range
	)
		rtnBln = false;

	return rtnBln;
};

const useAllTripWaypoints = ({
	opid,
	fromDate,
	toDate,
	dayRange = 7,
}: TripSearchProps) => {
	const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
	const [loading, setLoading] = useState<boolean>(true);

	const getTrips = async ({
		opid,
		fromDate,
		toDate,
		dayRange = 7,
	}: TripSearchProps): Promise<IndividualTrip[]> => {
		let rtnArr: IndividualTrip[] | PromiseLike<IndividualTrip[]> = [];

		if (checkTripDateRange(fromDate, toDate, dayRange)) {
			const response = await fetch(
				`${BaseUrl}/portal/policy/trips?opid=${opid}&f=${fromDate}&t=${toDate}`,
				{
					method: 'GET',
					headers: await getApiHeaders(),
				}
			);

			const res = (await response.json()) as GetPolicyTrips;
			const newInidivTrips: IndividualTrip[] = [];

			if (res.monthlyTrips) {
				res.monthlyTrips.forEach((monthTrip: MonthlyTrip) => {
					monthTrip.individualTrips.forEach(
						(indivTrip: IndividualTrip) => {
							newInidivTrips.push(indivTrip);
						}
					);
				});
			}

			rtnArr = newInidivTrips;
		}

		return rtnArr;
	};

	const getTripWaypoints = async (
		opid: string,
		sdtm: string
	): Promise<Waypoint[]> => {
		const response: Response = await fetch(
			`${BaseUrl}/portal/policy/trip?opid=${opid}&sdtm=${sdtm}`,
			{
				method: 'GET',
				headers: await getApiHeaders(),
			}
		);
		const resPolicies = (await response.json()) as GetIndividualTrip;
		return resPolicies.waypoints.map((pt) => {
			const newPoint = {
				tripId: parseInt(sdtm),
				dateTimeStr: new Date(pt.localDTM).toString(),
				//dateTimeIso: new Date(pt.dtmutc).toISOString(),
				//dateTimeUtc: new Date(pt.localDTM).toUTCString(),
				...pt,
				...pt.flags,
			};
			delete newPoint.flags;
			delete newPoint.fix;
			delete newPoint.id;
			delete newPoint.dtmutc;
			//delete newPoint.localDTM;
			return newPoint;
		});
	};

	const fullProcess = async (
		opid: string,
		fromDate: string | null,
		toDate: string | null
	) => {
		const trips = await getTrips({ opid, fromDate, toDate, dayRange });
		const newAllWaypoints: Waypoint[] = [];

		if (trips.length == 1) {
			const getWaypoints = await getTripWaypoints(
				opid,
				trips[0].startDTMutc
			);
			getWaypoints.forEach((waypoint: Waypoint) => {
				newAllWaypoints.push(waypoint);
			});
		} else {
			// trips array <> 1
			await trips.reduce(
				(prev: Promise<Waypoint[]>, trip: IndividualTrip) => {
					return prev.then((prevWaypoints: Waypoint[]) => {
						prevWaypoints.forEach((waypoint: Waypoint) => {
							newAllWaypoints.push(waypoint);
						});
						return getTripWaypoints(opid, trip.startDTMutc);
					});
				},
				Promise.resolve([])
			);
		}

		setWaypoints(newAllWaypoints);
		setLoading(false);
	};

	useEffect(() => {
		fullProcess(opid, fromDate, toDate);
	}, [opid, fromDate, toDate]);
	return { waypoints, loading };
};

export { checkTripDateRange, useAllTripWaypoints };
