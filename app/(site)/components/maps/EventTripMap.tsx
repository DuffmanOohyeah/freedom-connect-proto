import 'mapbox-gl/dist/mapbox-gl.css';
import { GoogleMapGenericsProps } from '../../../../types/api/mapDetails';
import GoogleMapGenerics from './GoogleMapGenerics';

const EventTripMap = ({
	startCoords,
	waypoints,
}: GoogleMapGenericsProps): JSX.Element => (
	<div className='h-full w-full'>
		<GoogleMapGenerics startCoords={startCoords} waypoints={waypoints} />
	</div>
);

export default EventTripMap;
