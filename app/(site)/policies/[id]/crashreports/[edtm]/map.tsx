'use client';
// import { useRef, useState } from 'react';
import {
	GoogleMap,
	Marker,
	/*DirectionsRenderer,
	DirectionsService,*/
	useJsApiLoader,
} from '@react-google-maps/api';

interface MapProps {
	lat: number;
	long: number;
}

const Map = ({ lat, long }: MapProps): JSX.Element => {
	// const [directions, setDirections] = useState<google.maps.DirectionsResult | null>();
	// const count = useRef(0);
	const gkey: string = `${process.env.NEXT_PUBLIC_GMAPS_API}`;
	const { isLoaded, loadError } = useJsApiLoader({
		googleMapsApiKey: gkey,
	});
	const containerStyle = {
		width: '100%',
		height: '100%',
	};

	/*const directionsCallback = (
		result: google.maps.DirectionsResult | null,
		status: google.maps.DirectionsStatus
	): void => {
		if (status === 'OK' && count.current === 0) {
			count.current++;
			console.count();
			setDirections(result);
		}
	};*/

	const renderMap = (): JSX.Element => {
		return (
			<GoogleMap
				mapContainerStyle={containerStyle}
				center={{
					lat: lat,
					lng: long,
				}}
				zoom={12}
				options={{ controlSize: 20 }}
			>
				{/* <DirectionsService
				options={{
					origin: {
					lat: crashData.incident.gpsData[0].lat,
					lng: crashData.incident.gpsData[0].lon,
					},
					destination: {
					lat: crashData.incident.gpsData[lastTripIdx].lat,
					lng: crashData.incident.gpsData[lastTripIdx].lon,
					},
					travelMode: google.maps.TravelMode.DRIVING,
				}}
				callback={directionsCallback}
				/>
				{directions && (
				<>
					<DirectionsRenderer
					directions={directions}
					options={{preserveViewport: true}}
					/>{' '}
				</>
				)} */}
				<Marker
					position={{ lat: lat, lng: long }}
					zIndex={99}
					icon={{
						url: '/crash.svg',
						scaledSize: new google.maps.Size(40, 40),
						anchor: new google.maps.Point(30, 10),
					}}
				/>
			</GoogleMap>
		);
	};

	if (loadError) return <div>Map cannot be loaded right now, sorry.</div>;

	return isLoaded ? (
		renderMap()
	) : (
		<div className='flex w-full h-full items-center justify-center bg-aqua-haze-500 text-shark text-base font-light'>
			<span className='flex items-center px-3 h-6 border-r border-shark-50'>
				map
			</span>
			<span className='flex items-center px-3 h-6'>loading...</span>
		</div>
	);
};

export default Map;
