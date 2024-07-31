import { Trip } from '@/types/api';
import { decode } from '@googlemaps/polyline-codec';
import { useEffect, useState } from 'react';

const useTripWaypoints = (trip: Trip | null): number[][] => {
	const [waypoints, setWaypoints] = useState<number[][]>([]);
	useEffect(() => {
		if (trip) {
			const decoded = decode(trip.polyline, 5);
			const newWayPoints = decoded.map((point) => {
				return [point[1], point[0]]; // switching order of coords
			});
			setWaypoints(newWayPoints);
		}
	}, [trip]);
	return waypoints;
};

export { useTripWaypoints };
