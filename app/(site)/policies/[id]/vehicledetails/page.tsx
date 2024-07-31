'use client';
import { Vehicle } from '@/types/api';
import { useContext, useEffect, useState } from 'react';
import {
	PolicyContextInterface,
	PolicyContext,
} from '../../../components/PolicyContext';
import LoadingCard from '@/app/(site)/components/LoadingCard';

interface CompatiblesProps {
	deviceModelId: number;
	fitment: string;
	model: string;
	supplier: string;
}

const VehicleDetails = (): JSX.Element => {
	const [vehicleDetails, setVehicleDetails] = useState<Vehicle | null>(null);
	const [businessUnit, setBusinessUnit] = useState<string>('');
	const [compatibles, setCompatibles] = useState<CompatiblesProps[]>([]);
	const { policy, isLoading } =
		useContext<PolicyContextInterface>(PolicyContext);

	useEffect(() => {
		if (!isLoading && policy) {
			const { policy: childPolicy, vehicle } = policy;
			if (vehicle) {
				setVehicleDetails(vehicle);
				const { compatibleDevices }: Vehicle = vehicle;
				if (compatibleDevices && compatibleDevices.length)
					setCompatibles(compatibleDevices);
			}
			if (childPolicy) setBusinessUnit(childPolicy.businessUnit);
		}
	}, [policy]);

	return (
		<div className='whitespace-pre p-7'>
			<h1 className='text-lg font-semibold mt-16 mb-8'>
				Vehicle Details
			</h1>
			<div className='flex flex-wrap gap-8 mb-8'>
				{isLoading && !vehicleDetails && <LoadingCard />}
				{vehicleDetails && (
					<>
						{vehicleDetails?.vrm && (
							<div className='flex flex-col gap-1 bg-white rounded-2xl shadow-tile-shadow pl-8 pr-24 py-6'>
								<h4 className='text-xs'>Registration</h4>
								<h1 className='font-semibold'>
									{vehicleDetails.vrm}
								</h1>
							</div>
						)}

						{vehicleDetails?.make && (
							<div className='flex flex-col gap-1 bg-white rounded-2xl shadow-tile-shadow pl-8 pr-24 py-6'>
								<h4 className='text-xs'>Manufacturer</h4>
								<h1 className='font-semibold'>
									{vehicleDetails.make}
								</h1>
							</div>
						)}

						{vehicleDetails?.model && (
							<div className='flex flex-col gap-1 bg-white rounded-2xl shadow-tile-shadow pl-8 pr-24 py-6'>
								<h4 className='text-xs'>Model</h4>
								<h1 className='font-semibold'>
									{vehicleDetails.model}
								</h1>
							</div>
						)}

						{vehicleDetails?.year && (
							<div className='flex flex-col gap-1 bg-white rounded-2xl shadow-tile-shadow pl-8 pr-24 py-6'>
								<h4 className='text-xs'>Year</h4>
								<h1 className='font-semibold'>
									{vehicleDetails.year}
								</h1>
							</div>
						)}

						{businessUnit && (
							<div className='flex flex-col gap-1 bg-white rounded-2xl shadow-tile-shadow pl-8 pr-24 py-6'>
								<h4 className='text-xs'>Business Unit</h4>
								<h1 className='font-semibold'>
									{businessUnit}
								</h1>
							</div>
						)}

						{vehicleDetails?.motDue && (
							<div className='flex flex-col gap-1 bg-white rounded-2xl shadow-tile-shadow pl-8 pr-24 py-6'>
								<h4 className='text-xs'>MOT Due</h4>
								<h1 className='font-semibold'>
									{vehicleDetails.motDue}
								</h1>
							</div>
						)}

						{vehicleDetails?.taxDue && (
							<div className='flex flex-col gap-1 bg-white rounded-2xl shadow-tile-shadow pl-8 pr-24 py-6'>
								<h4 className='text-xs'>Tax Due</h4>
								<h1 className='font-semibold'>
									{vehicleDetails.taxDue}
								</h1>
							</div>
						)}

						{vehicleDetails?.abiCode && (
							<div className='flex flex-col gap-1 bg-white rounded-2xl shadow-tile-shadow pl-8 pr-24 py-6'>
								<h4 className='text-xs'>ABI Code</h4>
								<h1 className='font-semibold'>
									{vehicleDetails.abiCode}
								</h1>
							</div>
						)}

						{compatibles.length > 0 && (
							<div className='flex flex-col gap-1 bg-white rounded-2xl shadow-tile-shadow pl-8 pr-24 py-6'>
								<h4 className='text-xs pb-3'>
									Compatible Devices
								</h4>
								{compatibles.map((row, idx) => {
									const {
										fitment,
										model,
										supplier,
									}: CompatiblesProps = row;
									return (
										<div
											key={idx}
											className='flex flex-col text-xs gap-1 pb-3'
										>
											<div className='flex items-center'>
												<span className='w-1/2 font-normal'>
													Fitment:
												</span>
												<span className='w-1/2 font-semibold'>
													{fitment}
												</span>
											</div>
											<div className='flex items-center'>
												<span className='w-1/2 font-normal'>
													Model:
												</span>
												<span className='w-1/2 font-semibold'>
													{model}
												</span>
											</div>
											<div className='flex items-center'>
												<span className='w-1/2 font-normal'>
													Supplier:
												</span>
												<span className='w-1/2 font-semibold'>
													{supplier}
												</span>
											</div>
										</div>
									);
								})}
							</div>
						)}
					</>
				)}
			</div>
		</div>
	);
};

export default VehicleDetails;
