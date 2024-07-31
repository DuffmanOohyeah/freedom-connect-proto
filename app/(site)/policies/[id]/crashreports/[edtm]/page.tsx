'use client';
import { useRouter } from 'next/navigation';
import AccelChart from './acceleration-chart';
import { HiArrowLeft } from 'react-icons/hi';
import { FnolEvent, GetPolicyFnol, Waypoint } from '@/types/api';
import { BaseUrl, getApiHeaders, fullSignOut } from '@/app/utils';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { format } from 'date-fns';
import AccidentMap from '@/app/(site)/components/maps/AccidentMap';
import LoadingSpinner from '@/app/(site)/components/LoadingSpinner';
import FNOLUpdate from '@/app/(site)/components/actionButtons/FNOLUpdate';
import TripSpeedChart from '@/app/(site)/components/charts/speed-chart';
//import { useAllTripWaypoints } from '@/app/(site)/hooks/useAllTripWaypoints';
import { useEventTripId } from '@/app/(site)/hooks/useEventTripId';
import { DistanceCoordProps } from '@/types/api/distanceCoords';
import { distanceBetweenCoords } from '@/app/utils/distanceBetweenCoords';
import { usePDF, Resolution, Margin } from 'react-to-pdf';

interface CrashReportProps {
	params: { id: number; edtm: number };
}

const CrashReport = ({ params }: CrashReportProps): JSX.Element => {
	const { edtm, id } = params;
	const router = useRouter();
	const [crash, setCrash] = useState<FnolEvent | null>(null);
	const [newWaypoints, setNewWaypoints] = useState<Waypoint[]>();
	const [distance, setDistance] = useState<number>(0);
	const [riskCoords, setRiskCoords] = useState<DistanceCoordProps>();
	const [prepPdf, setPrepPdf] = useState<boolean>(false);
	const { toPDF, targetRef } = usePDF({
		filename: `crashreport_${edtm}.pdf`,
		method: 'save',
		resolution: Resolution.HIGH,
		page: { margin: Margin.MEDIUM },
		canvas: { mimeType: 'image/jpeg' },
	});

	const eventCoords: DistanceCoordProps = {
		lat: 0,
		lon: 0,
	};

	const policyCoords: DistanceCoordProps = { lat: 0, lon: 0 };

	const { isLoading, isError } = useQuery(
		['getFnolReports'],
		async () => {
			/* start: get fnol */
			const response = await fetch(
				`${BaseUrl}/portal/policy/fnol?opid=${id}&edtm=${edtm}`,
				{
					method: 'GET',
					headers: await getApiHeaders(),
				}
			);
			if (!response.ok) {
				const res = await response.json();
				if (res.errorMessage == 'Unauthorised') fullSignOut();
				throw new Error('Network response was not ok');
			}
			const crashReportRes = (await response.json()) as GetPolicyFnol;
			setCrash(crashReportRes.event);
			eventCoords.lat = crashReportRes.event.lat;
			eventCoords.lon = crashReportRes.event.lon;
			/* end: get fnol */

			/* start: get policy */
			const getPolicy = await fetch(
				`${BaseUrl}/portal/policy?opid=${id}`,
				{
					method: 'GET',
					headers: await getApiHeaders(),
				}
			);
			if (getPolicy.ok) {
				const policyJson = await getPolicy.json();
				policyCoords.lat = policyJson.policy.riskAddress.latitude;
				policyCoords.lon = policyJson.policy.riskAddress.longitude;
				setRiskCoords(policyCoords);
				const distanceInMiles = distanceBetweenCoords(
					eventCoords,
					policyCoords,
					'mi', // unit mi = miles
					2 // decimal places
				);
				setDistance(distanceInMiles);
			}
			/* end: get policy */
			return true;
		},
		{ retry: false }
	);

	const fromEpoch: Date = new Date(edtm - 30000); // minus 30 secs from evt dt
	const { waypoints } = useEventTripId(id.toString(), fromEpoch.toString());
	if (waypoints.length && !newWaypoints?.length) setNewWaypoints(waypoints);

	/*const { waypoints, loading } = useAllTripWaypoints({
		opid: id.toString(),
		fromDate: fromEpoch.toString(),
		toDate: edtm.toString(),
		dayRange: 7,
	});

	if (!loading && !newWaypoints) setNewWaypoints(waypoints);

	console.log('fromEpoch:', fromEpoch);
	console.log('toDate:', edtm);
	console.log('loading:', loading);
	console.log('waypoints:', waypoints);*/

	return (
		<div className='px-4'>
			<div className='flex flex-row items-center gap-4 bg-white rounded-2xl shadow-tile-shadow px-8 py-6 mt-16'>
				<div className='flex flex-row justify-between w-full'>
					<div className='flex flex-row gap-2 items-center'>
						<button type='button' onClick={() => router.back()}>
							<HiArrowLeft />
						</button>
						<h2>Crash Report</h2>
					</div>
					<div className='float-right space-x-5'>
						<FNOLUpdate fnolId={edtm.toString()} />
						{crash && (
							<button
								type='button'
								className='action-btn w-36 disabled:bg-shark-50/20'
								disabled={prepPdf}
								onClick={(evt) => {
									evt.preventDefault();
									setPrepPdf(true);
									setTimeout(() => {
										toPDF();
									}, 500);
									setTimeout(() => {
										setPrepPdf(false);
									}, 3500);
								}}
							>
								{prepPdf ? <LoadingSpinner /> : 'Download PDF'}
							</button>
						)}
					</div>
				</div>
			</div>

			{isError && (
				<div className='h-full w-full text-center m-8'>
					<p> Sorry an error occurred</p>
				</div>
			)}

			{isLoading && (
				<div className='h-full w-full text-center m-8'>
					<LoadingSpinner />
				</div>
			)}

			{crash && (
				<div
					ref={targetRef}
					className={`${prepPdf ? 'float-none min-h-screen' : ''}`}
				>
					<div
						className={`flex flex-col bg-white rounded-2xl shadow-tile-shadow px-8 py-6 mt-6 ${prepPdf ? 'h-screen' : ''}`}
					>
						<h1 className='text-lg font-semibold mb-10'>
							Crash Summary{' '}
							<span className='text-xs font-normal'>
								({edtm})
							</span>
						</h1>
						<div className='flex flex-row justify-between gap-8 text-xs'>
							<div className='basis-3/12 flex flex-col gap-8'>
								<div>
									<span className='block font-semibold mb-2'>
										Crash Date &amp; Time
									</span>
									{crash?.eventDTMLocal &&
										format(
											new Date(crash.eventDTMLocal),
											'dd/MM/yyyy HH:mm'
										)}
								</div>
								{/*<div>
									<span className='block font-semibold mb-2'>
										Event Severity
									</span>
									{crash?.fnol.severity}
									</div>*/}
								<div>
									<span className='block font-semibold mb-2'>
										Crash Coordinates
									</span>
									{crash?.lat},&nbsp;
									{crash?.lon}
								</div>

								<div>
									<span className='block font-semibold mb-2'>
										Address Coordinates
									</span>
									{riskCoords?.lat.toFixed(6)}
									,&nbsp;
									{riskCoords?.lon.toFixed(6)}
								</div>
								<div>
									<span className='block font-semibold mb-2'>
										Distance From Address
									</span>
									{distance} miles
								</div>
								<div>
									<span className='block font-semibold mb-2'>
										Peak
									</span>
									{crash?.fnol.gforce.toFixed(3)} g
								</div>
							</div>
							<div className='basis-9/12 flex flex-col'>
								<div className='w-full h-full rounded-xl overflow-hidden'>
									{crash?.lat && crash?.lon && (
										<AccidentMap
											lat={crash?.lat}
											long={crash?.lon}
											waypoints={newWaypoints}
										/>
									)}
								</div>
							</div>
						</div>
					</div>

					<p
						className={`${prepPdf ? 'break-after-page block clear-both' : ''}`}
					/>

					{crash?.impact && (
						<>
							<div className={`${prepPdf ? 'h-screen' : ''}`}>
								<AccelChart data={crash.impact} />
							</div>
							<p
								className={`${prepPdf ? 'break-after-page block clear-both' : ''}`}
							/>
						</>
					)}

					<div
						className={`bg-white rounded-2xl shadow-tile-shadow px-8 py-6 mt-6 w-full h-full relative ${prepPdf ? 'h-screen' : ''}`}
					>
						<h1 className='text-lg font-semibold'>Speed diagram</h1>
						{newWaypoints && newWaypoints.length > 0 ? (
							<TripSpeedChart waypoints={newWaypoints} />
						) : (
							<>No speed data found</>
						)}
					</div>
				</div>
			)}
		</div>
	);
};

export default CrashReport;
