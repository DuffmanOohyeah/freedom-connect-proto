import { LatLngTuple } from '@googlemaps/polyline-codec';
import { Waypoint } from '@/types/api';
import GoogleMapGenerics from './GoogleMapGenerics';

interface TripMapProps {
	start: LatLngTuple;
	end: LatLngTuple;
	wayPoints: Waypoint[];
}

const TripMap = ({ start, end, wayPoints }: TripMapProps): JSX.Element => (
	<div className='h-full w-full'>
		<GoogleMapGenerics
			startCoords={{ lat: start[0], lng: start[1] }}
			endCoords={{ lat: end[0], lng: end[1] }}
			waypoints={wayPoints}
		/>
	</div>
);

export default TripMap;
