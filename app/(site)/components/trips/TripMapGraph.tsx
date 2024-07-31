import React from 'react';
import { /*decode,*/ LatLngTuple } from '@googlemaps/polyline-codec';
import TripMap from '../maps/TripMap';
//import TripSpeedChart from "../charts/speed-chart";
import { Waypoint } from '@/types/api';

interface TripMapGraphProps {
	start: LatLngTuple;
	end: LatLngTuple;
	wayPoints: Waypoint[];
	polyline: string | null;
}

const TripMapGraph = ({
	start,
	end,
	wayPoints,
	polyline,
}: TripMapGraphProps): JSX.Element => {
	/*const [polylineWaypoints, setPolylineWaypoints] = useState<
		null | LatLngTuple[]
	>(null);

	const [currentPointOnTrip, setCurrentPointOnTrip] =
		useState<null | LatLngTuple>([0, 0]);

	useEffect(() => {
		if (polyline) {
			setPolylineWaypoints(decode(polyline, 5));
		}
	}, [polyline]);*/

	return (
		<div className='h-full'>
			<TripMap
				start={start}
				end={end}
				wayPoints={wayPoints}
				//polylineWaypoints={polylineWaypoints}
				//currentPointOnTrip={currentPointOnTrip}
			/>
			{/* <TripSpeedChart waypoints={wayPoints} /> */}
		</div>
	);
};

export default TripMapGraph;
