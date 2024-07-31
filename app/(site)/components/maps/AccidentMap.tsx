import React, { useCallback, useState, useRef } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import {
	AccidentMapDetailProps,
	AllMapsPositionProps,
} from '../../../../types/api/mapDetails';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';

const getIconObj = (idx: number, arrLen: number) => {
	// set default rtn obj
	let rtnObj = {
		url: '/waypoint_white.png',
		scaledSize: new google.maps.Size(7, 7),
		anchor: new google.maps.Point(5, 5),
	};

	if (idx === 0) {
		// if first waypoint
		rtnObj = {
			url: '/marker_green_dot.png',
			scaledSize: new google.maps.Size(30, 30),
			anchor: new google.maps.Point(30, 30),
		};
	} else if (idx === arrLen - 1) {
		// if last waypoint
		rtnObj = {
			url: '/marker_red_dot.png',
			scaledSize: new google.maps.Size(30, 30),
			anchor: new google.maps.Point(30, 30),
		};
	}

	return rtnObj;
};

const AccidentMap = ({
	lat,
	long,
	waypoints,
}: AccidentMapDetailProps): JSX.Element => {
	const mapCenter: AllMapsPositionProps = { lat: lat, lng: long };
	const { isLoaded } = useJsApiLoader({
		id: 'google-map-script',
		googleMapsApiKey: `${process.env.NEXT_PUBLIC_GMAPS_API}`,
	});

	const [, setMap] = useState(null);
	const mapRef = useRef<any>();

	const onLoad = useCallback((map: any) => {
		/*const bounds = new window.google.maps.LatLngBounds(location);
		map.fitBounds(bounds);*/
		setTimeout(() => setMap(map)); // WB: pause for a sec until the map loads, so that marker icon loads properly
	}, []);

	const onUnmount = useCallback(() => {
		setMap(null);
	}, []);

	return (
		<div className='h-full w-full'>
			{mapRef && isLoaded ? (
				<GoogleMap
					mapContainerStyle={{
						width: '100%',
						height: '100%',
						overflow: 'visible',
					}}
					center={mapCenter}
					zoom={13}
					onLoad={onLoad}
					onUnmount={onUnmount}
					ref={mapRef}
				>
					<MarkerF
						position={mapCenter}
						icon={{
							url: '/crash.svg',
							scaledSize: new google.maps.Size(40, 40),
							origin: new google.maps.Point(0, 0),
							anchor: new google.maps.Point(40 / 2, 40 / 2),
						}}
						title={`Crash coordinates: lat ${lat}, long ${long}`}
					/>
					{waypoints && waypoints.length > 0 && (
						<>
							{waypoints.map((obj, idx) => {
								if (obj.lat !== lat && obj.long !== long) {
									return (
										<MarkerF
											position={{
												lat: obj.lat,
												lng: obj.long,
											}}
											icon={getIconObj(
												idx,
												waypoints.length
											)}
											title={`Waypoint: lat ${obj.lat}, long ${obj.long}`}
											key={idx}
										/>
									);
								}
							})}
						</>
					)}
				</GoogleMap>
			) : (
				<>
					<br />
					Loading map...
				</>
			)}
		</div>
	);
};

export default AccidentMap;
