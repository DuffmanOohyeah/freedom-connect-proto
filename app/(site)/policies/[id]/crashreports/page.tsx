'use client';
import LoadingSpinner from '@/app/(site)/components/LoadingSpinner';
import { BaseUrl, getApiHeaders } from '@/app/utils';
import {
	CrashDataProps,
	CrashReportsProps,
	DataFieldProps,
} from '@/types/api/crashReports';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import Link from 'next/link';
import { ArrowsPointingOutIcon } from '@heroicons/react/24/outline';

const CrashReports = ({ params }: CrashReportsProps) => {
	const { id: opid } = params;
	const [validCrashes, setValidCrashes] = useState<DataFieldProps[]>([]);
	const [errMsg, setErrMsg] = useState<string>('');
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const getValidCrashes = async (opid: number): Promise<void> => {
		setIsLoading(true);
		setErrMsg('');

		if (opid > 0) {
			const response: Response = await fetch(
				`${BaseUrl}/portal/policy/valid/fnols?opid=${opid}`,
				{
					method: 'GET',
					headers: await getApiHeaders(),
				}
			);

			const data: CrashDataProps = await response.json();

			if (response.status === 200) {
				const { report } = data;
				if (report) setValidCrashes(report);
			} else {
				setValidCrashes([]);
				setErrMsg('Sorry an error occurred.');
			}
		}

		setIsLoading(false);
	};

	useEffect(() => {
		getValidCrashes(Number(opid) || 0);
	}, [opid]);

	const dtMask: string = 'yyyy-MM-dd HH:mm';

	return (
		<div className='px-4'>
			<div className='flex flex-col bg-white rounded-2xl shadow-tile-shadow px-8 py-6 mt-16'>
				<h1 className='text-lg font-semibold mb-10'>Crash Reports</h1>

				{errMsg.length > 0 && <p className='text-sm'>{errMsg}</p>}

				{isLoading === true && (
					<div className='whitespace-nowrap flex flex-row w-28'>
						Loading ...
						<LoadingSpinner />
					</div>
				)}

				{!errMsg.length && !isLoading && (
					<>
						{validCrashes.length > 0 ? (
							<>
								<div className='pb-3 text-sm'>
									This report shows the validated FNOL actions
									for this policy.
								</div>
								<table className='w-full table-auto zebraTable'>
									<thead>
										<tr className='text-left text-xs font-semibold text-shark bg-slate-300'>
											<th className='py-4'>Event Date</th>
											<th className='py-4'>
												Speed (Mph)
											</th>
											<th className='py-4'>GForce</th>
											<th className='py-4'>
												Validated Status
											</th>
											<th className='py-4'>
												Validated Date
											</th>
											<th className='py-4'>
												Validated By
											</th>
											<th className='py-4'>View</th>
										</tr>
									</thead>
									<tbody>
										{validCrashes.map((row, idx) => {
											const {
												eventDTMEpoch,
												speedMph,
												gForce,
												status,
												statusDTM,
												statusBy,
											} = row;
											return (
												<tr
													className='text-xs text-shark'
													key={idx}
												>
													<td className='py-4'>
														{format(
															new Date(
																eventDTMEpoch
															),
															dtMask
														)}
													</td>
													<td className='py-4'>
														{speedMph}
													</td>
													<td className='py-4'>
														{gForce}
													</td>
													<td className='py-4'>
														{status}
													</td>
													<td className='py-4'>
														{format(
															new Date(statusDTM),
															dtMask
														)}
													</td>
													<td className='py-4'>
														{statusBy}
													</td>
													<td className='py-4'>
														<Link
															href={`/policies/${opid}/crashreports/${eventDTMEpoch}`}
														>
															<ArrowsPointingOutIcon className='h-4 cursor-pointer' />
														</Link>
													</td>
												</tr>
											);
										})}
									</tbody>
								</table>
							</>
						) : (
							<div className='text-sm'>
								No validated FNOL records found.
							</div>
						)}
					</>
				)}
			</div>
		</div>
	);
};

export default CrashReports;
