import {
	GetQuarterlyMileageResponseProps,
	QuarterlyMileageObjectProps,
} from '@/types/api/quarterlyMileage';
import { BaseUrl, getApiHeaders, fullSignOut } from '@/app/utils';
import React, { useContext, useEffect, useState } from 'react';
import LoadingSpinner from '../LoadingSpinner';
import Link from 'next/link';
import { BusinessUnitCtx } from '../providers/BusinessUnitProvider';
import { createColumnHelper } from '@tanstack/react-table';
import ReportActionPanel, {
	ActionPolicy,
} from '../actionButtons/ReportActionPanel';
import { ArrowsPointingOutIcon } from '@heroicons/react/24/outline';
import ReportTable from '../table/ReportingTable';
import { getCurrentBusinessUnit } from '@/app/utils/getCurrentBusinessUnit';
import { useSession } from 'next-auth/react';
import { BusinessUnitContextType } from '@/types/api/businessUnitProvider';

const ReportingQuarterlyMileage = (): JSX.Element => {
	const [day90Data, setDay90Data] = useState<QuarterlyMileageObjectProps[]>(
		[]
	);
	const [day180Data, setDay180Data] = useState<QuarterlyMileageObjectProps[]>(
		[]
	);
	const [day270Data, setDay270Data] = useState<QuarterlyMileageObjectProps[]>(
		[]
	);
	const [currentPolicy, setCurrentPolicy] = useState<ActionPolicy | null>(
		null
	);

	const { data: session } = useSession();
	const { state }: BusinessUnitContextType = useContext(BusinessUnitCtx)!;
	const [errMessage, setErrMessage] = useState<string>('');
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isError, setIsError] = useState<boolean>(false);
	const [buName, setBuName] = useState<string>('');

	//const dtMask: string = 'dd/MM/yyyy HH:mm';

	const columnHelper = createColumnHelper<QuarterlyMileageObjectProps>();

	const columns = [
		columnHelper.accessor('policyRef', {
			header: 'Policy Ref.',
			cell: (info) => {
				const opid = info.row.original.opid;
				return (
					<Link
						href={`/policies/${opid}/policyholderdetails`}
						className='hover:underline font-medium'
					>
						{info.getValue()}
					</Link>
				);
			},
		}),

		columnHelper.accessor('surname', {
			header: () => 'Surname',
			cell: (info) => info.getValue(),
		}),

		columnHelper.accessor('brandName', {
			header: () => 'Brand',
			cell: (info) => info.getValue(),
		}),

		columnHelper.accessor('currentMileage', {
			header: () => 'Current Miles',
			cell: (info) => (
				<div className='text-center'>{info.getValue()}</div>
			),
		}),

		columnHelper.accessor('declaredMileage', {
			header: () => 'Declared Miles',
			cell: (info) => (
				<div className='text-center'>{info.getValue()}</div>
			),
		}),

		/*columnHelper.accessor('mileagePredict', {
			header: () => 'Predicted Miles',
			cell: (info) => (
				<div className='text-center'>{info.getValue()}</div>
			),
		}),*/

		columnHelper.accessor('mileagePct', {
			header: () => 'Actual Miles %',
			cell: (info) => (
				<div className='text-center'>{info.getValue().toFixed(2)}</div>
			),
		}),

		columnHelper.accessor('thresholdHitDay', {
			header: () => 'Threshold Hit Day',
			cell: (info) => (
				<div className='text-center'>{info.getValue()}</div>
			),
		}),

		/*columnHelper.accessor('dateWhenHit', {
			header: () => (
				<div className='text-center w-full'>Date When Hit</div>
			),
			cell: (info) => {
				const val: Date = info.getValue();
				return (
					<div className='text-center'>
						{val ? format(new Date(info.getValue()), dtMask) : ''}
					</div>
				);
			},
		}),*/

		columnHelper.display({
			id: 'action',
			header: 'Actions',
			cell: (props) => (
				<div className='text-center'>
					<button
						onClick={() => {
							setCurrentPolicy({
								policyNumber: props.row.original.policyNo,
								opid: props.row.original.opid,
								customActions: [],
							});
						}}
					>
						<ArrowsPointingOutIcon className='h-4' />
					</button>
				</div>
			),
		}),
	];

	const chosenBrokers: string[] = ['a choice', 'aura', 'premium choice'];
	let showReports: boolean = false;
	if (day90Data.length > 0 || day180Data.length > 0 || day270Data.length > 0)
		showReports = true;

	const fetchQuarterlyMileage = async (uid: number): Promise<void> => {
		setIsLoading(true);
		setIsError(false);

		if (uid > 0) {
			const response = await fetch(
				`${BaseUrl}/portal/report/quarterly/mileage?uid=${uid}`,
				{
					method: 'GET',
					headers: await getApiHeaders(),
				}
			);
			if (!response.ok) {
				const res = await response.json();
				if (res.errorMessage == 'Unauthorised') fullSignOut();
				else setErrMessage(res.errorMessage);
				throw new Error('Network response was not ok');
			}
			const resPolicies =
				(await response.json()) as GetQuarterlyMileageResponseProps;
			setDay90Data(resPolicies.report.day90 || []);
			setDay180Data(resPolicies.report.day180 || []);
			setDay270Data(resPolicies.report.day270 || []);
		}

		setIsLoading(false);
	};

	useEffect(() => {
		const currentBU = getCurrentBusinessUnit(session, state);
		fetchQuarterlyMileage(currentBU.id || 0);
		setBuName(currentBU.name || '');
	}, [session, state]);

	return (
		<>
			{isLoading && <LoadingSpinner />}
			{!isLoading && showReports && (
				<>
					<ReportActionPanel policy={currentPolicy} />
					{chosenBrokers.indexOf(buName.toLowerCase()) > -1 ? (
						<div className='w-9/12'>
							90 day policies with 25%+ declared mileage
							<br />
							<ReportTable
								reportName='quarterly-mileage-90day'
								columns={columns}
								data={day90Data}
								sortObj={{ id: 'policyRef', desc: false }}
							/>
							<br />
							<br />
							180 day policies with 50%+ declared mileage
							<br />
							<ReportTable
								reportName='quarterly-mileage-180day'
								columns={columns}
								data={day180Data}
								sortObj={{ id: 'policyRef', desc: false }}
							/>
							<br />
							<br />
							270 day policies with 75%+ declared mileage
							<br />
							<ReportTable
								reportName='quarterly-mileage-270day'
								columns={columns}
								data={day270Data}
								sortObj={{ id: 'policyRef', desc: false }}
							/>
						</div>
					) : (
						<div>Report not available for chosen broker.</div>
					)}
				</>
			)}
			{!isLoading && !isError && !showReports && (
				<p className='text-sm'>No reports found</p>
			)}
			{isError && <p className='text-sm'>{errMessage}</p>}
		</>
	);
};

export default ReportingQuarterlyMileage;
