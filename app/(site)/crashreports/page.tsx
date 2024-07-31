'use client';
import { ArrowsPointingOutIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useContext, useEffect, useState } from 'react';
import { BaseUrl, getApiHeaders, fullSignOut } from '@/app/utils';
import { FNOLReport } from '@/types/api';
import { format } from 'date-fns';
import { CSVLink } from 'react-csv';
import { BusinessUnitCtx } from '../components/providers/BusinessUnitProvider';
import BusinessUnitSelector from '../reporting/BusinessUnitSelector';
import LoadingSpinner from '../components/LoadingSpinner';
import { getCurrentBusinessUnit } from '@/app/utils/getCurrentBusinessUnit';
import { BusinessUnitContextType } from '@/types/api/businessUnitProvider';
import { useSession } from 'next-auth/react';

const CrashReports = (): JSX.Element => {
	const [crashes, setCrashes] = useState<FNOLReport[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const { data: session } = useSession();
	const { state }: BusinessUnitContextType = useContext(BusinessUnitCtx)!;

	const getCrashReport = async (): Promise<void> => {
		const uid: number = getCurrentBusinessUnit(session, state).id || 0;
		setIsLoading(true);
		setCrashes([]);

		if (uid > 0) {
			const response: Response = await fetch(
				`${BaseUrl}/portal/report/fnol?uid=${uid}`,
				{
					headers: await getApiHeaders(),
					method: 'GET',
				}
			);

			if (!response.ok) {
				const res = await response.json();
				if (res.errorMessage == 'Unauthorised') fullSignOut();
				throw new Error('Network response was not ok');
			}

			const crashesRes = await response.json();
			const { report } = crashesRes;
			setCrashes(report || []);
		}

		setIsLoading(false);
	};

	useEffect(() => {
		getCrashReport();
	}, [session, state]);

	const dtMask: string = 'dd/MM/yyyy HH:mm';

	return (
		<div className='px-12'>
			<div className='flex flex-col bg-white rounded-2xl shadow-tile-shadow px-8 py-6 mt-16'>
				<div className='flex flex-row justify-between mb-16'>
					<h1 className='basis-1/8 text-lg font-semibold flex items-center whitespace-pre mr-4'>
						Crash Reports
						{crashes.length > 0 && (
							<span className='text-sm'>
								&nbsp;&nbsp;&nbsp;(Records found:{' '}
								{crashes.length})
							</span>
						)}
					</h1>

					<div className='flex flex-row gap-4 items-center'>
						{crashes.length > 0 && (
							<CSVLink
								className='action-btn mx-2 flex justify-center items-center w-32 max-w-32'
								data={crashes}
								filename={`fnol-${new Date().toISOString()}.csv`}
							>
								Export
							</CSVLink>
						)}
						<BusinessUnitSelector />
					</div>
				</div>

				{isLoading ? (
					<div className='whitespace-nowrap flex flex-row w-28'>
						Loading ...
						<LoadingSpinner />
					</div>
				) : (
					<>
						{crashes.length > 0 ? (
							<div className='max-h-96 overflow-y-auto'>
								<table className='w-full table-auto zebraTable'>
									<thead className='bg-slate-200'>
										<tr className='text-left text-xs font-semibold text-shark'>
											<th className='py-4'>
												Policy Number
											</th>
											<th className='py-4'>
												Member Name
											</th>
											<th className='py-4'>
												Date Reported
											</th>
											{/* <th className='py-4'>Action Taken</th> */}
											{/* <th className='py-4'>Severity</th> */}
											<th className='py-4'>
												Impact Speed
											</th>
											<th className='py-4'>
												Validated Status
											</th>
											{/* <th className='py-4'>Is Liable</th> */}
											<th className='py-4'>View</th>
										</tr>
									</thead>
									<tbody>
										{crashes
											.sort(
												(
													a: FNOLReport,
													b: FNOLReport
												) => {
													const aDate = new Date(
														a.eventDTMLocal
													).getTime();
													const bDate = new Date(
														b.eventDTMLocal
													).getTime();
													// order by date desc
													if (aDate > bDate)
														return -1;
													else if (aDate < bDate)
														return 1;
													else return 0;
												}
											)

											.map(
												(
													crash: FNOLReport,
													idx: number
												) => {
													const {
														policyNo,
														forename,
														surname,
														eventDTMLocal,
														// severity,
														speedMph,
														opid,
														eventDTMEpoch,
														//isLiable,
														status,
													}: FNOLReport = crash;

													/*let isLiable: string = 'TODO';
													if (!crash.isLiable) isLiable = 'false';
													if (crash.isLiable) isLiable = 'true';*/

													return (
														<tr
															className='text-xs text-shark'
															key={idx}
														>
															<td className='py-4'>
																{policyNo}
															</td>
															<td className='py-4'>
																{forename}{' '}
																{surname}
															</td>
															<td className='py-4'>
																{eventDTMLocal &&
																	format(
																		new Date(
																			eventDTMLocal
																		),
																		dtMask
																	)}
															</td>
															{/* <td className='py-4'>No Action Taken</td> */}
															{/* <td className='py-4'>{severity}</td> */}
															<td className='py-4'>
																{speedMph} mph
															</td>
															<td className='py-4'>
																{status}
															</td>
															{/*<td>{isLiable}</td>*/}
															<td className='py-4'>
																<Link
																	href={`/policies/${opid}/crashreports/${eventDTMEpoch}`}
																>
																	<ArrowsPointingOutIcon className='h-4 cursor-pointer' />
																</Link>
															</td>
														</tr>
													);
												}
											)}
									</tbody>
								</table>
							</div>
						) : (
							<p>No crash records found.</p>
						)}
					</>
				)}
			</div>
		</div>
	);
};

export default CrashReports;
