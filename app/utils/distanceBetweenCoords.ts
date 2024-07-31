import { DistanceCoordProps } from '@/types/api/distanceCoords';
import { getDistance, convertDistance } from 'geolib';

const distanceBetweenCoords = (
	startCoords: DistanceCoordProps,
	endCoords: DistanceCoordProps,
	unit: string = 'm',
	fixed: number = 2
): number => {
	let rtnDistance: number = 0;

	if (
		startCoords.lat !== 0 &&
		startCoords.lon !== 0 &&
		endCoords.lat !== 0 &&
		endCoords.lon !== 0
	) {
		// ok to continue with distance lookup
		rtnDistance = getDistance(
			{ latitude: startCoords.lat, longitude: startCoords.lon },
			{ latitude: endCoords.lat, longitude: endCoords.lon }
		); // returns accuracy (in meters)
	}

	if (rtnDistance !== 0) rtnDistance = convertDistance(rtnDistance, unit); // convert from meters to miles

	return parseFloat(rtnDistance.toFixed(fixed)); // should return difference in miles (unit incoming)
};

export { distanceBetweenCoords };
