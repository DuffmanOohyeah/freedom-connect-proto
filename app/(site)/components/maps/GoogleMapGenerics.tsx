import { useCallback, useRef, useState } from 'react';
import { Flags, Waypoint } from '@/types/api';
import {
	AllMapsPositionProps,
	GoogleMapGenericsProps,
	MapStyleProps,
	PolylineOptionsProps,
} from '@/types/api/mapDetails';
import {
	GoogleMap,
	MarkerF,
	PolylineF,
	useJsApiLoader,
} from '@react-google-maps/api';

const formatSpeed = (speed: number): number => {
	return parseFloat(speed.toFixed(2));
};

const formatDTM = (dtm: string): string => {
	return dtm.trim().replace(
		/\s{2,}/g, // 2+ spaces
		' '
	);
};

const formatWaypointTitle = (point: Waypoint): string => {
	const { flags, accel, localDTM, speedMph, speedLimitMph, satellites, fix } =
		point;
	let title = 'Date/Time: ' + formatDTM(localDTM);
	title += '\nSpeed (MPH): ' + formatSpeed(speedMph);

	if (speedLimitMph) title += '\nSpeed Limit (MPH): ' + speedLimitMph;
	if (satellites) title += '\nSatellites: ' + satellites;
	if (fix) title += '\nFix: ' + fix;
	if (flags) {
		const { speeding, harshCorner, harshAccel, harshBrake } = flags;
		if (speeding) title += '\n- Speeding';
		if (harshCorner) title += '\n- Harsh Cornering';
		if (harshAccel) title += '\n- Harsh Acceleration';
		if (harshBrake) title += '\n- Harsh Braking';
	}
	if (accel) {
		const { peakGForce, peakMph } = accel;
		title += '\nHarsh Braking Info:';
		if (peakGForce) title += '\n- Peak G-Force: ' + peakGForce;
		if (peakMph) title += '\n- Peak MPH: ' + peakMph.toFixed(2);
	}
	return title;
};

const GoogleMapGenerics = ({
	startCoords,
	endCoords,
	waypoints,
	mapStyle,
}: GoogleMapGenericsProps): JSX.Element => {
	const { isLoaded } = useJsApiLoader({
		id: 'google-map-script',
		googleMapsApiKey: `${process.env.NEXT_PUBLIC_GMAPS_API}`,
	});
	const [, setMap] = useState(null);

	const polylineCoords: AllMapsPositionProps[] = [];
	let startMarkerCoords: AllMapsPositionProps = { lat: 0, lng: 0 };
	let endMarkerCoords: AllMapsPositionProps = { lat: 0, lng: 0 };
	const WaypointMarkers: JSX.Element[] = [];
	const gMapRef = useRef<any>();

	if (waypoints && waypoints.length) {
		waypoints.map((point: Waypoint, idx: number) => {
			const { lat, long, speedMph, localDTM, flags }: Waypoint = point;

			/* start: set up coord params */
			const thisCoord: AllMapsPositionProps = {
				lat: lat,
				lng: long,
			};
			polylineCoords.push(thisCoord);
			if (idx === 0) startMarkerCoords = thisCoord;
			if (idx + 1 === waypoints.length) endMarkerCoords = thisCoord;
			/* end: set up coord params */

			/* start: populate waypoint marker component */
			if (gMapRef && isLoaded) {
				const attributes = {
					position: thisCoord,
					icon: {
						url: '/waypoint_white.png',
						anchor: new window.google.maps.Point(5, 5),
						scaledSize: new window.google.maps.Size(7, 7),
					},
					speed: formatSpeed(speedMph),
					date: formatDTM(localDTM),
					title: formatWaypointTitle(point),
				};

				if (flags) {
					const {
						speeding,
						harshAccel,
						harshBrake,
						harshCorner,
						excessiveSpeed,
					}: Flags = flags;
					if (
						speeding ||
						harshAccel ||
						harshBrake ||
						harshCorner ||
						excessiveSpeed
					) {
						attributes.icon = {
							url: '/triangle_warning.png',
							anchor: new window.google.maps.Point(25, 25),
							scaledSize: new window.google.maps.Size(25, 25),
						};
					}
				}

				WaypointMarkers.push(
					<MarkerF
						position={attributes.position}
						icon={attributes.icon}
						title={attributes.title}
						key={idx}
					/>
				);
			}
			/* end: populate waypoint marker component */
		});
	}

	/* start: overwrite if exists via props */
	if (startCoords && startCoords.lat) startMarkerCoords = startCoords;
	if (endCoords && endCoords.lat) endMarkerCoords = endCoords;
	/* end: overwrite if exists via props */

	const onLoad = useCallback((map: any): void => {
		/* start: initialise bounding args */
		const bounds = new google.maps.LatLngBounds();
		waypoints.map((point: Waypoint) => {
			const { lat, long }: Waypoint = point;
			bounds.extend(
				new window.google.maps.LatLng({
					lat: lat,
					lng: long,
				})
			);
		});
		gMapRef.current = map;
		map.fitBounds(bounds);
		/* end: initialise bounding args */

		setTimeout(() => setMap(map)); // WB: pause for a sec until the map loads, so that marker icon loads properly
	}, []);

	const onUnmount = useCallback(() => {
		setMap(null);
	}, []);

	const mapContainerStyle: MapStyleProps = {
		height: mapStyle?.height || '100%',
		width: mapStyle?.width || '100%',
	};

	const polylineOptions: PolylineOptionsProps = {
		strokeColor: '#000',
		strokeOpacity: 0.75,
		strokeWeight: 5,
	};

	const mapCenter: AllMapsPositionProps = {
		lat: (startMarkerCoords.lat + endMarkerCoords.lat) / 2,
		lng: (startMarkerCoords.lng + endMarkerCoords.lng) / 2,
	};

	return (
		<>
			{gMapRef && isLoaded ? (
				<GoogleMap
					mapContainerStyle={mapContainerStyle}
					center={mapCenter}
					zoom={12}
					onLoad={onLoad}
					onUnmount={onUnmount}
					ref={gMapRef}
				>
					{polylineCoords.length && (
						<>
							<MarkerF
								position={startMarkerCoords}
								icon={'/marker_green_dot.png'}
								title={`Journey start coordinates: lat ${startMarkerCoords.lat}, long ${startMarkerCoords.lng}`}
							/>
							<PolylineF
								path={polylineCoords}
								options={polylineOptions}
							/>
							{WaypointMarkers}
							<MarkerF
								position={endMarkerCoords}
								icon={'/marker_red_dot.png'}
								title={`Journey end coordinates: lat ${endMarkerCoords.lat}, long ${endMarkerCoords.lng}`}
							/>
						</>
					)}
				</GoogleMap>
			) : (
				<>
					<br />
					Loading map...
				</>
			)}
		</>
	);
};

export default GoogleMapGenerics;
