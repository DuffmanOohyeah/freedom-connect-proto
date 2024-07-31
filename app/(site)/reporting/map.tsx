'use client';
import { useRef, useState } from 'react';
import {
	GoogleMap,
	Marker,
	DirectionsRenderer,
	DirectionsService,
	useJsApiLoader,
} from '@react-google-maps/api';
import { faCircle } from '@fortawesome/free-solid-svg-icons';
import crashData from '../policies/[id]/crashreports/[edtm]/crash.json';

const Map = (): JSX.Element => {
	const [directions, setDirections] =
		useState<google.maps.DirectionsResult | null>();
	const count = useRef(0);

	const gkey: string = `${process.env.NEXT_PUBLIC_GMAPS_API}`;

	const { isLoaded, loadError } = useJsApiLoader({
		googleMapsApiKey: gkey,
	});
	const containerStyle = {
		width: '100%',
		height: '100%',
	};
	const lastTripIdx = crashData.incident.gpsData.length - 1;
	const centerTripIdx = Math.floor(crashData.incident.gpsData.length / 2 - 1);

	const center =
		centerTripIdx >= 0
			? {
					lat: crashData.incident.gpsData[centerTripIdx].lat,
					lng: crashData.incident.gpsData[centerTripIdx].lon,
			  }
			: {
					lat: crashData.incident.gpsData[0].lat,
					lng: crashData.incident.gpsData[0].lon,
			  };

	const directionsCallback = (
		result: google.maps.DirectionsResult | null,
		status: google.maps.DirectionsStatus
	): void => {
		if (status === 'OK' && count.current === 0) {
			count.current++;
			console.count();
			setDirections(result);
		}
	};

	const renderMap = (): JSX.Element => {
		return (
			<GoogleMap
				mapContainerStyle={containerStyle}
				center={center}
				zoom={15}
				options={{
					mapId: '44703fca8e3d69b9',
					controlSize: 20,
					maxZoom: 15,
					minZoom: 15,
				}}
			>
				<DirectionsService
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
							options={{ preserveViewport: true }}
						/>
						<Marker
							position={center}
							zIndex={99}
							icon={{
								path: faCircle.icon[4] as string,
								fillColor: 'blue',
								fillOpacity: 0.75,
								anchor: new google.maps.Point(
									faCircle.icon[0] / 2, // width
									faCircle.icon[1] / 2 // height
								),
								scale: 0.02,
							}}
							title='A Marker'
						/>
					</>
				)}
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
