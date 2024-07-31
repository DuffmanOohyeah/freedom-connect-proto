'use client';
import Link from 'next/link';
import { useSelectedLayoutSegments } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useSession } from 'next-auth/react';
import { SessionType } from '@/types/api';
import { GetReportAccess } from '@/types/api/reportAccess';
import { BaseUrl, getApiHeaders } from '@/app/utils';
import LoadingSpinner from '@/app/(site)/components/LoadingSpinner';

const findPath = (path: string, rptAccess: GetReportAccess[]): boolean => {
	let rtnBln: boolean = false;
	if (rptAccess.find((row) => row.portalPath === path)) rtnBln = true; // look for the path in the rpt array
	return rtnBln;
};

const ReportingNavBar = (): JSX.Element => {
	const segments = useSelectedLayoutSegments();
	const [showDeviceButtons, setShowDeviceButtons] = useState<boolean>(true);
	const [showMemberButtons, setShowMemberButtons] = useState<boolean>(false);
	const [showSpeedButtons, setShowSpeedButtons] = useState<boolean>(false);
	const [showRiskButtons, setShowRiskButtons] = useState<boolean>(false);
	const [showMiscButtons, setShowMiscButtons] = useState<boolean>(false);
	const [rptAccess, setRptAccess] = useState<GetReportAccess[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(true);

	const { data: session } = useSession();
	const userSession: SessionType | null = session;
	const userId: number = Number(userSession?.user?.userId) || 0;
	const isMaster: string =
		userSession?.user?.masterUser?.toString() || 'false';

	const closeAllBtnBlocks = () => {
		setShowDeviceButtons(false);
		setShowMemberButtons(false);
		setShowSpeedButtons(false);
		setShowRiskButtons(false);
		setShowMiscButtons(false);
	};

	const showWhichBlock = () => {
		const currentPath = window.location.pathname.slice(1);
		const pathArr = currentPath.split('/');

		if (pathArr.length > 1) {
			const isDevicePath =
				currentPath.search(/device/i) > -1 ? true : false;
			const isMembersPath =
				currentPath.search(/members/i) > -1 ? true : false;
			const isSpeedingPath =
				currentPath.search(/speeding/i) > -1 ? true : false;
			const isRiskPath = currentPath.search(/risk/i) > -1 ? true : false;

			if (isDevicePath) {
				closeAllBtnBlocks();
				setShowDeviceButtons(true);
			} else if (isMembersPath) {
				closeAllBtnBlocks();
				setShowMemberButtons(true);
			} else if (isSpeedingPath) {
				closeAllBtnBlocks();
				setShowSpeedButtons(true);
			} else if (isRiskPath) {
				closeAllBtnBlocks();
				setShowRiskButtons(true);
			}

			if (
				!isDevicePath &&
				!isMembersPath &&
				!isSpeedingPath &&
				!isRiskPath
			) {
				closeAllBtnBlocks();
				setShowMiscButtons(true);
			}
		}
	};

	const getRptAccess = async (userId: number) => {
		const response = await fetch(
			`${BaseUrl}/portal/app/user/resources?ro=1&uid=${userId}`,
			{
				method: 'GET',
				headers: await getApiHeaders(),
			}
		);

		if (response.ok) {
			const query = (await response.json()) as GetReportAccess[];
			setRptAccess(query || []);
		} else setRptAccess([]);
	};

	useEffect(() => {
		if (userId > 0) getRptAccess(userId);
		showWhichBlock();
		setIsLoading(false);
	}, [userId]);

	return (
		<>
			{isLoading ? (
				<LoadingSpinner />
			) : (
				<div className='flex flex-wrap gap-4 whitespace-pre'>
					<div className='bg-slate-200 rounded-lg w-full p-2 text-sm'>
						<Link
							href={'#'}
							onClick={(evt) => {
								evt.preventDefault();
								closeAllBtnBlocks();
								setShowDeviceButtons(!showDeviceButtons);
							}}
							className='hover:underline'
						>
							Device Reports
							<span className='float-right p-1'>
								{showDeviceButtons ? (
									<ChevronDownIcon className='h-4' />
								) : (
									<ChevronRightIcon className='h-4' />
								)}
							</span>
						</Link>
					</div>
					<div
						className={`${
							showDeviceButtons ? 'visible' : 'hidden'
						} w-full flex space-x-4`}
					>
						{(isMaster === 'true' ||
							findPath(
								'/reporting/deviceUnplugged',
								rptAccess
							)) && (
							<Link
								href={'/reporting/deviceUnplugged'}
								className={`${
									segments.includes('deviceUnplugged')
										? 'bg-jagged-ice text-shark'
										: 'bg-shark text-white hover:bg-shark-450'
								} text-xs font-medium  hover:bg-jagged-ice-550 shadow-tile-shadow px-4 py-2 rounded-full flex items-center justify-center cursor-pointer`}
							>
								Device Unplugged
							</Link>
						)}

						{(isMaster === 'true' ||
							findPath(
								'/reporting/deviceMultipleUnplugged',
								rptAccess
							)) && (
							<Link
								href={'/reporting/deviceMultipleUnplugged'}
								className={`${
									segments.includes('deviceMultipleUnplugged')
										? 'bg-jagged-ice text-shark'
										: 'bg-shark text-white hover:bg-shark-450'
								} text-xs font-medium  hover:bg-jagged-ice-550 shadow-tile-shadow px-4 py-2 rounded-full flex items-center justify-center cursor-pointer`}
							>
								Device (Multiple) Unplugged
							</Link>
						)}

						{(isMaster === 'true' ||
							findPath('/reporting/deviceNoData', rptAccess)) && (
							<Link
								href={'/reporting/deviceNoData'}
								className={`${
									segments.includes('deviceNoData')
										? 'bg-jagged-ice text-shark'
										: 'bg-shark text-white hover:bg-shark-450'
								} text-xs font-medium  hover:bg-jagged-ice-550 shadow-tile-shadow px-4 py-2 rounded-full flex items-center justify-center cursor-pointer`}
							>
								Device No Data
							</Link>
						)}

						{(isMaster === 'true' ||
							findPath(
								'/reporting/deviceNotInstalled',
								rptAccess
							)) && (
							<Link
								href={'/reporting/deviceNotInstalled'}
								className={`${
									segments.includes('deviceNotInstalled')
										? 'bg-jagged-ice text-shark'
										: 'bg-shark text-white hover:bg-shark-450'
								} text-xs font-medium  hover:bg-jagged-ice-550 shadow-tile-shadow px-4 py-2 rounded-full flex items-center justify-center cursor-pointer`}
							>
								Device Not Installed
							</Link>
						)}
					</div>

					<div className='bg-slate-200 rounded-lg w-full p-2 text-sm'>
						<Link
							href={'#'}
							onClick={(evt) => {
								evt.preventDefault();
								closeAllBtnBlocks();
								setShowMemberButtons(!showMemberButtons);
							}}
							className='hover:underline'
						>
							Member Reports
							<span className='float-right p-1'>
								{showMemberButtons ? (
									<ChevronDownIcon className='h-4' />
								) : (
									<ChevronRightIcon className='h-4' />
								)}
							</span>
						</Link>
					</div>
					<div
						className={`${
							showMemberButtons ? 'visible' : 'hidden'
						} w-full flex space-x-4`}
					>
						{(isMaster === 'true' ||
							findPath('/reporting/allMembers', rptAccess)) && (
							<Link
								href={'/reporting/allMembers'}
								className={`${
									segments.includes('allMembers')
										? 'bg-jagged-ice text-shark'
										: 'bg-shark text-white hover:bg-shark-450'
								} text-xs font-medium  hover:bg-jagged-ice-550 shadow-tile-shadow px-4 py-2 rounded-full flex items-center justify-center cursor-pointer`}
							>
								All Members
							</Link>
						)}

						{(isMaster === 'true' ||
							findPath(
								'/reporting/allMembersCancelled',
								rptAccess
							)) && (
							<Link
								href={'/reporting/allMembersCancelled'}
								className={`${
									segments.includes('allMembersCancelled')
										? 'bg-jagged-ice text-shark'
										: 'bg-shark text-white hover:bg-shark-450'
								} text-xs font-medium  hover:bg-jagged-ice-550 shadow-tile-shadow px-4 py-2 rounded-full flex items-center justify-center cursor-pointer`}
							>
								All Members Cancelled
							</Link>
						)}
					</div>

					<div className='bg-slate-200 rounded-lg w-full p-2 text-sm'>
						<Link
							href={'#'}
							onClick={(evt) => {
								evt.preventDefault();
								closeAllBtnBlocks();
								setShowSpeedButtons(!showSpeedButtons);
							}}
							className='hover:underline'
						>
							Speed Reports
							<span className='float-right p-1'>
								{showSpeedButtons ? (
									<ChevronDownIcon className='h-4' />
								) : (
									<ChevronRightIcon className='h-4' />
								)}
							</span>
						</Link>
					</div>
					<div
						className={`${
							showSpeedButtons ? 'visible' : 'hidden'
						} w-full flex space-x-4`}
					>
						{(isMaster === 'true' ||
							findPath(
								'/reporting/excessiveSpeeding',
								rptAccess
							)) && (
							<Link
								href={'/reporting/excessiveSpeeding'}
								className={`${
									segments.includes('excessiveSpeeding')
										? 'bg-jagged-ice text-shark'
										: 'bg-shark text-white hover:bg-shark-450'
								} text-xs font-medium  hover:bg-jagged-ice-550 shadow-tile-shadow px-4 py-2 rounded-full flex items-center justify-center cursor-pointer`}
							>
								Excessive Speeding
							</Link>
						)}

						{(isMaster === 'true' ||
							findPath(
								'/reporting/persistentSpeeding',
								rptAccess
							)) && (
							<Link
								href={'/reporting/persistentSpeeding'}
								className={`${
									segments.includes('persistentSpeeding')
										? 'bg-jagged-ice text-shark'
										: 'bg-shark text-white hover:bg-shark-450'
								} text-xs font-medium  hover:bg-jagged-ice-550 shadow-tile-shadow px-4 py-2 rounded-full flex items-center justify-center cursor-pointer`}
							>
								Persistent Speeding
							</Link>
						)}

						{(isMaster === 'true' ||
							findPath(
								'/reporting/validatedExcessiveSpeeding',
								rptAccess
							)) && (
							<Link
								href={'/reporting/validatedExcessiveSpeeding'}
								className={`${
									segments.includes(
										'validatedExcessiveSpeeding'
									)
										? 'bg-jagged-ice text-shark'
										: 'bg-shark text-white hover:bg-shark-450'
								} text-xs font-medium  hover:bg-jagged-ice-550 shadow-tile-shadow px-4 py-2 rounded-full flex items-center justify-center cursor-pointer`}
							>
								Validated Excessive Speeding
							</Link>
						)}

						{(isMaster === 'true' ||
							findPath(
								'/reporting/validatedPersistentSpeeding',
								rptAccess
							)) && (
							<Link
								href={'/reporting/validatedPersistentSpeeding'}
								className={`${
									segments.includes(
										'validatedPersistentSpeeding'
									)
										? 'bg-jagged-ice text-shark'
										: 'bg-shark text-white hover:bg-shark-450'
								} text-xs font-medium  hover:bg-jagged-ice-550 shadow-tile-shadow px-4 py-2 rounded-full flex items-center justify-center cursor-pointer`}
							>
								Validated Persistent Speeding
							</Link>
						)}
					</div>

					<div className='bg-slate-200 rounded-lg w-full p-2 text-sm'>
						<Link
							href={'#'}
							onClick={(evt) => {
								evt.preventDefault();
								closeAllBtnBlocks();
								setShowRiskButtons(!showRiskButtons);
							}}
							className='hover:underline'
						>
							Risk Reports
							<span className='float-right p-1'>
								{showRiskButtons ? (
									<ChevronDownIcon className='h-4' />
								) : (
									<ChevronRightIcon className='h-4' />
								)}
							</span>
						</Link>
					</div>
					<div
						className={`${
							showRiskButtons ? 'visible' : 'hidden'
						} w-full flex space-x-4`}
					>
						{(isMaster === 'true' ||
							findPath('/reporting/riskMileage', rptAccess)) && (
							<Link
								href={'/reporting/riskMileage'}
								className={`${
									segments.includes('riskMileage')
										? 'bg-jagged-ice text-shark'
										: 'bg-shark text-white hover:bg-shark-450'
								} text-xs font-medium  hover:bg-jagged-ice-550 shadow-tile-shadow px-4 py-2 rounded-full flex items-center justify-center cursor-pointer`}
							>
								Risk Mileage
							</Link>
						)}

						{(isMaster === 'true' ||
							findPath(
								'/reporting/riskBusinessUse',
								rptAccess
							)) && (
							<Link
								href={'/reporting/riskBusinessUse'}
								className={`${
									segments.includes('riskBusinessUse')
										? 'bg-jagged-ice text-shark'
										: 'bg-shark text-white hover:bg-shark-450'
								} text-xs font-medium  hover:bg-jagged-ice-550 shadow-tile-shadow px-4 py-2 rounded-full flex items-center justify-center cursor-pointer`}
							>
								Risk Business Use
							</Link>
						)}

						{(isMaster === 'true' ||
							findPath('/reporting/riskPostcode', rptAccess)) && (
							<Link
								href={'/reporting/riskPostcode'}
								className={`${
									segments.includes('riskPostcode')
										? 'bg-jagged-ice text-shark'
										: 'bg-shark text-white hover:bg-shark-450'
								} text-xs font-medium  hover:bg-jagged-ice-550 shadow-tile-shadow px-4 py-2 rounded-full flex items-center justify-center cursor-pointer`}
							>
								Risk Postcode
							</Link>
						)}
					</div>

					<div className='bg-slate-200 rounded-lg w-full p-2 text-sm'>
						<Link
							href={'#'}
							onClick={(evt) => {
								evt.preventDefault();
								closeAllBtnBlocks();
								setShowMiscButtons(!showMiscButtons);
							}}
							className='hover:underline'
						>
							Misc. Reports
							<span className='float-right p-1'>
								{showMiscButtons ? (
									<ChevronDownIcon className='h-4' />
								) : (
									<ChevronRightIcon className='h-4' />
								)}
							</span>
						</Link>
					</div>
					<div
						className={`${
							showMiscButtons ? 'visible' : 'hidden'
						} w-full flex space-x-4`}
					>
						{(isMaster === 'true' ||
							findPath(
								'/reporting/missingMobileNumbers',
								rptAccess
							)) && (
							<Link
								href={'/reporting/missingMobileNumbers'}
								className={`${
									segments.includes('missingMobileNumbers')
										? 'bg-jagged-ice text-shark'
										: 'bg-shark text-white hover:bg-shark-450'
								} text-xs font-medium  hover:bg-jagged-ice-550 shadow-tile-shadow px-4 py-2 rounded-full flex items-center justify-center cursor-pointer`}
							>
								Missing Mobile Numbers
							</Link>
						)}

						{(isMaster === 'true' ||
							findPath(
								'/reporting/untrackedTripsInKms',
								rptAccess
							)) && (
							<Link
								href={'/reporting/untrackedTripsInKms'}
								className={`${
									segments.includes('untrackedTripsInKms')
										? 'bg-jagged-ice text-shark'
										: 'bg-shark text-white hover:bg-shark-450'
								} text-xs font-medium  hover:bg-jagged-ice-550 shadow-tile-shadow px-4 py-2 rounded-full flex items-center justify-center cursor-pointer`}
							>
								Untracked Trips &gt; 2 kms
							</Link>
						)}

						{(isMaster === 'true' ||
							findPath(
								'/reporting/quarterlyMileage',
								rptAccess
							)) && (
							<Link
								href={'/reporting/quarterlyMileage'}
								className={`${
									segments.includes('quarterlyMileage')
										? 'bg-jagged-ice text-shark'
										: 'bg-shark text-white hover:bg-shark-450'
								} text-xs font-medium  hover:bg-jagged-ice-550 shadow-tile-shadow px-4 py-2 rounded-full flex items-center justify-center cursor-pointer`}
							>
								Quarterly Mileage
							</Link>
						)}

						{(isMaster === 'true' ||
							findPath(
								'/reporting/telematicsReferrals',
								rptAccess
							)) && (
							<Link
								href={'/reporting/telematicsReferrals'}
								className={`${
									segments.includes('telematicsReferrals')
										? 'bg-jagged-ice text-shark'
										: 'bg-shark text-white hover:bg-shark-450'
								} text-xs font-medium  hover:bg-jagged-ice-550 shadow-tile-shadow px-4 py-2 rounded-full flex items-center justify-center cursor-pointer`}
							>
								Telematics Referrals
							</Link>
						)}


						{(isMaster === 'true' ||
							findPath(
								'/reporting/postcodeHeatmap',
								rptAccess
							)) && (
							<Link
								href={'/reporting/postcodeHeatmap'}
								className={`${
									segments.includes('postcodeHeatmap')
										? 'bg-jagged-ice text-shark'
										: 'bg-shark text-white hover:bg-shark-450'
								} text-xs font-medium  hover:bg-jagged-ice-550 shadow-tile-shadow px-4 py-2 rounded-full flex items-center justify-center cursor-pointer`}
							>
								Postcode Heatmap
							</Link>
						)}
					</div>
				</div>
			)}
		</>
	);
};

export default ReportingNavBar;
