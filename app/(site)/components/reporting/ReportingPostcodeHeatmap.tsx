import { BaseUrl, getApiHeaders } from '@/app/utils';
import { useContext, useState, useCallback, useRef, useEffect } from 'react';
import LoadingSpinner from '../LoadingSpinner';
import { BusinessUnitCtx } from '../providers/BusinessUnitProvider';
import { format, sub } from 'date-fns';
import {
	GoogleMap,
	HeatmapLayerF,
	useJsApiLoader,
	MarkerF,
	Libraries,
	LoadScriptProps,
} from '@react-google-maps/api';
import {
	ContainerStyleProps,
	IconProps,
	ReportProps,
} from '@/types/api/postcodeHeatmap';
import { getCurrentBusinessUnit } from '@/app/utils/getCurrentBusinessUnit';
import { useSession } from 'next-auth/react';

const ReportingPostcodeHeatmap = (): JSX.Element => {
	const { state } = useContext(BusinessUnitCtx)!;
	const { data: session } = useSession();
	const dtMask: string = 'yyyy-MM-dd';
	/* start: form fields */
	const [fromDate, setFromDate] = useState<string>(
		format(
			sub(new Date(), {
				months: 1,
			}),
			dtMask
		)
	);
	const [toDate, setToDate] = useState<string>(format(new Date(), dtMask));
	const [postcode, setPostcode] = useState<string>('');
	const [decimalPrecision, setDecimalPrecision] = useState<number>(2);
	const [enableSubmit, setEnableSubmit] = useState<boolean>(false);
	/* end: form fields */
	const [errorMsg, setErrorMsg] = useState<string>('');
	const [loading, setLoading] = useState<boolean>(false);
	const [report, setReport] = useState<ReportProps[]>([]);
	const [map, setMap] = useState<google.maps.Map | null>(null);
	const gMapRef = useRef<any>(null);
	const [unitId, setUnitId] = useState<number>(0);
	const [libraries] = useState<Libraries>([
		'visualization',
		'maps',
		'marker',
	]); // set here to avoid load error
	const loaderProps: LoadScriptProps = {
		id: 'map-postcode-heatmap',
		googleMapsApiKey: `${process.env.NEXT_PUBLIC_GMAPS_API}`,
		libraries: libraries,
		language: 'en-GB',
		region: 'GB',
	};
	const { isLoaded: isMapLoaded, loadError } = useJsApiLoader(loaderProps);

	if (loadError && loadError?.message) setErrorMsg(loadError.message);

	const canSubmit = (): void => {
		if (
			unitId > 0 &&
			fromDate.length &&
			toDate.length &&
			postcode.length > 1 &&
			decimalPrecision > -1
		) {
			{
				setErrorMsg('');
				setEnableSubmit(true);
			}
		} else {
			setErrorMsg('Please polulate all fields.');
			setEnableSubmit(false);
		}
	};

	const getPCHeatmap = async (): Promise<void> => {
		setErrorMsg('');
		setLoading(true);

		const response: Response = await fetch(
			`${BaseUrl}/portal/report/postcode/heatmap?uid=${unitId}&pc=${postcode}&fd=${fromDate}&td=${toDate}&dp=${decimalPrecision}`,
			{
				headers: await getApiHeaders(),
				method: 'GET',
			}
		);

		if (response.ok) {
			const body = await response.json();
			const { report: data } = body;
			if (data && data.length) {
				setReport(data);
				setErrorMsg('');
			} else {
				setReport([]);
				setErrorMsg('No reports found.');
			}
		} else setErrorMsg('An error occurred when calling the report.');

		setLoading(false);
	};

	const getDecimalSelect = (): JSX.Element => {
		const precisionArr = [
			{ dec: 0, dist: '111 km' },
			{ dec: 1, dist: '11.1 km' },
			{ dec: 2, dist: '1.11 km' },
			{ dec: 3, dist: '111 m' },
			{ dec: 4, dist: '11.1 m' },
			{ dec: 5, dist: '1.11 m' },
			{ dec: 6, dist: '111 mm' },
			{ dec: 7, dist: '11.1 mm' },
			{ dec: 8, dist: '1.11 mm' },
		];
		return (
			<select
				id='decimalPrecision'
				defaultValue={decimalPrecision}
				onChange={(evt) => {
					evt.preventDefault();
					setDecimalPrecision(Number(evt.target.value));
					getUnit();
				}}
			>
				{precisionArr.map((obj) => (
					<option value={obj.dec}>
						{obj.dec} ({obj.dist})
					</option>
				))}
			</select>
		);
	};

	const containerStyle: ContainerStyleProps = {
		width: '100%',
		height: '400px',
		overflow: 'visible',
	};

	const mapCenter: google.maps.LatLngLiteral = { lat: 0, lng: 0 };
	const heatmapData: google.maps.LatLng[] = [];
	const ScoreMarkers: JSX.Element[] = [];

	const iconObj: IconProps = {
		url: '/wheel.png',
		scaledSize: null,
	};

	if (
		//!gMapRef &&
		isMapLoaded &&
		typeof window !== 'undefined' &&
		window?.google?.maps
	) {
		iconObj.scaledSize = new window.google.maps.Size(20, 20);
	}

	if (report && report.length) {
		report.map((row, idx) => {
			const {
				latitude: lat,
				longitude: lng,
				overall,
				opid,
			}: ReportProps = row;
			if (idx === 0) {
				mapCenter.lat = lat;
				mapCenter.lng = lng;
			}

			if (typeof window !== 'undefined')
				heatmapData.push(new window.google.maps.LatLng(lat, lng));

			ScoreMarkers.push(
				<MarkerF
					position={{ lat: lat, lng: lng }}
					icon={iconObj}
					title={`Opid: ${opid}\nOverall score: ${overall}\nCoords: ${lat}, ${lng}`}
					key={idx}
					options={{ opacity: 0.33 }}
				/>
			);
		});
	}

	const onLoad = useCallback((map: any): void => {
		let bounds: google.maps.LatLngBounds | null = null;
		if (typeof window !== 'undefined')
			bounds = new window.google.maps.LatLngBounds();

		report.map((row) => {
			const { latitude, longitude }: ReportProps = row;
			if (typeof window !== 'undefined' && bounds) {
				bounds.extend(
					new window.google.maps.LatLng({
						lat: latitude,
						lng: longitude,
					})
				);
			}
		});

		if (bounds) map.fitBounds(bounds);
		gMapRef.current = map;
		setTimeout(() => setMap(map), 250);
	}, []);

	const onUnmount = useCallback((): void => {
		setMap(null);
	}, []);

	const getUnit = (): void => {
		const currentBU = getCurrentBusinessUnit(session, state);
		setUnitId(currentBU.id || 0);
	};

	useEffect(() => {
		getUnit();
		setTimeout(() => {
			canSubmit();
		}, 250);
	}, [unitId, fromDate, toDate, postcode, decimalPrecision, session, state]);

	return (
		<form className='w-full'>
			<div className='w-full text-xs pb-2 space-x-5'>
				<span className='inline-block'>
					<label htmlFor='fromDate' className='font-normal'>
						From date:
					</label>
				</span>

				<span className='inline-block'>
					<input
						className={`w-48 font-medium focus:text-black focus:font-normal focus:ring-0 shadow-none ${
							fromDate ? 'text-black' : 'text-placeholder-text'
						}`}
						type='date'
						id='fromDate'
						value={fromDate}
						size={10}
						onChange={(
							evt: React.ChangeEvent<HTMLInputElement>
						) => {
							evt.preventDefault();
							setFromDate(evt.target.value);
							getUnit();
						}}
					/>
				</span>

				<span className='inline-block'>
					<label htmlFor='toDate' className='font-normal'>
						To date:
					</label>
				</span>

				<span className='inline-block'>
					<input
						className={`w-48 font-medium focus:text-black focus:font-normal focus:ring-0 shadow-none ${
							toDate ? 'text-black' : 'text-placeholder-text'
						}`}
						type='date'
						id='toDate'
						value={toDate}
						size={10}
						onChange={(
							evt: React.ChangeEvent<HTMLInputElement>
						) => {
							evt.preventDefault();
							setToDate(evt.target.value);
							getUnit();
						}}
					/>
				</span>
			</div>

			<div className='w-full text-xs pb-4 space-x-5'>
				<span className='inline-block'>
					<label htmlFor='postcode' className='font-normal'>
						Risk postcode: (min 2 chars.)
					</label>
				</span>

				<span className='inline-block'>
					<input
						type='text'
						size={8}
						maxLength={8}
						id='postcode'
						value={postcode}
						onChange={(
							evt: React.ChangeEvent<HTMLInputElement>
						) => {
							evt.preventDefault();
							setPostcode(evt.target.value);
							getUnit();
						}}
					/>{' '}
				</span>

				<span className='inline-block'>
					<label htmlFor='decimalPrecision' className='font-normal'>
						Decimal precision:
					</label>
				</span>

				<span className='inline-block'>{getDecimalSelect()}</span>

				<span className='inline-block'>
					<button
						type='button'
						className={`${
							enableSubmit
								? 'bg-green-500 text-slate-900 hover:bg-green-300'
								: 'bg-slate-500 text-white'
						} rounded-md shadow-sm px-4 py-2 font-semibold`}
						disabled={!enableSubmit}
						onClick={async (
							evt: React.MouseEvent<HTMLButtonElement, MouseEvent>
						) => {
							evt.preventDefault();
							getPCHeatmap();
						}}
					>
						Submit
					</button>
				</span>
			</div>

			{errorMsg && <p className='text-sm text-red-500'>{errorMsg}</p>}
			{loading && <LoadingSpinner />}
			{!errorMsg && enableSubmit && heatmapData.length === 0 && (
				<p className='text-sm text-red-500'>
					Click 'Submit' to continue.
				</p>
			)}
			{!errorMsg && !loading && isMapLoaded && heatmapData.length > 0 && (
				<>
					<p className='pb-3 text-sm'>
						Showing overall scores for postcode: {postcode} (
						{heatmapData.length} found)
					</p>
					<GoogleMap
						mapContainerStyle={containerStyle}
						center={mapCenter}
						zoom={12}
						onLoad={onLoad}
						onUnmount={onUnmount}
						ref={gMapRef}
					>
						<HeatmapLayerF data={heatmapData} />
						{ScoreMarkers}
					</GoogleMap>
				</>
			)}
		</form>
	);
};

export default ReportingPostcodeHeatmap;
