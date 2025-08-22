export const bloodCompatibility: Record<string, string[]> = {
  'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
  'O+': ['O+', 'A+', 'B+', 'AB+'],
  'A-': ['A-', 'A+', 'AB-', 'AB+'],
  'A+': ['A+', 'AB+'],
  'B-': ['B-', 'B+', 'AB-', 'AB+'],
  'B+': ['B+', 'AB+'],
  'AB-': ['AB-', 'AB+'],
  'AB+': ['AB+']
};

export const canDonateTo = (donorBloodType: string, receiverBloodType: string): boolean => {
  return bloodCompatibility[donorBloodType]?.includes(receiverBloodType) || false;
};

export const validateBloodType = (bloodType: string): boolean => {
  const validTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  return validTypes.includes(bloodType.toUpperCase());
};

export const calculateDaysSinceLastDonation = (lastDonatedDate: Date): number => {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - lastDonatedDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const isDonorEligible = (donor: any): { eligible: boolean; reason?: string; daysUntilEligible?: number } => {
  if (donor.isDrunk) {
    return { eligible: false, reason: 'Cannot donate while under the influence of alcohol' };
  }

  if (donor.isSmoker) {
    return { eligible: false, reason: 'Smokers are not eligible to donate blood' };
  }

  if (donor.age < 18 || donor.age > 65) {
    return { eligible: false, reason: 'Age must be between 18 and 65 years' };
  }

  if (donor.lastDonatedDate) {
    const daysSinceLastDonation = calculateDaysSinceLastDonation(new Date(donor.lastDonatedDate));
    const requiredGap = donor.gender === 'MALE' ? 90 : 120; // Updated to match requirements
    
    if (daysSinceLastDonation < requiredGap) {
      return { 
        eligible: false, 
        reason: `Must wait ${requiredGap} days between donations (${donor.gender === 'MALE' ? 'Male' : 'Female'})`,
        daysUntilEligible: requiredGap - daysSinceLastDonation
      };
    }
  }

  return { eligible: true };
};